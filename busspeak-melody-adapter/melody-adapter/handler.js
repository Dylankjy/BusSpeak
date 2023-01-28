const { io } = require('socket.io-client')

const socket = io(process.env.BUSSPEAK_CORE_SOCKET_ENDPOINT)

const sendCommand = (stopID) => {
    socket.emit('user_play_melody', { stopID: parseInt(stopID) })
}

module.exports.handler = (event, context, callback) => {
    const { stopID } = event
    console.log('stopID: ' + stopID)

    sendCommand(stopID)

    return socket.on('user_play_melody_ack', (data) => {
        // Disconnect
        socket.close()

        const response = {
            statusCode: 200,
            description: 'Melody command sent successfully.'
        }
        callback(null, response)
        return response
    })
}
