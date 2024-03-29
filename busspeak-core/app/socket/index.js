const { io } = require('socket.io-client')
const env = require('../config')

const socket = io(env.socketClient.ENDPOINT, {
    reconnectionDelayMax: env.socketClient.OPTIONS.reconnectionDelayMax,
    reconnection: env.socketClient.OPTIONS.reconnection,
    reconnectionAttempts: env.socketClient.OPTIONS.reconnectionAttempts,
    cors: {
        origin: '*'
    }
})

socket.on('connect', () => {
    console.log(`Socket connected to ${env.socketClient.ENDPOINT} with ID ${env.BUS_STOP_CODE}`)
    socket.emit('busstop_connect', { stopID: env.BUS_STOP_CODE })

    socket.on('busstop_connect_ack', (data) => {
        console.log(`Confirm readback: ${data.description}`)
    })
})

require('./error_handler')(socket)

// Events
require('./events/melody')(socket)
