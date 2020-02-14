require('dotenv').config()
const CronJon = require('cron').CronJob
const Discord = require('discord.js')
const client = new Discord.Client()
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
  console.log(LINK, ETH)
  const ticker = await binance.getOrderBookTicker('LINKETH')
  const price = (Number(ticker.bidPrice) + Number(ticker.askPrice)) / 2
  const div = Math.floor(Math.floor(ETH / price) * 2 / 5 - Math.floor(LINK) * 3 / 5)
  logger.info(`[LINK: ${LINK}] [ETH: ${ETH}] [PRICE: ${price.toFixed(8)}] [DIV: ${div}] [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)
  client.channels.get('677778837580283914').send(`[LINK: ${LINK}] [ETH: ${ETH}] [PRICE: ${price.toFixed(8)}] [DIV: ${div}] [${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`)
  if (Math.abs(div) > Math.floor(LINK * 0.02)) {
    if (div > 0) {
  //     const res = await binance.doLimitOrder('LINKETH', 'BUY', Math.floor(Math.floor(div / 2)), ticker.askPrice)
          console.log(`[BUY] [PRCIE: ${ticker.askPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}]`)
  //     logger.warn(`[BUY] [PRCIE: ${ticker.askPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}] [STATUS: ${res.status}]`)
    } else {
  //     const res = await binance.doLimitOrder('LINKETH', 'SELL', Math.floor(Math.abs(div) / 2), ticker.bidPrice)
        console.log(`[SELL] [PRCIE: ${ticker.bidPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}]`)
  //     logger.warn(`[SELL] [PRCIE: ${ticker.bidPrice}] [QUANT: ${Math.floor(Math.abs(div) / 2)}] [STATUS: ${res.status}]`)
    }
  }
}

const job = new CronJon('0 */5 * * * *', main)

job.start()

client.login(process.env.TOKEN)

client.on('ready', () => {
  // const ch = client.channels.get('677778837580283914')
  main()
  console.log(`Logged in as ${client.user.tag}!`);
})
