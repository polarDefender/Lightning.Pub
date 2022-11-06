import 'dotenv/config'
import NewServer from '../proto/autogenerated/ts/express_server'
import GetServerMethods from './services/serverMethods'
import serverOptions from './auth';
import Main, { LoadMainSettingsFromEnv } from './services/main'
(async () => {
    const mainHandler = new Main(LoadMainSettingsFromEnv())
    await mainHandler.storage.Connect()
    const Server = NewServer(GetServerMethods(mainHandler), serverOptions(mainHandler))
    Server.Listen(3000)
})()
