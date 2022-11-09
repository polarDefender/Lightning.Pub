// This file was autogenerated from a .proto file, DO NOT EDIT!

export type GuestContext = {
}
export type UserContext = {
    user_id: string
}
export type AdminContext = {
    admin_id: string
}
export type AuthContext = GuestContext | UserContext | AdminContext

export type Health_Query = {
}
export type Health_RouteParams = {
}
export type Health_Context = Health_Query & Health_RouteParams & GuestContext
export type EncryptionExchange_Query = {
}
export type EncryptionExchange_RouteParams = {
}
export type EncryptionExchange_Context = EncryptionExchange_Query & EncryptionExchange_RouteParams & GuestContext
export type LndGetInfo_Query = {
}
export type LndGetInfo_RouteParams = {
}
export type LndGetInfo_Context = LndGetInfo_Query & LndGetInfo_RouteParams & AdminContext
export type AddUser_Query = {
}
export type AddUser_RouteParams = {
}
export type AddUser_Context = AddUser_Query & AddUser_RouteParams & GuestContext
export type AuthUser_Query = {
}
export type AuthUser_RouteParams = {
}
export type AuthUser_Context = AuthUser_Query & AuthUser_RouteParams & GuestContext
export type NewAddress_Query = {
}
export type NewAddress_RouteParams = {
}
export type NewAddress_Context = NewAddress_Query & NewAddress_RouteParams & UserContext
export type PayAddress_Query = {
}
export type PayAddress_RouteParams = {
}
export type PayAddress_Context = PayAddress_Query & PayAddress_RouteParams & UserContext
export type NewInvoice_Query = {
}
export type NewInvoice_RouteParams = {
}
export type NewInvoice_Context = NewInvoice_Query & NewInvoice_RouteParams & UserContext
export type PayInvoice_Query = {
}
export type PayInvoice_RouteParams = {
}
export type PayInvoice_Context = PayInvoice_Query & PayInvoice_RouteParams & UserContext
export type OpenChannel_Query = {
}
export type OpenChannel_RouteParams = {
}
export type OpenChannel_Context = OpenChannel_Query & OpenChannel_RouteParams & UserContext
export type GetOpenChannelLNURL_Query = {
}
export type GetOpenChannelLNURL_RouteParams = {
}
export type GetOpenChannelLNURL_Context = GetOpenChannelLNURL_Query & GetOpenChannelLNURL_RouteParams & UserContext
export type ServerMethods = {
    Health?: (ctx: Health_Context) => Promise<void>
    EncryptionExchange?: (ctx: EncryptionExchange_Context, req: EncryptionExchangeRequest) => Promise<void>
    LndGetInfo?: (ctx: LndGetInfo_Context, req: LndGetInfoRequest) => Promise<LndGetInfoResponse>
    AddUser?: (ctx: AddUser_Context, req: AddUserRequest) => Promise<AddUserResponse>
    AuthUser?: (ctx: AuthUser_Context, req: AuthUserRequest) => Promise<AuthUserResponse>
    NewAddress?: (ctx: NewAddress_Context, req: NewAddressRequest) => Promise<NewAddressResponse>
    PayAddress?: (ctx: PayAddress_Context, req: PayAddressRequest) => Promise<PayAddressResponse>
    NewInvoice?: (ctx: NewInvoice_Context, req: NewInvoiceRequest) => Promise<NewInvoiceResponse>
    PayInvoice?: (ctx: PayInvoice_Context, req: PayInvoiceRequest) => Promise<PayInvoiceResponse>
    OpenChannel?: (ctx: OpenChannel_Context, req: OpenChannelRequest) => Promise<OpenChannelResponse>
    GetOpenChannelLNURL?: (ctx: GetOpenChannelLNURL_Context) => Promise<GetOpenChannelLNURLResponse>
}

