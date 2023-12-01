// This file was autogenerated from a .proto file, DO NOT EDIT!

import * as Types from './types.js'
export type Logger = { log: (v: any) => void, error: (v: any) => void }
type NostrResponse = (message: object) => void
export type NostrRequest = {
    rpcName?: string
    params?: Record<string, string>
    query?: Record<string, string>
    body?: any
    authIdentifier?: string
    requestId?: string
    appId?: string
}
export type NostrOptions = {
    logger?: Logger
    throwErrors?: true
    NostrUserAuthGuard: (appId?:string, identifier?: string) => Promise<Types.UserContext>
}
const logErrorAndReturnResponse = (error: Error, response: string, res: NostrResponse, logger: Logger) => { logger.error(error.message || error); res({ status: 'ERROR', reason: response }) }
export default (methods: Types.ServerMethods, opts: NostrOptions) => {
    const logger = opts.logger || { log: console.log, error: console.error }
    return async (req: NostrRequest, res: NostrResponse) => {
        switch (req.rpcName) {
            case 'GetUserInfo':
                try {
                    if (!methods.GetUserInfo) throw new Error('method: GetUserInfo is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const query = req.query
                    const params = req.params
                    const response = await methods.GetUserInfo({ ...authContext, ...query, ...params })
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'AddProduct':
                try {
                    if (!methods.AddProduct) throw new Error('method: AddProduct is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.AddProductRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.AddProduct({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'NewProductInvoice':
                try {
                    if (!methods.NewProductInvoice) throw new Error('method: NewProductInvoice is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const query = req.query
                    const params = req.params
                    const response = await methods.NewProductInvoice({ ...authContext, ...query, ...params })
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'GetUserOperations':
                try {
                    if (!methods.GetUserOperations) throw new Error('method: GetUserOperations is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.GetUserOperationsRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.GetUserOperations({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'NewAddress':
                try {
                    if (!methods.NewAddress) throw new Error('method: NewAddress is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.NewAddressRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.NewAddress({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'PayAddress':
                try {
                    if (!methods.PayAddress) throw new Error('method: PayAddress is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.PayAddressRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.PayAddress({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'NewInvoice':
                try {
                    if (!methods.NewInvoice) throw new Error('method: NewInvoice is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.NewInvoiceRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.NewInvoice({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'DecodeInvoice':
                try {
                    if (!methods.DecodeInvoice) throw new Error('method: DecodeInvoice is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.DecodeInvoiceRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.DecodeInvoice({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'PayInvoice':
                try {
                    if (!methods.PayInvoice) throw new Error('method: PayInvoice is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.PayInvoiceRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.PayInvoice({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'OpenChannel':
                try {
                    if (!methods.OpenChannel) throw new Error('method: OpenChannel is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const request = req.body
                    const error = Types.OpenChannelRequestValidate(request)
                    if (error !== null) return logErrorAndReturnResponse(error, 'invalid request body', res, logger)
                    const query = req.query
                    const params = req.params
                    const response = await methods.OpenChannel({ ...authContext, ...query, ...params }, request)
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'GetLnurlWithdrawLink':
                try {
                    if (!methods.GetLnurlWithdrawLink) throw new Error('method: GetLnurlWithdrawLink is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const query = req.query
                    const params = req.params
                    const response = await methods.GetLnurlWithdrawLink({ ...authContext, ...query, ...params })
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'GetLnurlPayLink':
                try {
                    if (!methods.GetLnurlPayLink) throw new Error('method: GetLnurlPayLink is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const query = req.query
                    const params = req.params
                    const response = await methods.GetLnurlPayLink({ ...authContext, ...query, ...params })
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'GetLNURLChannelLink':
                try {
                    if (!methods.GetLNURLChannelLink) throw new Error('method: GetLNURLChannelLink is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const query = req.query
                    const params = req.params
                    const response = await methods.GetLNURLChannelLink({ ...authContext, ...query, ...params })
                    res({status: 'OK', ...response})
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'GetLiveUserOperations':
                try {
                    if (!methods.GetLiveUserOperations) throw new Error('method: GetLiveUserOperations is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const query = req.query
                    const params = req.params
                    methods.GetLiveUserOperations({ ...authContext, ...query, ...params }, (response, err) => {
                    if (err) { logErrorAndReturnResponse(err, err.message, res, logger)} else { res({status: 'OK', ...response})}
                    })
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            case 'GetMigrationUpdate':
                try {
                    if (!methods.GetMigrationUpdate) throw new Error('method: GetMigrationUpdate is not implemented')
                    const authContext = await opts.NostrUserAuthGuard(req.appId, req.authIdentifier)
                    const query = req.query
                    const params = req.params
                    methods.GetMigrationUpdate({ ...authContext, ...query, ...params }, (response, err) => {
                    if (err) { logErrorAndReturnResponse(err, err.message, res, logger)} else { res({status: 'OK', ...response})}
                    })
                }catch(ex){ const e = ex as any; logErrorAndReturnResponse(e, e.message || e, res, logger); if (opts.throwErrors) throw e }
                break
            default: logger.error('unknown rpc call name from nostr event:'+req.rpcName) 
        }
    }
}
