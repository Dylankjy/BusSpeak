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
    origin: env.CORS_ORIGIN
}))

// Request body in JSON
app.use(express.json())

app.get('/', (req, res) => {
    return res.json({ status: 200, service_name: 'BusSpeak Melody Websocket Service', owner: 'BusSpeak' })
})

// For compatibility with REST API clients
io.on('connection', (socket) => {
    app.post('/play', (req, res) => {
        const { stopID } = req.body

        // Check whether stop ID is integer
        if (!Number.isInteger(stopID)) {
            console.debug('Received an invalid stopID from client.')
            return res.status(400).json({ code: 'INVALID_STOPID_CLIENT', description: 'stopID provided in the command is invalid.' })
        }

        // Check whether busstop is in the room
        if (!io.sockets.adapter.rooms.has(stopID)) {
            console.debug('Received a request to ring in an non-existent room. Check whether BusSpeak Core exists at the stopID.')
            return res.status(404).json({ code: 'REQUESTED_BUSCORE_NOT_FOUND', description: 'The BusSpeak Core that you are attempting to contact does not exist. stopID may be invalid.' })
        }

        console.log(`User at Bus Stop ${stopID} has requested to play melody`)

        // Send command to busstop
        socket.to(stopID).emit('busstop_play_melody', {})

        return res.json({ status: 200, description: 'Play melody command sent to Busspeak Core ID ' + stopID })
    })

    // Only register the wildcard route after /play route is registered
    app.all('*', (req, res) => {
        return res.redirect('/')
    })
})


// Public folder
app.use('/debug', express.static(path.join(__dirname, 'debug')))

server.listen(env.PORT, () => {
    console.log(`BusSpeak Melody Service - Listening on port ${env.PORT}`)
})