export enum AddressType {
    WITNESS_PUBKEY_HASH = 'WITNESS_PUBKEY_HASH',
    NESTED_PUBKEY_HASH = 'NESTED_PUBKEY_HASH',
    TAPROOT_PUBKEY = 'TAPROOT_PUBKEY',
}
const enumCheckAddressType = (e?: AddressType): boolean => {
    for (const v in AddressType) if (e === v) return true
    return false
}

export type OptionsBaseMessage = {
    allOptionalsAreSet?: true
}

export type Empty = {
}
export const EmptyOptionalFields: [] = []
export type EmptyOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
}
export const EmptyValidate = (o?: Empty, opts: EmptyOptions = {}, path: string = 'Empty::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    return null
}

export type LndGetInfoRequest = {
    node_id: number
}
export const LndGetInfoRequestOptionalFields: [] = []
export type LndGetInfoRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    node_id_CustomCheck?: (v: number) => boolean
}
export const LndGetInfoRequestValidate = (o?: LndGetInfoRequest, opts: LndGetInfoRequestOptions = {}, path: string = 'LndGetInfoRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.node_id !== 'number') return new Error(`${path}.node_id: is not a number`)
    if (opts.node_id_CustomCheck && !opts.node_id_CustomCheck(o.node_id)) return new Error(`${path}.node_id: custom check failed`)

    return null
}

export type NewAddressResponse = {
    address: string
}
export const NewAddressResponseOptionalFields: [] = []
export type NewAddressResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    address_CustomCheck?: (v: string) => boolean
}
export const NewAddressResponseValidate = (o?: NewAddressResponse, opts: NewAddressResponseOptions = {}, path: string = 'NewAddressResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.address !== 'string') return new Error(`${path}.address: is not a string`)
    if (opts.address_CustomCheck && !opts.address_CustomCheck(o.address)) return new Error(`${path}.address: custom check failed`)

    return null
}

export type PayAddressRequest = {
    address: string
    amout_sats: number
    target_conf: number
}
export const PayAddressRequestOptionalFields: [] = []
export type PayAddressRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    address_CustomCheck?: (v: string) => boolean
    amout_sats_CustomCheck?: (v: number) => boolean
    target_conf_CustomCheck?: (v: number) => boolean
}
export const PayAddressRequestValidate = (o?: PayAddressRequest, opts: PayAddressRequestOptions = {}, path: string = 'PayAddressRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.address !== 'string') return new Error(`${path}.address: is not a string`)
    if (opts.address_CustomCheck && !opts.address_CustomCheck(o.address)) return new Error(`${path}.address: custom check failed`)

    if (typeof o.amout_sats !== 'number') return new Error(`${path}.amout_sats: is not a number`)
    if (opts.amout_sats_CustomCheck && !opts.amout_sats_CustomCheck(o.amout_sats)) return new Error(`${path}.amout_sats: custom check failed`)

    if (typeof o.target_conf !== 'number') return new Error(`${path}.target_conf: is not a number`)
    if (opts.target_conf_CustomCheck && !opts.target_conf_CustomCheck(o.target_conf)) return new Error(`${path}.target_conf: custom check failed`)

    return null
}

export type PayAddressResponse = {
    tx_id: string
}
export const PayAddressResponseOptionalFields: [] = []
export type PayAddressResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    tx_id_CustomCheck?: (v: string) => boolean
}
export const PayAddressResponseValidate = (o?: PayAddressResponse, opts: PayAddressResponseOptions = {}, path: string = 'PayAddressResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.tx_id !== 'string') return new Error(`${path}.tx_id: is not a string`)
    if (opts.tx_id_CustomCheck && !opts.tx_id_CustomCheck(o.tx_id)) return new Error(`${path}.tx_id: custom check failed`)

    return null
}

