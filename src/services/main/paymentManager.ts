import { bech32 } from 'bech32'
import crypto from 'crypto'
import Storage from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'
import { MainSettings } from './settings.js'
import { InboundOptionals, defaultInvoiceExpiry } from '../storage/paymentStorage.js'
import { LightningHandler } from '../lnd/index.js'
import { Application } from '../storage/entity/Application.js'
import { getLogger } from '../helpers/logger.js'
import { UserReceivingAddress } from '../storage/entity/UserReceivingAddress.js'
import { AddressPaidCb, InvoicePaidCb, PaidInvoice } from '../lnd/settings.js'
import { UserReceivingInvoice } from '../storage/entity/UserReceivingInvoice.js'
import { SendCoinsResponse } from '../../../proto/lnd/lightning.js'
interface UserOperationInfo {
    serial_id: number
    paid_amount: number
    paid_at_unix: number
    invoice?: string
    address?: string
    from_user?: { user_id: string }
    to_user?: { user_id: string }
    service_fee?: number
    service_fees?: number
    routing_fees?: number
    chain_fees?: number
}
const defaultLnurlPayMetadata = `[["text/plain", "lnurl pay to Lightning.pub"]]`

export default class {

    storage: Storage
    settings: MainSettings
    lnd: LightningHandler
    addressPaidCb: AddressPaidCb
    invoicePaidCb: InvoicePaidCb
    constructor(storage: Storage, lnd: LightningHandler, settings: MainSettings, addressPaidCb: AddressPaidCb, invoicePaidCb: InvoicePaidCb) {
        this.storage = storage
        this.settings = settings
        this.lnd = lnd
        this.addressPaidCb = addressPaidCb
        this.invoicePaidCb = invoicePaidCb
    }

    getServiceFee(action: Types.UserOperationType, amount: number, appUser: boolean): number {
        switch (action) {
            case Types.UserOperationType.INCOMING_TX:
                return Math.ceil(this.settings.incomingTxFee * amount)
            case Types.UserOperationType.OUTGOING_TX:
                return Math.ceil(this.settings.outgoingTxFee * amount)
            case Types.UserOperationType.INCOMING_INVOICE:
                if (appUser) {
                    return Math.ceil(this.settings.incomingAppUserInvoiceFee * amount)
                }
                return Math.ceil(this.settings.incomingAppInvoiceFee * amount)
            case Types.UserOperationType.OUTGOING_INVOICE:
                if (appUser) {
                    return Math.ceil(this.settings.outgoingAppUserInvoiceFee * amount)
                }
                return Math.ceil(this.settings.outgoingAppInvoiceFee * amount)
            case Types.UserOperationType.OUTGOING_USER_TO_USER || Types.UserOperationType.INCOMING_USER_TO_USER:
                if (appUser) {
                    return Math.ceil(this.settings.userToUserFee * amount)
                }
                return Math.ceil(this.settings.appToUserFee * amount)
            default:
                throw new Error("Unknown service action type")
        }
    }

    async SetMockInvoiceAsPaid(req: Types.SetMockInvoiceAsPaidRequest) {
        if (!this.settings.lndSettings.mockLnd) {
            throw new Error("mock disabled, cannot set invoice as paid")
        }
        await this.lnd.SetMockInvoiceAsPaid(req.invoice, req.amount)
    }

    async SetMockUserBalance(userId: string, balance: number) {
        if (!this.settings.lndSettings.mockLnd) {
            throw new Error("mock disabled, cannot set invoice as paid")
        }
        getLogger({})("setting mock balance...")
        await this.storage.userStorage.UpdateUser(userId, { balance_sats: balance })
    }

    async NewAddress(ctx: Types.UserContext, req: Types.NewAddressRequest): Promise<Types.NewAddressResponse> {
        const app = await this.storage.applicationStorage.GetApplication(ctx.app_id)
        const res = await this.lnd.NewAddress(req.addressType)
        const userAddress = await this.storage.paymentStorage.AddUserAddress(ctx.user_id, res.address, { linkedApplication: app })
        return {
            address: userAddress.address
        }
    }

