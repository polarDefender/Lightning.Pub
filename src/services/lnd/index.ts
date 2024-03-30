import * as Types from '../../../proto/autogenerated/ts/types.js'
import { GetInfoResponse, NewAddressResponse, AddInvoiceResponse, PayReq, Payment, SendCoinsResponse, EstimateFeeResponse, TransactionDetails, ClosedChannelsResponse, ListChannelsResponse, PendingChannelsResponse, ListInvoiceResponse, ListPaymentsResponse } from '../../../proto/lnd/lightning.js'
import { EnvMustBeNonEmptyString, EnvMustBeInteger, EnvCanBeBoolean } from '../helpers/envParser.js'
import { AddressPaidCb, BalanceInfo, DecodedInvoice, HtlcCb, Invoice, InvoicePaidCb, LndSettings, NewBlockCb, NodeInfo, PaidInvoice } from './settings.js'
import LND from './lnd.js'
import MockLnd from './mock.js'
import { getLogger } from '../helpers/logger.js'
export const LoadLndSettingsFromEnv = (): LndSettings => {
    const lndAddr = EnvMustBeNonEmptyString("LND_ADDRESS")
    const lndCertPath = EnvMustBeNonEmptyString("LND_CERT_PATH")
    const lndMacaroonPath = EnvMustBeNonEmptyString("LND_MACAROON_PATH")
    const feeRateLimit = EnvMustBeInteger("OUTBOUND_MAX_FEE_BPS") / 10000
    const feeFixedLimit = EnvMustBeInteger("OUTBOUND_MAX_FEE_EXTRA_SATS")
    const mockLnd = EnvCanBeBoolean("MOCK_LND")
    return { lndAddr, lndCertPath, lndMacaroonPath, feeRateLimit, feeFixedLimit, mockLnd }
}
export interface LightningHandler {
    Stop(): void
    Warmup(): Promise<void>
    GetInfo(): Promise<NodeInfo>
    Health(): Promise<void>
    NewAddress(addressType: Types.AddressType): Promise<NewAddressResponse>
    NewInvoice(value: number, memo: string, expiry: number): Promise<Invoice>
    DecodeInvoice(paymentRequest: string): Promise<DecodedInvoice>
    GetFeeLimitAmount(amount: number): number
    GetMaxWithinLimit(amount: number): number
    PayInvoice(invoice: string, amount: number, feeLimit: number): Promise<PaidInvoice>
    EstimateChainFees(address: string, amount: number, targetConf: number): Promise<EstimateFeeResponse>
    PayAddress(address: string, amount: number, satPerVByte: number, label?: string): Promise<SendCoinsResponse>
    OpenChannel(destination: string, closeAddress: string, fundingAmount: number, pushSats: number): Promise<string>
    SetMockInvoiceAsPaid(invoice: string, amount: number): Promise<void>
    ChannelBalance(): Promise<{ local: number, remote: number }>
    GetTransactions(startHeight: number): Promise<TransactionDetails>
    GetBalance(): Promise<BalanceInfo>
    ListClosedChannels(): Promise<ClosedChannelsResponse>
    ListChannels(): Promise<ListChannelsResponse>
    ListPendingChannels(): Promise<PendingChannelsResponse>
    GetForwardingHistory(indexOffset: number): Promise<{ fee: number, chanIdIn: string, chanIdOut: string, timestampNs: number, offset: number }[]>
    GetAllPaidInvoices(max: number): Promise<ListInvoiceResponse>
    GetAllPayments(max: number): Promise<ListPaymentsResponse>
    LockOutgoingOperations(): void
    UnlockOutgoingOperations(): void
}

export default (settings: LndSettings, addressPaidCb: AddressPaidCb, invoicePaidCb: InvoicePaidCb, newBlockCb: NewBlockCb, htlcCb: HtlcCb): LightningHandler => {
    if (settings.mockLnd) {
        getLogger({})("registering mock lnd handler")
        return new MockLnd(settings, addressPaidCb, invoicePaidCb, newBlockCb)
    } else {
        getLogger({})("registering prod lnd handler")
        return new LND(settings, addressPaidCb, invoicePaidCb, newBlockCb, htlcCb)
    }
}