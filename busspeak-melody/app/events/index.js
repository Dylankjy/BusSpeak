module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connection established')
        socket.on('disconnect', () => {
            console.log('Client connection terminated')
        })

        // Events
        require('./melody')(socket)
    })
}