export type PayInvoiceRequest = {
    invoice: string
    amount: number
}
export const PayInvoiceRequestOptionalFields: [] = []
export type PayInvoiceRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    invoice_CustomCheck?: (v: string) => boolean
    amount_CustomCheck?: (v: number) => boolean
}
export const PayInvoiceRequestValidate = (o?: PayInvoiceRequest, opts: PayInvoiceRequestOptions = {}, path: string = 'PayInvoiceRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.invoice !== 'string') return new Error(`${path}.invoice: is not a string`)
    if (opts.invoice_CustomCheck && !opts.invoice_CustomCheck(o.invoice)) return new Error(`${path}.invoice: custom check failed`)

    if (typeof o.amount !== 'number') return new Error(`${path}.amount: is not a number`)
    if (opts.amount_CustomCheck && !opts.amount_CustomCheck(o.amount)) return new Error(`${path}.amount: custom check failed`)

    return null
}

export type OpenChannelResponse = {
    channel_id: string
}
export const OpenChannelResponseOptionalFields: [] = []
export type OpenChannelResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    channel_id_CustomCheck?: (v: string) => boolean
}
export const OpenChannelResponseValidate = (o?: OpenChannelResponse, opts: OpenChannelResponseOptions = {}, path: string = 'OpenChannelResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.channel_id !== 'string') return new Error(`${path}.channel_id: is not a string`)
    if (opts.channel_id_CustomCheck && !opts.channel_id_CustomCheck(o.channel_id)) return new Error(`${path}.channel_id: custom check failed`)

    return null
}

export type GetOpenChannelLNURLResponse = {
    lnurl: string
}
export const GetOpenChannelLNURLResponseOptionalFields: [] = []
export type GetOpenChannelLNURLResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    lnurl_CustomCheck?: (v: string) => boolean
}
export const GetOpenChannelLNURLResponseValidate = (o?: GetOpenChannelLNURLResponse, opts: GetOpenChannelLNURLResponseOptions = {}, path: string = 'GetOpenChannelLNURLResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.lnurl !== 'string') return new Error(`${path}.lnurl: is not a string`)
    if (opts.lnurl_CustomCheck && !opts.lnurl_CustomCheck(o.lnurl)) return new Error(`${path}.lnurl: custom check failed`)

    return null
}

export type AddUserResponse = {
    user_id: string
    auth_token: string
}
export const AddUserResponseOptionalFields: [] = []
export type AddUserResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    user_id_CustomCheck?: (v: string) => boolean
    auth_token_CustomCheck?: (v: string) => boolean
}
export const AddUserResponseValidate = (o?: AddUserResponse, opts: AddUserResponseOptions = {}, path: string = 'AddUserResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.user_id !== 'string') return new Error(`${path}.user_id: is not a string`)
    if (opts.user_id_CustomCheck && !opts.user_id_CustomCheck(o.user_id)) return new Error(`${path}.user_id: custom check failed`)

    if (typeof o.auth_token !== 'string') return new Error(`${path}.auth_token: is not a string`)
    if (opts.auth_token_CustomCheck && !opts.auth_token_CustomCheck(o.auth_token)) return new Error(`${path}.auth_token: custom check failed`)

    return null
}

export type EncryptionExchangeRequest = {
    public_key: string
    device_id: string
}
export const EncryptionExchangeRequestOptionalFields: [] = []
export type EncryptionExchangeRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    public_key_CustomCheck?: (v: string) => boolean
    device_id_CustomCheck?: (v: string) => boolean
}
export const EncryptionExchangeRequestValidate = (o?: EncryptionExchangeRequest, opts: EncryptionExchangeRequestOptions = {}, path: string = 'EncryptionExchangeRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.public_key !== 'string') return new Error(`${path}.public_key: is not a string`)
    if (opts.public_key_CustomCheck && !opts.public_key_CustomCheck(o.public_key)) return new Error(`${path}.public_key: custom check failed`)

    if (typeof o.device_id !== 'string') return new Error(`${path}.device_id: is not a string`)
    if (opts.device_id_CustomCheck && !opts.device_id_CustomCheck(o.device_id)) return new Error(`${path}.device_id: custom check failed`)

    return null
}

