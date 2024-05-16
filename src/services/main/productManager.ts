import Storage from '../storage/index.js'
import * as Types from '../../../proto/autogenerated/ts/types.js'


import { MainSettings } from './settings.js'
import PaymentManager from './paymentManager.js'
import { defaultInvoiceExpiry } from '../storage/paymentStorage.js'

export default class {
    storage: Storage
    settings: MainSettings
    paymentManager: PaymentManager

    constructor(storage: Storage, paymentManager: PaymentManager, settings: MainSettings) {
        this.storage = storage
        this.settings = settings
        this.paymentManager = paymentManager
    }

    async AddProduct(userId: string, req: Types.AddProductRequest): Promise<Types.Product> {
        const user = await this.storage.userStorage.GetUser(userId)
        const newProduct = await this.storage.productStorage.AddProduct(req.name, req.price_sats, user)
        return {
            id: newProduct.product_id,
            name: newProduct.name,
            price_sats: newProduct.price_sats,
        }
    }

    async NewProductInvoice(id: string): Promise<Types.NewInvoiceResponse> {
        const product = await this.storage.productStorage.GetProduct(id)
        const productInvoice = await this.paymentManager.NewInvoice(product.owner.user_id, {
            amountSats: product.price_sats, memo: product.name
        }, { product, expiry: defaultInvoiceExpiry })
        return {
            invoice: productInvoice.invoice
        }
    }
}