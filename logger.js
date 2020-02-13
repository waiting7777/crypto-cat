const { createLogger, format, transports } = require('winston')
const { printf } = format

const myFormat = printf(({ message }) => {
  return `${message}`;
})

const logger = createLogger({
  format: myFormat,
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'cat.log' })
  ]
})

module.exports = logger