export type NewInvoiceResponse = {
    invoice: string
}
export const NewInvoiceResponseOptionalFields: [] = []
export type NewInvoiceResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    invoice_CustomCheck?: (v: string) => boolean
}
export const NewInvoiceResponseValidate = (o?: NewInvoiceResponse, opts: NewInvoiceResponseOptions = {}, path: string = 'NewInvoiceResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.invoice !== 'string') return new Error(`${path}.invoice: is not a string`)
    if (opts.invoice_CustomCheck && !opts.invoice_CustomCheck(o.invoice)) return new Error(`${path}.invoice: custom check failed`)

    return null
}

export type PayInvoiceResponse = {
    preimage: string
}
export const PayInvoiceResponseOptionalFields: [] = []
export type PayInvoiceResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    preimage_CustomCheck?: (v: string) => boolean
}
export const PayInvoiceResponseValidate = (o?: PayInvoiceResponse, opts: PayInvoiceResponseOptions = {}, path: string = 'PayInvoiceResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.preimage !== 'string') return new Error(`${path}.preimage: is not a string`)
    if (opts.preimage_CustomCheck && !opts.preimage_CustomCheck(o.preimage)) return new Error(`${path}.preimage: custom check failed`)

    return null
}

export type AuthUserRequest = {
    name: string
    secret: string
}
export const AuthUserRequestOptionalFields: [] = []
export type AuthUserRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    name_CustomCheck?: (v: string) => boolean
    secret_CustomCheck?: (v: string) => boolean
}
export const AuthUserRequestValidate = (o?: AuthUserRequest, opts: AuthUserRequestOptions = {}, path: string = 'AuthUserRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.name !== 'string') return new Error(`${path}.name: is not a string`)
    if (opts.name_CustomCheck && !opts.name_CustomCheck(o.name)) return new Error(`${path}.name: custom check failed`)

    if (typeof o.secret !== 'string') return new Error(`${path}.secret: is not a string`)
    if (opts.secret_CustomCheck && !opts.secret_CustomCheck(o.secret)) return new Error(`${path}.secret: custom check failed`)

    return null
}

export type LndGetInfoResponse = {
    alias: string
}
export const LndGetInfoResponseOptionalFields: [] = []
export type LndGetInfoResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    alias_CustomCheck?: (v: string) => boolean
}
export const LndGetInfoResponseValidate = (o?: LndGetInfoResponse, opts: LndGetInfoResponseOptions = {}, path: string = 'LndGetInfoResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.alias !== 'string') return new Error(`${path}.alias: is not a string`)
    if (opts.alias_CustomCheck && !opts.alias_CustomCheck(o.alias)) return new Error(`${path}.alias: custom check failed`)

    return null
}

export type NewAddressRequest = {
    address_type: AddressType
}
export const NewAddressRequestOptionalFields: [] = []
export type NewAddressRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    address_type_CustomCheck?: (v: AddressType) => boolean
}
export const NewAddressRequestValidate = (o?: NewAddressRequest, opts: NewAddressRequestOptions = {}, path: string = 'NewAddressRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (!enumCheckAddressType(o.address_type)) return new Error(`${path}.address_type: is not a valid AddressType`)
    if (opts.address_type_CustomCheck && !opts.address_type_CustomCheck(o.address_type)) return new Error(`${path}.address_type: custom check failed`)

    return null
}

export type NewInvoiceRequest = {
    amount_sats: number
}
export const NewInvoiceRequestOptionalFields: [] = []
export type NewInvoiceRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    amount_sats_CustomCheck?: (v: number) => boolean
}
export const NewInvoiceRequestValidate = (o?: NewInvoiceRequest, opts: NewInvoiceRequestOptions = {}, path: string = 'NewInvoiceRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.amount_sats !== 'number') return new Error(`${path}.amount_sats: is not a number`)
    if (opts.amount_sats_CustomCheck && !opts.amount_sats_CustomCheck(o.amount_sats)) return new Error(`${path}.amount_sats: custom check failed`)

    return null
}

