require('dotenv').config()
const env = require('./app/config')

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
require('./app/events')(io)

const cors = require('cors')
const path = require('path')
app.use(cors({
    origin: 'http://localhost' + env.PORT
}))

app.get('/', (req, res) => {
    return res.json({ status: 200, service_name: 'BusSpeak Melody Websocket Service', owner: 'BusSpeak' })
})

// Public folder
app.use('/debug', express.static(path.join(__dirname, 'debug')))

app.all('*', (req, res) => {
    return res.redirect('/')
})

server.listen(env.PORT, () => {
    console.log(`BusSpeak Melody Service - Listening on port ${env.PORT}`)
})
