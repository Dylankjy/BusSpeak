module.exports = (socket) => {
    socket.io.on('error', () => {
        console.log('Error connecting to socket server')
    })

    socket.io.on('reconnect', (attempt) => {
        console.log('Connection to socket server re-established')
    })

    socket.on('req_error', (data) => {
        console.error(`[SOCKET ERROR] ${data.code}: ${data.description}`)
    })
}
