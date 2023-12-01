import * as Types from '../../../proto/autogenerated/ts/types.js'
import { getLogger } from '../helpers/logger.js'
import Main from '../main/index.js'
export default (mainHandler: Main): Types.ServerMethods => {
    return {
        EncryptionExchange: async (ctx, req) => { },
        Health: async (ctx) => { await mainHandler.lnd.Health() },
        LndGetInfo: async (ctx) => {
            const info = await mainHandler.lnd.GetInfo()
            return { alias: info.alias }
        },
        SetMockInvoiceAsPaid: async (ctx, req) => {
            const err = Types.SetMockInvoiceAsPaidRequestValidate(req, {
                invoice_CustomCheck: invoice => invoice !== '',
            })
            if (err != null) throw new Error(err.message)
            await mainHandler.paymentManager.SetMockInvoiceAsPaid(req)
        },
        GetUserInfo: (ctx) => mainHandler.appUserManager.GetUserInfo(ctx),
        GetUserOperations: async (ctx, req) => {
            return mainHandler.paymentManager.GetUserOperations(ctx.user_id, req)
        },
        OpenChannel: async (ctx, req) => {
            const err = Types.OpenChannelRequestValidate(req, {
                fundingAmount_CustomCheck: amt => amt > 0,
                pushAmount_CustomCheck: amt => amt > 0,
                destination_CustomCheck: dest => dest !== ""
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.paymentManager.OpenChannel(ctx.user_id, req)
        },
        NewAddress: (ctx, req) => mainHandler.paymentManager.NewAddress(ctx, req),
        PayAddress: async (ctx, req) => {
            const err = Types.PayAddressRequestValidate(req, {
                address_CustomCheck: addr => addr !== '',
                amoutSats_CustomCheck: amt => amt > 0,
                satsPerVByte_CustomCheck: spb => spb > 0
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.paymentManager.PayAddress(ctx, req)
        },
        NewInvoice: (ctx, req) => mainHandler.appUserManager.NewInvoice(ctx, req),
        DecodeInvoice: async (ctx, req) => {
            return mainHandler.paymentManager.DecodeInvoice(req)
        },
        PayInvoice: async (ctx, req) => {
            const err = Types.PayInvoiceRequestValidate(req, {
                invoice_CustomCheck: invoice => invoice !== ''
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.appUserManager.PayInvoice(ctx, req)
        },
        GetLnurlWithdrawLink: (ctx) => mainHandler.paymentManager.GetLnurlWithdrawLink(ctx),
        GetLnurlWithdrawInfo: async (ctx) => {
            if (!ctx.k1) {
                throw new Error("invalid lnurl withdraw to get info")
            }
            return mainHandler.paymentManager.GetLnurlWithdrawInfo(ctx.k1)
        },
        HandleLnurlWithdraw: async (ctx) => {
            if (!ctx.k1 || !ctx.pr) {
                throw new Error("invalid lnurl withdraw to handle")
            }
            return mainHandler.paymentManager.HandleLnurlWithdraw(ctx.k1, ctx.pr)
        },
        GetLnurlPayLink: (ctx) => mainHandler.paymentManager.GetLnurlPayLink(ctx),
        GetLnurlPayInfo: async (ctx) => {
            if (!ctx.k1) {
                throw new Error("invalid lnurl pay to get info")
            }
            return mainHandler.paymentManager.GetLnurlPayInfo(ctx.k1)
        },
        HandleLnurlPay: async (ctx) => {
            return mainHandler.paymentManager.HandleLnurlPay(ctx)
        },
        HandleLnurlAddress: async (ctx) => {
            if (!ctx.address_name) {
                throw new Error("invalid address_name to lnurl address")
            }
            return mainHandler.paymentManager.HandleLnurlAddress(ctx)
        },
        AddProduct: async (ctx, req) => {
            return mainHandler.productManager.AddProduct(ctx.user_id, req)
        },
        NewProductInvoice: async (ctx) => {
            if (!ctx.id) {
                throw new Error("product id must be non empty")
            }
            return mainHandler.productManager.NewProductInvoice(ctx.id)
        },
        GetLNURLChannelLink: async (ctx) => {
            throw new Error("unimplemented")
        },
        AddApp: async (ctx, req) => {
            const err = Types.AuthAppRequestValidate(req, {
                name_CustomCheck: name => name !== ''
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.AddApp(req)
        },
        AuthApp: async (ctx, req) => {
            const err = Types.AuthAppRequestValidate(req, {
                name_CustomCheck: name => name !== ''
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.AuthApp(req)
        },
        GetApp: async (ctx) => {
            return mainHandler.applicationManager.GetApp(ctx.app_id)
        },
        AddAppUser: async (ctx, req) => {
            const err = Types.AddAppUserRequestValidate(req, {
                identifier_CustomCheck: id => id !== ''
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.AddAppUser(ctx.app_id, req)
        },
        AddAppInvoice: async (ctx, req) => {
            const err = Types.AddAppInvoiceRequestValidate(req, {
                payer_identifier_CustomCheck: id => id !== '',
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.AddAppInvoice(ctx.app_id, req)
        },
        AddAppUserInvoice: async (ctx, req) => {
            const err = Types.AddAppUserInvoiceRequestValidate(req, {
                payer_identifier_CustomCheck: id => id !== '',
                receiver_identifier_CustomCheck: id => id !== '',
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.AddAppUserInvoice(ctx.app_id, req)
        },
        GetAppUser: async (ctx, req) => {
            const err = Types.GetAppUserRequestValidate(req, {
                user_identifier_CustomCheck: id => id !== '',
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.GetAppUser(ctx.app_id, req)
        },
        PayAppUserInvoice: async (ctx, req) => {
            const err = Types.PayAppUserInvoiceRequestValidate(req, {
                user_identifier_CustomCheck: id => id !== '',
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.PayAppUserInvoice(ctx.app_id, req)
        },
        SendAppUserToAppUserPayment: async (ctx, req) => {
            const err = Types.SendAppUserToAppUserPaymentRequestValidate(req, {
                to_user_identifier_CustomCheck: id => id !== '',
                from_user_identifier_CustomCheck: id => id !== '',
                amount_CustomCheck: amount => amount > 0
            })
            if (err != null) throw new Error(err.message)
            await mainHandler.applicationManager.SendAppUserToAppUserPayment(ctx.app_id, req)
        },
        SendAppUserToAppPayment: async (ctx, req) => {
            const err = Types.SendAppUserToAppPaymentRequestValidate(req, {
                from_user_identifier_CustomCheck: id => id !== '',
                amount_CustomCheck: amount => amount > 0
            })
            if (err != null) throw new Error(err.message)
            await mainHandler.applicationManager.SendAppUserToAppPayment(ctx.app_id, req)
        },
        GetAppUserLNURLInfo: async (ctx, req) => {
            const err = Types.GetAppUserLNURLInfoRequestValidate(req, {
                user_identifier_CustomCheck: id => id !== ''
            })
            if (err != null) throw new Error(err.message)
            return mainHandler.applicationManager.GetAppUserLNURLInfo(ctx.app_id, req)
        },
        SetMockAppUserBalance: async (ctx, req) => {
            const err = Types.SetMockAppUserBalanceRequestValidate(req, {
                user_identifier_CustomCheck: id => id !== ''
            })
            if (err != null) throw new Error(err.message)
            await mainHandler.applicationManager.SetMockAppUserBalance(ctx.app_id, req)
        },
        SetMockAppBalance: async (ctx, req) => {
            await mainHandler.applicationManager.SetMockAppBalance(ctx.app_id, req)
        },
        GetLiveUserOperations: async (ctx, cb) => {
        },
        GetMigrationUpdate: async (ctx, cb) => {
        }
    }
}