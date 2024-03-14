import crypto from 'crypto'
import fetch from "node-fetch"
import Storage, { LoadStorageSettingsFromEnv } from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'
import { EnvMustBeInteger, EnvMustBeNonEmptyString } from '../helpers/envParser.js'
import ProductManager from './productManager.js'
import ApplicationManager from './applicationManager.js'
import PaymentManager, { PendingTx } from './paymentManager.js'
import { MainSettings } from './settings.js'
import NewLightningHandler, { LoadLndSettingsFromEnv, LightningHandler } from "../lnd/index.js"
import { AddressPaidCb, HtlcCb, InvoicePaidCb, NewBlockCb } from "../lnd/settings.js"
import { getLogger, PubLogger } from "../helpers/logger.js"
import AppUserManager from "./appUserManager.js"
import { Application } from '../storage/entity/Application.js'
import { UserReceivingInvoice, ZapInfo } from '../storage/entity/UserReceivingInvoice.js'
import { UnsignedEvent } from '../nostr/tools/event.js'
import { NostrSend } from '../nostr/handler.js'
import MetricsManager from '../metrics/index.js'
import EventsLogManager, { LoggedEvent } from '../storage/eventsLog.js'
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
        servicePort: EnvMustBeInteger("PORT"),
        recordPerformance: process.env.RECORD_PERFORMANCE === 'true' || false,
        skipSanityCheck: process.env.SKIP_SANITY_CHECK === 'true' || false,
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
    metricsManager: MetricsManager
    nostrSend: NostrSend = () => { getLogger({})("nostr send not initialized yet") }

    constructor(settings: MainSettings, storage: Storage) {
        this.settings = settings
        this.storage = storage

        this.lnd = NewLightningHandler(settings.lndSettings, this.addressPaidCb, this.invoicePaidCb, this.newBlockCb, this.htlcCb)
        this.metricsManager = new MetricsManager(this.storage, this.lnd)

        this.paymentManager = new PaymentManager(this.storage, this.lnd, this.settings, this.addressPaidCb, this.invoicePaidCb)
        this.productManager = new ProductManager(this.storage, this.paymentManager, this.settings)
        this.applicationManager = new ApplicationManager(this.storage, this.settings, this.paymentManager)
        this.appUserManager = new AppUserManager(this.storage, this.settings, this.applicationManager)

    }

    attachNostrSend(f: NostrSend) {
        this.nostrSend = f
    }

    htlcCb: HtlcCb = (e) => {
        this.metricsManager.HtlcCb(e)
    }

    newBlockCb: NewBlockCb = (height) => {
        this.NewBlockHandler(height)
    }

    NewBlockHandler = async (height: number) => {
        let confirmed: (PendingTx & { confs: number; })[]
        let log = getLogger({})

        try {
            const balanceEvents = await this.paymentManager.GetLndBalance()
            await this.metricsManager.NewBlockCb(height, balanceEvents)
            confirmed = await this.paymentManager.CheckNewlyConfirmedTxs(height)
        } catch (err: any) {
            log("failed to check transactions after new block", err.message || err)
            return
        }
        await Promise.all(confirmed.map(async c => {
            if (c.type === 'outgoing') {
                await this.storage.paymentStorage.UpdateUserTransactionPayment(c.tx.serial_id, { confs: c.confs })
            } else {
                this.storage.StartTransaction(async tx => {
                    const { user_address: userAddress, paid_amount: amount, service_fee: serviceFee, serial_id: serialId, tx_hash } = c.tx
                    if (!userAddress.linkedApplication) {
                        log("ERROR", "an address was paid, that has no linked application")
                        return
                    }
                    const updateResult = await this.storage.paymentStorage.UpdateAddressReceivingTransaction(serialId, { confs: c.confs }, tx)
                    if (!updateResult.affected) {
                        throw new Error("unable to flag chain transaction as paid")
                    }
                    await this.storage.userStorage.IncrementUserBalance(userAddress.user.user_id, amount - serviceFee, userAddress.address, tx)
                    if (serviceFee > 0) {
                        await this.storage.userStorage.IncrementUserBalance(userAddress.linkedApplication.owner.user_id, serviceFee, 'fees', tx)
                    }
                    const addressData = `${userAddress.address}:${tx_hash}`
                    this.storage.eventsLog.LogEvent({ type: 'address_paid', userId: userAddress.user.user_id, appId: userAddress.linkedApplication.app_id, appUserId: "", balance: userAddress.user.balance_sats, data: addressData, amount })
                    const operationId = `${Types.UserOperationType.INCOMING_TX}-${serialId}`
                    const op = { amount, paidAtUnix: Date.now() / 1000, inbound: true, type: Types.UserOperationType.INCOMING_TX, identifier: userAddress.address, operationId, network_fee: 0, service_fee: serviceFee, confirmed: true, tx_hash: c.tx.tx_hash, internal: c.tx.internal }
                    this.sendOperationToNostr(userAddress.linkedApplication!, userAddress.user.user_id, op)
                })

            }
        }))
    }

    addressPaidCb: AddressPaidCb = (txOutput, address, amount, internal) => {
        this.storage.StartTransaction(async tx => {
            const { blockHeight } = await this.lnd.GetInfo()
            const userAddress = await this.storage.paymentStorage.GetAddressOwner(address, tx)
            if (!userAddress) { return }
            let log = getLogger({})
            if (!userAddress.linkedApplication) {
                log("ERROR", "an address was paid, that has no linked application")
                return
            }
            log = getLogger({ appName: userAddress.linkedApplication.name })
            const isAppUserPayment = userAddress.user.user_id !== userAddress.linkedApplication.owner.user_id
            let fee = this.paymentManager.getServiceFee(Types.UserOperationType.INCOMING_TX, amount, isAppUserPayment)
            if (userAddress.linkedApplication && userAddress.linkedApplication.owner.user_id === userAddress.user.user_id) {
                fee = 0
            }
            try {
                // This call will fail if the transaction is already registered
                const addedTx = await this.storage.paymentStorage.AddAddressReceivingTransaction(userAddress, txOutput.hash, txOutput.index, amount, fee, internal, blockHeight, tx)
                if (internal) {
                    await this.storage.userStorage.IncrementUserBalance(userAddress.user.user_id, addedTx.paid_amount - fee, userAddress.address, tx)
                    if (fee > 0) {
                        await this.storage.userStorage.IncrementUserBalance(userAddress.linkedApplication.owner.user_id, fee, 'fees', tx)
                    }
                    const addressData = `${address}:${txOutput.hash}`
                    this.storage.eventsLog.LogEvent({ type: 'address_paid', userId: userAddress.user.user_id, appId: userAddress.linkedApplication.app_id, appUserId: "", balance: userAddress.user.balance_sats, data: addressData, amount })
                }
                const operationId = `${Types.UserOperationType.INCOMING_TX}-${addedTx.serial_id}`
                const op = { amount, paidAtUnix: Date.now() / 1000, inbound: true, type: Types.UserOperationType.INCOMING_TX, identifier: userAddress.address, operationId, network_fee: 0, service_fee: fee, confirmed: internal, tx_hash: txOutput.hash, internal: false }
                this.sendOperationToNostr(userAddress.linkedApplication, userAddress.user.user_id, op)
            } catch {

            }
        })
    }

    invoicePaidCb: InvoicePaidCb = (paymentRequest, amount, internal) => {
        this.storage.StartTransaction(async tx => {
            let log = getLogger({})
            const userInvoice = await this.storage.paymentStorage.GetInvoiceOwner(paymentRequest, tx)
            if (!userInvoice) { return }
            if (userInvoice.paid_at_unix > 0 && internal) { log("cannot pay internally, invoice already paid"); return }
            if (userInvoice.paid_at_unix > 0 && !internal && userInvoice.paidByLnd) { log("invoice already paid by lnd"); return }
            if (!userInvoice.linkedApplication) {
                log("ERROR", "an invoice was paid, that has no linked application")
                return
            }
            log = getLogger({ appName: userInvoice.linkedApplication.name })
            const isAppUserPayment = userInvoice.user.user_id !== userInvoice.linkedApplication.owner.user_id
            let fee = this.paymentManager.getServiceFee(Types.UserOperationType.INCOMING_INVOICE, amount, isAppUserPayment)
            if (userInvoice.linkedApplication && userInvoice.linkedApplication.owner.user_id === userInvoice.user.user_id) {
                fee = 0
            }
            try {
                await this.storage.paymentStorage.FlagInvoiceAsPaid(userInvoice, amount, fee, internal, tx)
                await this.storage.userStorage.IncrementUserBalance(userInvoice.user.user_id, amount - fee, userInvoice.invoice, tx)
                if (fee > 0) {
                    await this.storage.userStorage.IncrementUserBalance(userInvoice.linkedApplication.owner.user_id, fee, 'fees', tx)
                }
                this.storage.eventsLog.LogEvent({ type: 'invoice_paid', userId: userInvoice.user.user_id, appId: userInvoice.linkedApplication.app_id, appUserId: "", balance: userInvoice.user.balance_sats, data: paymentRequest, amount })
                await this.triggerPaidCallback(log, userInvoice.callbackUrl)
                const operationId = `${Types.UserOperationType.INCOMING_INVOICE}-${userInvoice.serial_id}`
                const op = { amount, paidAtUnix: Date.now() / 1000, inbound: true, type: Types.UserOperationType.INCOMING_INVOICE, identifier: userInvoice.invoice, operationId, network_fee: 0, service_fee: fee, confirmed: true, tx_hash: "", internal }
                this.sendOperationToNostr(userInvoice.linkedApplication, userInvoice.user.user_id, op)
                this.createZapReceipt(log, userInvoice)
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

    async sendOperationToNostr(app: Application, userId: string, op: Types.UserOperation) {
        const user = await this.storage.applicationStorage.GetAppUserFromUser(app, userId)
        if (!user || !user.nostr_public_key) {
            getLogger({ appName: app.name })("cannot notify user, not a nostr user")
            return
        }
        const message: Types.LiveUserOperation & { requestId: string, status: 'OK' } = { operation: op, requestId: "GetLiveUserOperations", status: 'OK' }
        this.nostrSend(app.app_id, { type: 'content', content: JSON.stringify(message), pub: user.nostr_public_key })
    }

    async createZapReceipt(log: PubLogger, invoice: UserReceivingInvoice) {
        const zapInfo = invoice.zap_info
        if (!zapInfo || !invoice.linkedApplication || !invoice.linkedApplication.nostr_public_key) {
            log("no zap info linked to payment")
            return
        }
        const tags = [["p", zapInfo.pub], ["bolt11", invoice.invoice], ["description", zapInfo.description]]
        if (zapInfo.eventId) {
            tags.push(["e", zapInfo.eventId])
        }
        const event: UnsignedEvent = {
            content: "",
            created_at: invoice.paid_at_unix,
            kind: 9735,
            pubkey: invoice.linkedApplication.nostr_public_key,
            tags,
        }
        log({ unsigned: event })
        this.nostrSend(invoice.linkedApplication.app_id, { type: 'event', event })
    }

    async VerifyEventsLog() {
        const events = await this.storage.eventsLog.GetAllLogs()
        const invoices = await this.lnd.GetAllPaidInvoices(1000)
        const payments = await this.lnd.GetAllPayments(1000)

        const users: Record<string, { ts: number, updatedBalance: number }> = {}
        for (let i = 0; i < events.length; i++) {
            const e = events[i]
            if (e.type === 'balance_decrement') {
                users[e.userId] = this.checkUserEntry(e, users[e.userId])
                if (LN_INVOICE_REGEX.test(e.data)) {
                    const paymentEntry = await this.storage.paymentStorage.GetPaymentOwner(e.data)
                    if (!paymentEntry) {
                        throw new Error("payment entry not found for " + e.data)
                    }
                    if (paymentEntry.paid_at_unix === 0) {
                        throw new Error("payment was never paid " + e.data)
                    }
                    if (!paymentEntry.internal) {
                        const entry = payments.payments.find(i => i.paymentRequest === e.data)
                        if (!entry) {
                            throw new Error("payment not found in lnd " + e.data)
                        }
                        if (Number(entry.valueSat) !== e.amount) {
                            throw new Error(`invalid payment amounts got: ${Number(entry.valueSat)} expected: ${e.amount}`)
                        }
                    }
                }
            } else if (e.type === 'balance_increment') {
                users[e.userId] = this.checkUserEntry(e, users[e.userId])
                if (LN_INVOICE_REGEX.test(e.data)) {
                    const invoiceEntry = await this.storage.paymentStorage.GetInvoiceOwner(e.data)
                    if (!invoiceEntry) {
                        throw new Error("invoice entry not found for " + e.data)
                    }
                    if (invoiceEntry.paid_at_unix === 0) {
                        throw new Error("invoice was never paid " + e.data)
                    }
                    if (!invoiceEntry.internal) {
                        const entry = invoices.invoices.find(i => i.paymentRequest === e.data)
                        if (!entry) {
                            throw new Error("invoice not found in lnd " + e.data)
                        }
                        if (Number(entry.amtPaidSat) !== e.amount) {
                            throw new Error(`invalid invoice amounts got: ${Number(entry.amtPaidSat)} expected: ${e.amount}`)
                        }
                    }

                }
            } else {
                await this.storage.paymentStorage.VerifyDbEvent(e)
            }
        }
        await Promise.all(Object.entries(users).map(async ([userId, u]) => {
            const user = await this.storage.userStorage.GetUser(userId)
            if (user.balance_sats !== u.updatedBalance) {
                throw new Error("sanity check on balance failed, expected: " + u.updatedBalance + " found: " + user.balance_sats)
            }
        }))
    }

    checkUserEntry(e: LoggedEvent, u: { ts: number, updatedBalance: number } | undefined) {
        const newEntry = { ts: e.timestampMs, updatedBalance: e.balance + e.amount * (e.type === 'balance_decrement' ? -1 : 1) }
        if (!u) {
            return newEntry
        }
        if (e.timestampMs < u.ts) {
            throw new Error("entry out of order " + e.timestampMs + " " + u.ts)
        }
        if (e.balance !== u.updatedBalance) {
            throw new Error("inconsistent balance update got: " + e.balance + " expected " + u.updatedBalance)
        }
        return newEntry
    }
}

const LN_INVOICE_REGEX = /^(lightning:)?(lnbc|lntb)[0-9a-zA-Z]+$/;