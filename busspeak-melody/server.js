require('dotenv').config()
const env = require('./app/config')

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.get('/', (req, res) => {
    return res.json({ status: 200, service_name: 'BusSpeak Melody Websocket Service', owner: 'BusSpeak' })
})

app.all('*', (req, res) => {
    return res.redirect('/')
})

server.listen(env.PORT, () => {
    console.log(`BusSpeak Melody Service - Listening on port ${env.PORT}`)
})
