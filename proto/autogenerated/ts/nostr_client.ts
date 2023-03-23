// This file was autogenerated from a .proto file, DO NOT EDIT!
import { NostrRequest } from './nostr_transport.js'
import * as Types from './types.js'
export type ResultError = { status: 'ERROR', reason: string }

export type NostrClientParams = {
    pubDestination: string
    retrieveNostrUserAuth: () => Promise<string | null>
    checkResult?: true
}
export default (params: NostrClientParams,  send: (to:string, message: NostrRequest) => Promise<any>) => ({
    GetUserInfo: async (): Promise<ResultError | ({ status: 'OK' }& Types.UserInfo)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        const data = await send(params.pubDestination, {rpcName:'GetUserInfo',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.UserInfoValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    AddProduct: async (request: Types.AddProductRequest): Promise<ResultError | ({ status: 'OK' }& Types.Product)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'AddProduct',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.ProductValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    NewProductInvoice: async (query: Types.NewProductInvoice_Query): Promise<ResultError | ({ status: 'OK' }& Types.NewInvoiceResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.query = query
        const data = await send(params.pubDestination, {rpcName:'NewProductInvoice',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetUserOperations: async (request: Types.GetUserOperationsRequest): Promise<ResultError | ({ status: 'OK' }& Types.GetUserOperationsResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'GetUserOperations',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.GetUserOperationsResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    NewAddress: async (request: Types.NewAddressRequest): Promise<ResultError | ({ status: 'OK' }& Types.NewAddressResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'NewAddress',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewAddressResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    PayAddress: async (request: Types.PayAddressRequest): Promise<ResultError | ({ status: 'OK' }& Types.PayAddressResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'PayAddress',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.PayAddressResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    NewInvoice: async (request: Types.NewInvoiceRequest): Promise<ResultError | ({ status: 'OK' }& Types.NewInvoiceResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'NewInvoice',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    DecodeInvoice: async (request: Types.DecodeInvoiceRequest): Promise<ResultError | ({ status: 'OK' }& Types.DecodeInvoiceResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'DecodeInvoice',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.DecodeInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    PayInvoice: async (request: Types.PayInvoiceRequest): Promise<ResultError | ({ status: 'OK' }& Types.PayInvoiceResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'PayInvoice',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.PayInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    OpenChannel: async (request: Types.OpenChannelRequest): Promise<ResultError | ({ status: 'OK' }& Types.OpenChannelResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        nostrRequest.body = request
        const data = await send(params.pubDestination, {rpcName:'OpenChannel',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.OpenChannelResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLnurlWithdrawLink: async (): Promise<ResultError | ({ status: 'OK' }& Types.LnurlLinkResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        const data = await send(params.pubDestination, {rpcName:'GetLnurlWithdrawLink',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlLinkResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLNURLChannelLink: async (): Promise<ResultError | ({ status: 'OK' }& Types.LnurlLinkResponse)> => {
        const auth = await params.retrieveNostrUserAuth()
        if (auth === null) throw new Error('retrieveNostrUserAuth() returned null')
        const nostrRequest: NostrRequest = {}
        const data = await send(params.pubDestination, {rpcName:'GetLNURLChannelLink',authIdentifier:auth, ...nostrRequest }) 
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') { 
            const result = data
            if(!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlLinkResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
})
