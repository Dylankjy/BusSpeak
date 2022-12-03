module.exports = (socket) => {
    socket.on('bus_stop_connect', (data) => {
        // Check whether data.stopID is integer
        if (Number.isInteger(data.stopID)) {
            console.log(`BusSpeak Core at ID ${data.stopID} has connected`)
            return socket.join(data.stopID)
        }

        socket.emit('req_error', { code: 'INVALID_STOPID', description: 'stopID provided is invalid.' })
    })
}
