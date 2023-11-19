import crypto from 'crypto'
import fetch from "node-fetch"
import Storage, { LoadStorageSettingsFromEnv } from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'
import { EnvMustBeInteger, EnvMustBeNonEmptyString } from '../helpers/envParser.js'
import ProductManager from './productManager.js'
import ApplicationManager from './applicationManager.js'
import PaymentManager from './paymentManager.js'
import { MainSettings } from './settings.js'
import NewLightningHandler, { LoadLndSettingsFromEnv, LightningHandler } from "../lnd/index.js"
import { AddressPaidCb, InvoicePaidCb } from "../lnd/settings.js"
import { getLogger, PubLogger } from "../helpers/logger.js"
import AppUserManager from "./appUserManager.js"
export const LoadMainSettingsFromEnv = (test = false): MainSettings => {
    return {
        lndSettings: LoadLndSettingsFromEnv(test),
        storageSettings: LoadStorageSettingsFromEnv(test),
        jwtSecret: EnvMustBeNonEmptyString("JWT_SECRET"),
        incomingTxFee: EnvMustBeInteger("INCOMING_CHAIN_FEE_ROOT_BPS") / 10000,
        outgoingTxFee: EnvMustBeInteger("OUTGOING_CHAIN_FEE_ROOT_BPS") / 10000,
        incomingAppInvoiceFee: EnvMustBeInteger("INCOMING_INVOICE_FEE_ROOT_BPS") / 10000,
        outgoingAppInvoiceFee: EnvMustBeInteger("OUTGOING_INVOICE_FEE_ROOT_BPS") / 10000,
        incomingAppUserInvoiceFee: EnvMustBeInteger("INCOMING_INVOICE_FEE_USER_BPS") / 10000,
        outgoingAppUserInvoiceFee: EnvMustBeInteger("OUTGOING_INVOICE_FEE_USER_BPS") / 10000,
        userToUserFee: EnvMustBeInteger("TX_FEE_INTERNAL_USER_BPS") / 10000,
        appToUserFee: EnvMustBeInteger("TX_FEE_INTERNAL_ROOT_BPS") / 10000,
        serviceUrl: EnvMustBeNonEmptyString("SERVICE_URL"),
        servicePort: EnvMustBeInteger("PORT")
    }
}

type UserOperationsSub = {
    id: string
    newIncomingInvoice: (operation: Types.UserOperation) => void
    newOutgoingInvoice: (operation: Types.UserOperation) => void
    newIncomingTx: (operation: Types.UserOperation) => void
    newOutgoingTx: (operation: Types.UserOperation) => void
}

export default class {
    storage: Storage
    lnd: LightningHandler
    settings: MainSettings
    userOperationsSub: UserOperationsSub | null = null
    productManager: ProductManager
    applicationManager: ApplicationManager
    appUserManager: AppUserManager
    paymentManager: PaymentManager
    paymentSubs: Record<string, ((op: Types.UserOperation) => void) | null> = {}

    constructor(settings: MainSettings) {
        this.settings = settings
        this.storage = new Storage(settings.storageSettings)
        this.lnd = NewLightningHandler(settings.lndSettings, this.addressPaidCb, this.invoicePaidCb)

        this.paymentManager = new PaymentManager(this.storage, this.lnd, this.settings, this.addressPaidCb, this.invoicePaidCb)
        this.productManager = new ProductManager(this.storage, this.paymentManager, this.settings)
        this.applicationManager = new ApplicationManager(this.storage, this.settings, this.paymentManager)
        this.appUserManager = new AppUserManager(this.storage, this.settings, this.applicationManager)
    }

