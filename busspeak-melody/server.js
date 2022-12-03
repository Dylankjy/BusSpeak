require('dotenv').config()
const env = require('./app/config')

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.get('/', (req, res) => {
    return res.send('Hello World!')
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

app.listen(env.PORT, () => {
    console.log(`BusSpeak Melody Service - Listening on port ${env.PORT}`)
})
