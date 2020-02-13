require('dotenv').config()
const CronJon = require('cron').CronJob
const logger = require('./logger')
const crypto = require('crypto-node-api')
const dayjs = require('dayjs')
const binance = new crypto.Binance({
  apiKey: process.env.APIKEY,
  secretKey: process.env.SECRETKEY
})

async function main() {
  const assets = await binance.getAccountInfo()
  const BTC = assets.balances.filter(v => v.asset === 'BTC')[0].free
  const LINK = assets.balances.filter(v => v.asset === 'LINK')[0].free
  const ticker = await binance.getOrderBookTicker('LINKBTC')
  const price = (Number(ticker.bidPrice) + Number(ticker.askPrice)) / 2
  const div = Math.floor(BTC / price) - LINK
  logger.info(`[BTC: ${BTC}] [LINK: ${LINK}] [PRICE: ${price}] [DIV: ${div}] [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)
  if (Math.abs(div) > Math.ceil(LINK / 50)) {
    if (div > 0) {
      const res = await binance.doLimitOrder('LINKBTC', 'BUY', Math.floor(Math.floor(div / 2)), ticker.askPrice)
      logger.warn(`[BUY] [PRCIE: ${ticker.askPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}] [STATUS: ${res.status}]`)
    } else {
      const res = await binance.doLimitOrder('LINKBTC', 'SELL', Math.floor(Math.abs(div) / 2), ticker.bidPrice)
      logger.warn(`[SELL] [PRCIE: ${ticker.bidPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}] [STATUS: ${res.status}]`)
    }
  }
}

const job = new CronJon('0 */5 * * * *', main)

job.start()
