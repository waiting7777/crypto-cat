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
  const LINK = assets.balances.filter(v => v.asset === 'LINK')[0].free
  const ETH = assets.balances.filter(v => v.asset === 'ETH')[0].free
  const ticker = await binance.getOrderBookTicker('LINKETH')
  const price = (Number(ticker.bidPrice) + Number(ticker.askPrice)) / 2
  const div = Math.floor(ETH / price) - Math.floor(LINK)
  logger.info(`[LINK: ${LINK}] [ETH: ${ETH}] [PRICE: ${price.toFixed(8)}] [DIV: ${div}] [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)
  if (Math.abs(div) > Math.ceil(ETH / 50)) {
    if (div > 0) {
      const res = await binance.doLimitOrder('LINKETH', 'BUY', Math.floor(Math.floor(div / 2)), ticker.askPrice)
      // console.log(`[BUY] [PRCIE: ${ticker.askPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}]`)
      logger.warn(`[BUY] [PRCIE: ${ticker.askPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}] [STATUS: ${res.status}]`)
    } else {
      const res = await binance.doLimitOrder('LINKETH', 'SELL', Math.floor(Math.abs(div) / 2), ticker.bidPrice)
      // console.log(`[SELL] [PRCIE: ${ticker.bidPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}]`)
      logger.warn(`[SELL] [PRCIE: ${ticker.bidPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}] [STATUS: ${res.status}]`)
    }
  }
}

const job = new CronJon('0 */5 * * * *', main)

job.start()

main()
