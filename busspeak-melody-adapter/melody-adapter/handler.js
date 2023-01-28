const { io } = require('socket.io-client')

const socket = io(process.env.BUSSPEAK_CORE_SOCKET_ENDPOINT)

const sendCommand = () => {
    socket.emit('user_play_melody', { stopID: parseInt(stopID) })
}

const acknowledge = () => {
    return new Promise((resolve) => {
        socket.on('user_play_melody_ack', (data) => {
            return resolve()
        })
    })
}

module.exports.handler = (event, context, callback) => {
    const { stopID } = event
    console.log('stopID: ' + stopID)

    sendCommand()

    acknowledge().then(() => {
        // Disconnect
        socket.disconnect()

        const response = {
            statusCode: 200,
            description: 'Melody command sent successfully.'
        }
        // callback(null, response)
        return response
    })
}