    async NewInvoice(userId: string, req: Types.NewInvoiceRequest, options: InboundOptionals = { expiry: defaultInvoiceExpiry }): Promise<Types.NewInvoiceResponse> {
        const user = await this.storage.userStorage.GetUser(userId)
        const res = await this.lnd.NewInvoice(req.amountSats, req.memo, options.expiry)
        const userInvoice = await this.storage.paymentStorage.AddUserInvoice(user, res.payRequest, options)
        return {
            invoice: userInvoice.invoice
        }
    }

    async lockUserWithMinBalance(userId: string, minBalance: number) {
        return this.storage.StartTransaction(async tx => {
            const user = await this.storage.userStorage.GetUser(userId, tx)
            if (user.locked) {
                throw new Error("user is already withdrawing")
            }
            if (user.balance_sats < minBalance) {
                throw new Error("insufficient balance")
            }
            // this call will fail if the user is already locked
            await this.storage.userStorage.LockUser(userId, tx)
        })
    }

    GetMaxPayableInvoice(balance: number, appUser: boolean): number {
        let maxWithinServiceFee = 0
        if (appUser) {
            maxWithinServiceFee = Math.max(0, Math.floor(balance * (1 - this.settings.outgoingAppUserInvoiceFee)))
        } else {
            maxWithinServiceFee = Math.max(0, Math.floor(balance * (1 - this.settings.outgoingAppInvoiceFee)))
        }
        return this.lnd.GetMaxWithinLimit(maxWithinServiceFee)
    }
    async DecodeInvoice(req: Types.DecodeInvoiceRequest): Promise<Types.DecodeInvoiceResponse> {
        const decoded = await this.lnd.DecodeInvoice(req.invoice)
        return {
            amount: Number(decoded.numSatoshis)
        }
    }

    async PayInvoice(userId: string, req: Types.PayInvoiceRequest, linkedApplication: Application): Promise<Types.PayInvoiceResponse> {
        const decoded = await this.lnd.DecodeInvoice(req.invoice)
        if (decoded.numSatoshis !== 0 && req.amount !== 0) {
            throw new Error("invoice has value, do not provide amount the the request")
        }
        if (decoded.numSatoshis === 0 && req.amount === 0) {
            throw new Error("invoice has no value, an amount must be provided in the request")
        }
        const payAmount = req.amount !== 0 ? req.amount : Number(decoded.numSatoshis)
        const isAppUserPayment = userId !== linkedApplication.owner.user_id
        const serviceFee = this.getServiceFee(Types.UserOperationType.OUTGOING_INVOICE, payAmount, isAppUserPayment)
        const totalAmountToDecrement = payAmount + serviceFee
        const internalInvoice = await this.storage.paymentStorage.GetInvoiceOwner(req.invoice)
        let payment: PaidInvoice | null = null
        if (!internalInvoice) {
            const routingFeeLimit = this.lnd.GetFeeLimitAmount(payAmount)
            await this.lockUserWithMinBalance(userId, totalAmountToDecrement + routingFeeLimit)
            try {
                payment = await this.lnd.PayInvoice(req.invoice, req.amount, routingFeeLimit)
                await this.storage.userStorage.DecrementUserBalance(userId, totalAmountToDecrement + payment.feeSat)
                await this.storage.userStorage.UnlockUser(userId)
            } catch (err) {
                await this.storage.userStorage.UnlockUser(userId)
                throw err
            }
        } else {
            if (internalInvoice.paid_at_unix > 0) {
                throw new Error("this invoice was already paid")
            }
            await this.storage.userStorage.DecrementUserBalance(userId, totalAmountToDecrement)
            this.invoicePaidCb(req.invoice, payAmount, true)
        }
        if (isAppUserPayment && serviceFee > 0) {
            await this.storage.userStorage.IncrementUserBalance(linkedApplication.owner.user_id, serviceFee)
        }
        const routingFees = payment ? payment.feeSat : 0
        const newPayment = await this.storage.paymentStorage.AddUserInvoicePayment(userId, req.invoice, payAmount, routingFees, serviceFee, !!internalInvoice)
        return {
            preimage: payment ? payment.paymentPreimage : "",
            amount_paid: payment ? Number(payment.valueSat) : payAmount,
            operation_id: `${+Types.UserOperationType.OUTGOING_INVOICE}-${newPayment.serial_id}`,
            network_fee: routingFees,
            service_fee: serviceFee
        }
    }


