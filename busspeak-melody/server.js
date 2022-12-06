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
    origin: 'http://localhost:5010'
}))

app.get('/', (req, res) => {
    return res.json({ status: 200, service_name: 'BusSpeak Melody Websocket Service', owner: 'BusSpeak' })
})

app.get('/test', (req, res) => {
    return res.sendFile(path.join(__dirname, 'test.html'))
})

app.all('*', (req, res) => {
    return res.redirect('/')
})

server.listen(env.PORT, () => {
    console.log(`BusSpeak Melody Service - Listening on port ${env.PORT}`)
})
