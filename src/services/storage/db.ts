import "reflect-metadata"
import { DataSource } from "typeorm"
import { AddressReceivingTransaction } from "./entity/AddressReceivingTransaction.js"
import { User } from "./entity/User.js"
import { UserReceivingAddress } from "./entity/UserReceivingAddress.js"
import { UserReceivingInvoice } from "./entity/UserReceivingInvoice.js"
import { UserInvoicePayment } from "./entity/UserInvoicePayment.js"
import { EnvMustBeNonEmptyString } from "../helpers/envParser.js"
import { UserTransactionPayment } from "./entity/UserTransactionPayment.js"
import { UserBasicAuth } from "./entity/UserBasicAuth.js"
import { UserEphemeralKey } from "./entity/UserEphemeralKey.js"
import { Product } from "./entity/Product.js"
import { UserToUserPayment } from "./entity/UserToUserPayment.js"
import { Application } from "./entity/Application.js"
import { ApplicationUser } from "./entity/ApplicationUser.js"
import { RoutingEvent } from "./entity/RoutingEvent.js"
import { BalanceEvent } from "./entity/BalanceEvent.js"
import { ChannelBalanceEvent } from "./entity/ChannelsBalanceEvent.js"
import { getLogger } from "../helpers/logger.js"
import { Initial1703170309875 } from "./migrations/1703170309875-initial.js"
import { LndMetrics1703170330183 } from "./migrations/1703170330183-lnd_metrics.js"


export type DbSettings = {
    databaseFile: string
    migrate: boolean
    doInitialMigration: boolean
}
export const LoadDbSettingsFromEnv = (test = false): DbSettings => {
    return {
        databaseFile: test ? ":memory:" : EnvMustBeNonEmptyString("DATABASE_FILE"),
        migrate: process.env.MIGRATE_DB === 'true' || false,
        doInitialMigration: process.env.DO_INITIAL_MIGRATION === 'true' || false
    }
}

export default async (settings: DbSettings) => {
    const migrations = settings.doInitialMigration ? [Initial1703170309875] : []
    migrations.push(LndMetrics1703170330183)
    const s = await new DataSource({
        type: "sqlite",
        database: settings.databaseFile,
        // logging: true,
        entities: [User, UserReceivingInvoice, UserReceivingAddress, AddressReceivingTransaction, UserInvoicePayment, UserTransactionPayment,
            UserBasicAuth, UserEphemeralKey, Product, UserToUserPayment, Application, ApplicationUser, UserToUserPayment, RoutingEvent, BalanceEvent, ChannelBalanceEvent],
        //synchronize: true,
        migrations
    }).initialize()
    const log = getLogger({})

    const pendingMigrations = await s.showMigrations()
    if (pendingMigrations) {
        if (!settings.migrate) {
            throw new Error("pending migrations found, run with: MIGRATE_DB=true")
        } else {
            log("migrations found, migrating...")
            const migrations = await s.runMigrations()
            log(migrations)
        }
    }
    await s.getRepository(RoutingEvent).find()
    await s.getRepository(Application).find()
    return s
}