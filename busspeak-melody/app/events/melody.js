module.exports = (socket) => {
    socket.on('busStopConnect', (data) => {
        // Check whether data.busStopCode is integer
        if (Number.isInteger(data.busStopCode)) {
            console.log(`BusSpeak Core at ID ${data.busStopCode} has connected`)
            return socket.join(`busStop-${data.busStopCode}`)
        }
    })
}