    async PayAddress(ctx: Types.UserContext, req: Types.PayAddressRequest): Promise<Types.PayAddressResponse> {
        const app = await this.storage.applicationStorage.GetApplication(ctx.app_id)
        const serviceFee = this.getServiceFee(Types.UserOperationType.OUTGOING_TX, req.amoutSats, false)
        const isAppUserPayment = ctx.user_id !== app.owner.user_id
        const internalAddress = await this.storage.paymentStorage.GetAddressOwner(req.address)
        let txId = ""
        let chainFees = 0
        if (!internalAddress) {
            const estimate = await this.lnd.EstimateChainFees(req.address, req.amoutSats, 1)
            const vBytes = Math.ceil(Number(estimate.feeSat / estimate.satPerVbyte))
            chainFees = vBytes * req.satsPerVByte
            const total = req.amoutSats + chainFees
            await this.lockUserWithMinBalance(ctx.user_id, total + serviceFee)
            try {
                const payment = await this.lnd.PayAddress(req.address, req.amoutSats, req.satsPerVByte)
                txId = payment.txid
                await this.storage.userStorage.DecrementUserBalance(ctx.user_id, total + serviceFee)
                await this.storage.userStorage.UnlockUser(ctx.user_id)
            } catch (err) {
                await this.storage.userStorage.UnlockUser(ctx.user_id)
                throw err
            }
        } else {
            await this.storage.userStorage.DecrementUserBalance(ctx.user_id, req.amoutSats + serviceFee)
            this.addressPaidCb({ hash: crypto.randomBytes(32).toString("hex"), index: 0 }, req.address, req.amoutSats, true)
        }

        if (isAppUserPayment && serviceFee > 0) {
            await this.storage.userStorage.IncrementUserBalance(app.owner.user_id, serviceFee)
        }
        const newTx = await this.storage.paymentStorage.AddUserTransactionPayment(ctx.user_id, req.address, txId, 0, req.amoutSats, chainFees, serviceFee, !!internalAddress)
        return {
            txId: txId,
            operation_id: `${+Types.UserOperationType.OUTGOING_TX}-${newTx.serial_id}`,
            network_fee: chainFees,
            service_fee: serviceFee
        }
    }

    balanceCheckUrl(k1: string): string {
        return `${this.settings.serviceUrl}/api/guest/lnurl_withdraw/info?k1=${k1}`
    }

    async GetLnurlWithdrawLink(ctx: Types.UserContext): Promise<Types.LnurlLinkResponse> {
        const app = await this.storage.applicationStorage.GetApplication(ctx.app_id)
        const key = await this.storage.paymentStorage.AddUserEphemeralKey(ctx.user_id, 'balanceCheck', app)
        return {
            lnurl: this.encodeLnurl(this.balanceCheckUrl(key.key)),
            k1: key.key
        }
    }

    async GetLnurlWithdrawInfo(balanceCheckK1: string): Promise<Types.LnurlWithdrawInfoResponse> {
        throw new Error("LNURL withdraw currenlty not supported for non application users")
        /*const key = await this.storage.paymentStorage.UseUserEphemeralKey(balanceCheckK1, 'balanceCheck')
        const maxWithdrawable = this.GetMaxPayableInvoice(key.user.balance_sats)
        const callbackK1 = await this.storage.paymentStorage.AddUserEphemeralKey(key.user.user_id, 'withdraw')
        const newBalanceCheckK1 = await this.storage.paymentStorage.AddUserEphemeralKey(key.user.user_id, 'balanceCheck')
        const payInfoK1 = await this.storage.paymentStorage.AddUserEphemeralKey(key.user.user_id, 'pay')
        return {
            tag: "withdrawRequest",
            callback: `${this.settings.serviceUrl}/api/guest/lnurl_withdraw/handle`,
            defaultDescription: "lnurl withdraw from lightning.pub",
            k1: callbackK1.key,
            maxWithdrawable: maxWithdrawable * 1000,
            minWithdrawable: 10000,
            balanceCheck: this.balanceCheckUrl(newBalanceCheckK1.key),
            payLink: `${this.settings.serviceUrl}/api/guest/lnurl_pay/info?k1=${payInfoK1.key}`,
        }*/
    }

