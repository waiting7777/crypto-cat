require('dotenv').config()
const crypto = require('crypto-node-api')
const binance = new crypto.Binance({
  apiKey: process.env.APIKEY,
  secretKey: process.env.SECRETKEY
})

async function main() {
  const res = await binance.getPriceTicker('LINKBTC')
  console.log(res)
}

main()