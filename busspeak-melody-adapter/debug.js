const handler = require('./melody-adapter/handler')

const dotenv = require('dotenv')
dotenv.config()

const event = {
    stopID: 15159
}

handler.handler(event, null, null)