    async HandleLnurlWithdraw(k1: string, invoice: string): Promise<void> {
        const key = await this.storage.paymentStorage.UseUserEphemeralKey(k1, 'withdraw')
        if (!key.linkedApplication) {
            throw new Error("found lnurl key entry with no linked application")
        }
        try {
            await this.PayInvoice(key.user.user_id, { invoice: invoice, amount: 0 }, key.linkedApplication)
        } catch (err: any) {
            console.error("error sending payment for lnurl withdraw to ", key.user.user_id, err)
            throw new Error("failed to pay invoice")
        }
    }

    lnurlPayUrl(k1: string): string {
        return `${this.settings.serviceUrl}/api/guest/lnurl_pay/info?k1=${k1}`
    }

    async GetLnurlPayLink(ctx: Types.UserContext): Promise<Types.LnurlLinkResponse> {
        const app = await this.storage.applicationStorage.GetApplication(ctx.app_id)
        const key = await this.storage.paymentStorage.AddUserEphemeralKey(ctx.user_id, 'pay', app)
        return {
            lnurl: this.encodeLnurl(this.lnurlPayUrl(key.key)),
            k1: key.key
        }
    }

    async GetLnurlPayInfoFromUser(userId: string, linkedApplication: Application, baseUrl?: string): Promise<Types.LnurlPayInfoResponse> {
        const payK1 = await this.storage.paymentStorage.AddUserEphemeralKey(userId, 'pay', linkedApplication)
        const url = baseUrl ? baseUrl : `${this.settings.serviceUrl}/api/guest/lnurl_pay/handle`
        const { remote } = await this.lnd.ChannelBalance()
        return {
            tag: 'payRequest',
            callback: `${url}?k1=${payK1.key}`,
            maxSendable: remote * 1000,
            minSendable: 10000,
            metadata: defaultLnurlPayMetadata
        }
    }

    async GetLnurlPayInfo(payInfoK1: string): Promise<Types.LnurlPayInfoResponse> {
        const key = await this.storage.paymentStorage.UseUserEphemeralKey(payInfoK1, 'pay', true)
        const { remote } = await this.lnd.ChannelBalance()
        return {
            tag: 'payRequest',
            callback: `${this.settings.serviceUrl}/api/guest/lnurl_pay/handle?k1=${payInfoK1}`,
            maxSendable: remote * 1000,
            minSendable: 10000,
            metadata: defaultLnurlPayMetadata
        }
    }

    async HandleLnurlPay(payK1: string, amountMillis: number): Promise<Types.HandleLnurlPayResponse> {
        const key = await this.storage.paymentStorage.UseUserEphemeralKey(payK1, 'pay', true)
        const sats = amountMillis / 1000
        if (!Number.isInteger(sats)) {
            throw new Error("millisats amount must be integer sats amount")
        }
        if (!key.linkedApplication) {
            throw new Error("cannot handle lnurl for non application user")
        }
        const invoice = await this.NewInvoice(key.user.user_id, {
            amountSats: sats,
            memo: defaultLnurlPayMetadata
        }, { expiry: defaultInvoiceExpiry, linkedApplication: key.linkedApplication })
        return {
            pr: invoice.invoice,
            routes: []
        }
    }

    async OpenChannel(userId: string, req: Types.OpenChannelRequest): Promise<Types.OpenChannelResponse> { throw new Error("WIP") }

