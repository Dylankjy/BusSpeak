const { io } = require('socket.io-client')
const env = require('../config')

const socket = io(env.socketClient.ENDPOINT, {
    reconnectionDelayMax: env.socketClient.OPTIONS.reconnectionDelayMax,
    reconnection: env.socketClient.OPTIONS.reconnection,
    reconnectionAttempts: env.socketClient.OPTIONS.reconnectionAttempts
})

socket.on('connect', () => {
    console.log(`Socket connected to ${env.socketClient.ENDPOINT} with ID ${env.BUS_STOP_CODE}`)
    socket.emit('busStopConnect', { busStopCode: env.socketClient.BUS_STOP_ID })
})

require('./error_handler')(socket)

