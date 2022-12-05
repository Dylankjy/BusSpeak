module.exports = (socket) => {
    socket.io.on('error', (err) => {
        console.log('Error connecting to socket server ' + err.error)
        console.log(socket.id)
    })

    socket.io.on('reconnect', (attempt) => {
        console.log('Connection to socket server re-established on attempt #' + attempt)
    })

    socket.on('req_error', (data) => {
        console.error(`[SOCKET ERROR] ${data.code}: ${data.description}`)
    })
}