    addressPaidCb: AddressPaidCb = (txOutput, address, amount, internal) => {
        this.storage.StartTransaction(async tx => {
            const userAddress = await this.storage.paymentStorage.GetAddressOwner(address, tx)
            if (!userAddress) { return }
            const log = getLogger({})
            if (!userAddress.linkedApplication) {
                log("ERROR", "an address was paid, that has no linked application")
                return
            }
            const isAppUserPayment = userAddress.user.user_id !== userAddress.linkedApplication.owner.user_id
            let fee = this.paymentManager.getServiceFee(Types.UserOperationType.INCOMING_TX, amount, isAppUserPayment)
            if (userAddress.linkedApplication && userAddress.linkedApplication.owner.user_id === userAddress.user.user_id) {
                fee = 0
            }
            try {
                // This call will fail if the transaction is already registered
                const addedTx = await this.storage.paymentStorage.AddAddressReceivingTransaction(userAddress, txOutput.hash, txOutput.index, amount, fee, internal, tx)
                await this.storage.userStorage.IncrementUserBalance(userAddress.user.user_id, addedTx.paid_amount - fee, tx)
                const operationId = `${+Types.UserOperationType.INCOMING_TX}-${userAddress.serial_id}`
                this.triggerSubs(userAddress.user.user_id, { amount, paidAtUnix: Date.now() / 1000, inbound: true, type: Types.UserOperationType.INCOMING_TX, identifier: userAddress.address, operationId, network_fee: 0, service_fee: fee })
            } catch {

            }
        })
    }

    invoicePaidCb: InvoicePaidCb = (paymentRequest, amount, internal) => {
        this.storage.StartTransaction(async tx => {
            const log = getLogger({})
            const userInvoice = await this.storage.paymentStorage.GetInvoiceOwner(paymentRequest, tx)
            if (!userInvoice) { return }
            if (userInvoice.paid_at_unix > 0 && internal) { log("cannot pay internally, invoice already paid"); return }
            if (userInvoice.paid_at_unix > 0 && !internal && userInvoice.paidByLnd) { log("invoice already paid by lnd"); return }
            if (!userInvoice.linkedApplication) {
                log("ERROR", "an invoice was paid, that has no linked application")
                return
            }
            const isAppUserPayment = userInvoice.user.user_id !== userInvoice.linkedApplication.owner.user_id
            let fee = this.paymentManager.getServiceFee(Types.UserOperationType.INCOMING_INVOICE, amount, isAppUserPayment)
            if (userInvoice.linkedApplication && userInvoice.linkedApplication.owner.user_id === userInvoice.user.user_id) {
                fee = 0
            }
            try {
                await this.storage.paymentStorage.FlagInvoiceAsPaid(userInvoice, amount, fee, internal, tx)

                await this.storage.userStorage.IncrementUserBalance(userInvoice.user.user_id, amount - fee, tx)
                if (isAppUserPayment && fee > 0) {
                    await this.storage.userStorage.IncrementUserBalance(userInvoice.linkedApplication.owner.user_id, fee, tx)
                }

                await this.triggerPaidCallback(log, userInvoice.callbackUrl)
                const operationId = `${+Types.UserOperationType.INCOMING_INVOICE}-${userInvoice.serial_id}`
                this.triggerSubs(userInvoice.user.user_id, { amount, paidAtUnix: Date.now() / 1000, inbound: true, type: Types.UserOperationType.INCOMING_INVOICE, identifier: userInvoice.invoice, operationId, network_fee: 0, service_fee: fee })
                log("paid invoice processed successfully")
            } catch (err: any) {
                log("ERROR", "cannot process paid invoice", err.message || "")
            }
        })
    }

    async triggerPaidCallback(log: PubLogger, url: string) {
        if (!url) {
            return
        }
        try {
            await fetch(url + "&ok=true")
        } catch (err: any) {
            log("error sending paid callback for invoice", err.message || "")
        }
    }

    triggerSubs(userId: string, op: Types.UserOperation) {
        const sub = this.paymentSubs[userId]
        const log = getLogger({ userId })
        if (!sub) {
            log("no sub found for user")
            return
        }
        log("notifyng user of payment")
        sub(op)
    }

    async SubToPayment(ctx: Types.UserContext, cb: (res: Types.LiveUserOperation, err: Error | null) => void) {
        const sub = this.paymentSubs[ctx.user_id]
        const app = await this.storage.applicationStorage.GetApplication(ctx.app_id)
        const log = getLogger({ appName: app.name, userId: ctx.user_id })
        log("subbing  user to payment")
        await this.storage.applicationStorage.GetApplicationUser(app, ctx.app_user_id)
        if (sub) {
            log("overriding user payment  stream")
        }
        this.paymentSubs[ctx.user_id] = (op) => {
            const rand = crypto.randomBytes(16).toString('hex')
            cb({ id: rand, operation: op }, null)
        }
    }
}