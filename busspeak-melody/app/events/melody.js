module.exports = (io, socket) => {
    socket.on('busstop_connect', async (data) => {
        // Check whether data.stopID is integer
        if (Number.isInteger(data.stopID)) {
            console.log(`BusSpeak Core at ID ${data.stopID} has connected`)

            // Leave all existing rooms
            socket.leaveAll()

            // Join room with corresponding Bus Stop ID
            socket.join(data.stopID)

            // Acknowledge connection
            return socket.emit('busstop_connect_ack', { status: 200, description: 'Connection successful. Joined room ' + data.stopID })
        }

        return socket.emit('req_error', { code: 'INVALID_STOPID', description: 'stopID provided is invalid.' })
    })

    // DEPRECATION NOTICE: This event is deprecated. Use the REST API instead.

    // socket.on('user_play_melody', (data) => {
    //     /*
    //     data = {
    //         stopID: 1234
    //         // No need to include client id as it you can just read the default room id
    //     }
    //     */

    //     // Check whether stop ID is integer
    //     if (!Number.isInteger(data.stopID)) {
    //         console.debug('Received an invalid stopID from client.')
    //         return socket.emit('req_error', { code: 'INVALID_STOPID_CLIENT', description: 'stopID provided in the command is invalid.' })
    //     }

    //     // Check whether busstop is in the room
    //     if (!io.sockets.adapter.rooms.has(data.stopID)) {
    //         console.debug('Received a request to ring in an non-existent room. Check whether BusSpeak Core exists at the stopID.')
    //         return socket.emit('req_error', { code: 'REQUESTED_BUSCORE_NOT_FOUND', description: 'The BusSpeak Core that you are attempting to contact does not exist. stopID may be invalid.' })
    //     }

    //     // TODO: Client rate limiting

    //     console.log(`User at Bus Stop ${data.stopID} has requested to play melody`)

    //     // Send command to busstop
    //     socket.to(data.stopID).emit('busstop_play_melody', {})

    //     // Acknowledge command
    //     socket.emit('user_play_melody_ack', { status: 200, description: 'Play melody command sent to Busspeak Core ID ' + data.stopID })

    //     // Disconnect the client
    //     return setTimeout(() => {
    //         socket.disconnect()
    //     }, 1000)
    // })
}