    mapOperations(operations: UserOperationInfo[], type: Types.UserOperationType, inbound: boolean): Types.UserOperations {
        if (operations.length === 0) {
            return {
                fromIndex: 0,
                toIndex: 0,
                operations: []
            }
        }
        return {
            toIndex: operations[0].serial_id,
            fromIndex: operations[operations.length - 1].serial_id,
            operations: operations.map((o: UserOperationInfo): Types.UserOperation => {
                let identifier = ""
                if (o.invoice) {
                    identifier = o.invoice
                } else if (o.address) {
                    identifier = o.address
                } else if (type === Types.UserOperationType.INCOMING_USER_TO_USER && o.from_user) {
                    identifier = o.from_user.user_id
                } else if (type === Types.UserOperationType.OUTGOING_INVOICE && o.to_user) {
                    identifier = o.to_user.user_id
                }
                return {
                    inbound,
                    type,
                    amount: o.paid_amount,
                    paidAtUnix: o.paid_at_unix,
                    identifier,
                    operationId: `${+type}-${o.serial_id}`,
                    network_fee: o.chain_fees || o.routing_fees || 0,
                    service_fee: o.service_fee || o.service_fees || 0
                }
            })
        }
    }

    async GetUserOperations(userId: string, req: Types.GetUserOperationsRequest): Promise<Types.GetUserOperationsResponse> {
        const [outgoingInvoices, outgoingTransactions, incomingInvoices, incomingTransactions, incomingUserToUser, outgoingUserToUser] = await Promise.all([
            this.storage.paymentStorage.GetUserInvoicePayments(userId, req.latestOutgoingInvoice),
            this.storage.paymentStorage.GetUserTransactionPayments(userId, req.latestOutgoingTx),
            this.storage.paymentStorage.GetUserInvoicesFlaggedAsPaid(userId, req.latestIncomingInvoice),
            this.storage.paymentStorage.GetUserReceivingTransactions(userId, req.latestIncomingTx),
            this.storage.paymentStorage.GetUserToUserReceivedPayments(userId, req.latestIncomingUserToUserPayment),
            this.storage.paymentStorage.GetUserToUserSentPayments(userId, req.latestOutgoingUserToUserPayment)
        ])
        return {
            latestIncomingInvoiceOperations: this.mapOperations(incomingInvoices, Types.UserOperationType.INCOMING_INVOICE, true),
            latestIncomingTxOperations: this.mapOperations(incomingTransactions, Types.UserOperationType.INCOMING_TX, true),
            latestOutgoingInvoiceOperations: this.mapOperations(outgoingInvoices, Types.UserOperationType.OUTGOING_INVOICE, false),
            latestOutgoingTxOperations: this.mapOperations(outgoingTransactions, Types.UserOperationType.OUTGOING_TX, false),
            latestIncomingUserToUserPayemnts: this.mapOperations(incomingUserToUser, Types.UserOperationType.INCOMING_USER_TO_USER, true),
            latestOutgoingUserToUserPayemnts: this.mapOperations(outgoingUserToUser, Types.UserOperationType.OUTGOING_USER_TO_USER, false)
        }
    }

    async SendUserToUserPayment(fromUserId: string, toUserId: string, amount: number, linkedApplication: Application): Promise<number> {
        let sentAmount = 0
        await this.storage.StartTransaction(async tx => {
            const fromUser = await this.storage.userStorage.GetUser(fromUserId, tx)
            const toUser = await this.storage.userStorage.GetUser(toUserId, tx)
            if (fromUser.balance_sats < amount) {
                throw new Error("not enough balance to send payment")
            }
            const isAppUserPayment = fromUser.user_id !== linkedApplication.owner.user_id
            let fee = this.getServiceFee(Types.UserOperationType.OUTGOING_USER_TO_USER, amount, isAppUserPayment)
            const toIncrement = amount - fee
            await this.storage.userStorage.DecrementUserBalance(fromUser.user_id, amount, tx)
            await this.storage.userStorage.IncrementUserBalance(toUser.user_id, toIncrement, tx)
            await this.storage.paymentStorage.AddUserToUserPayment(fromUserId, toUserId, amount, fee)
            if (isAppUserPayment && fee > 0) {
                await this.storage.userStorage.IncrementUserBalance(linkedApplication.owner.user_id, fee)
            }
            sentAmount = toIncrement
        })
        return sentAmount
    }

    encodeLnurl(base: string) {
        if (!base || typeof base !== 'string') {
            throw new Error("provided string for lnurl encode is not a string or is an empty string")
        }
        let words = bech32.toWords(Buffer.from(base, 'utf8'));
        return bech32.encode('lnurl', words, 1023);
    }
}