export type OpenChannelRequest = {
    destination: string
    funding_amount: number
    push_amount: number
    close_address: string
}
export const OpenChannelRequestOptionalFields: [] = []
export type OpenChannelRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    destination_CustomCheck?: (v: string) => boolean
    funding_amount_CustomCheck?: (v: number) => boolean
    push_amount_CustomCheck?: (v: number) => boolean
    close_address_CustomCheck?: (v: string) => boolean
}
export const OpenChannelRequestValidate = (o?: OpenChannelRequest, opts: OpenChannelRequestOptions = {}, path: string = 'OpenChannelRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.destination !== 'string') return new Error(`${path}.destination: is not a string`)
    if (opts.destination_CustomCheck && !opts.destination_CustomCheck(o.destination)) return new Error(`${path}.destination: custom check failed`)

    if (typeof o.funding_amount !== 'number') return new Error(`${path}.funding_amount: is not a number`)
    if (opts.funding_amount_CustomCheck && !opts.funding_amount_CustomCheck(o.funding_amount)) return new Error(`${path}.funding_amount: custom check failed`)

    if (typeof o.push_amount !== 'number') return new Error(`${path}.push_amount: is not a number`)
    if (opts.push_amount_CustomCheck && !opts.push_amount_CustomCheck(o.push_amount)) return new Error(`${path}.push_amount: custom check failed`)

    if (typeof o.close_address !== 'string') return new Error(`${path}.close_address: is not a string`)
    if (opts.close_address_CustomCheck && !opts.close_address_CustomCheck(o.close_address)) return new Error(`${path}.close_address: custom check failed`)

    return null
}

export type AddUserRequest = {
    callback_url: string
    name: string
    secret: string
}
export const AddUserRequestOptionalFields: [] = []
export type AddUserRequestOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    callback_url_CustomCheck?: (v: string) => boolean
    name_CustomCheck?: (v: string) => boolean
    secret_CustomCheck?: (v: string) => boolean
}
export const AddUserRequestValidate = (o?: AddUserRequest, opts: AddUserRequestOptions = {}, path: string = 'AddUserRequest::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.callback_url !== 'string') return new Error(`${path}.callback_url: is not a string`)
    if (opts.callback_url_CustomCheck && !opts.callback_url_CustomCheck(o.callback_url)) return new Error(`${path}.callback_url: custom check failed`)

    if (typeof o.name !== 'string') return new Error(`${path}.name: is not a string`)
    if (opts.name_CustomCheck && !opts.name_CustomCheck(o.name)) return new Error(`${path}.name: custom check failed`)

    if (typeof o.secret !== 'string') return new Error(`${path}.secret: is not a string`)
    if (opts.secret_CustomCheck && !opts.secret_CustomCheck(o.secret)) return new Error(`${path}.secret: custom check failed`)

    return null
}

export type AuthUserResponse = {
    user_id: string
    auth_token: string
}
export const AuthUserResponseOptionalFields: [] = []
export type AuthUserResponseOptions = OptionsBaseMessage & {
    checkOptionalsAreSet?: []
    user_id_CustomCheck?: (v: string) => boolean
    auth_token_CustomCheck?: (v: string) => boolean
}
export const AuthUserResponseValidate = (o?: AuthUserResponse, opts: AuthUserResponseOptions = {}, path: string = 'AuthUserResponse::root.'): Error | null => {
    if (opts.checkOptionalsAreSet && opts.allOptionalsAreSet) return new Error(path + ': only one of checkOptionalsAreSet or allOptionalNonDefault can be set for each message')
    if (typeof o !== 'object' || o === null) return new Error(path + ': object is not an instance of an object or is null')

    if (typeof o.user_id !== 'string') return new Error(`${path}.user_id: is not a string`)
    if (opts.user_id_CustomCheck && !opts.user_id_CustomCheck(o.user_id)) return new Error(`${path}.user_id: custom check failed`)

    if (typeof o.auth_token !== 'string') return new Error(`${path}.auth_token: is not a string`)
    if (opts.auth_token_CustomCheck && !opts.auth_token_CustomCheck(o.auth_token)) return new Error(`${path}.auth_token: custom check failed`)

    return null
}

