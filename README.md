# Lightning.Pub

![GitHub last commit](https://img.shields.io/github/last-commit/shocknet/Lightning.Pub?style=flat-square)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) 
[![Chat](https://img.shields.io/badge/chat-on%20Telegram-blue?style=flat-square)](https://t.me/ShockBTC)
[![Twitter Follow](https://img.shields.io/twitter/follow/ShockBTC?style=flat-square)](https://twitter.com/ShockBTC)

<p></p>

`Pub` enables your Lightning node with public Web API's, providing a framework for permissionless applications that depend on Lightning. 
- Wrapper for [`LND`](https://github.com/lightningnetwork/lnd/releases) that can serve accounts over LNURL and NOSTR

#### This repository is under rapid iteration and should only be used in development.


### Manual Installation
#### Notes:
* The service defaults to port `8080` 
* Requires [Node.js](https://nodejs.org) 16

#### Steps:
1) Run [LND](https://github.com/lightningnetwork/lnd/releases) - *Example mainnet startup*:

 ```
 ./lnd --bitcoin.active --bitcoin.mainnet --bitcoin.node=neutrino --neutrino.connect=neutrino.shock.network --routing.assumechanvalid --accept-keysend --allow-circular-route --feeurl=https://nodes.lightning.computer/fees/v1/btc-fee-estimates.json
 ```


2) Download and Install Lightning.Pub

```
git clone https://github.com/shocknet/Lightning.Pub
cd Lightning.Pub
npm install
```

3) `cp nvm.example .env`
4) Add values to env file, you can generate a keypair with `node keygen.js` 
5) `npm start`
6) Connect with [wallet2](https://github.com/shocknet/wallet2) ... until this is further along you'll get the wallets pub from the console then update your env


