const env = require('./app/config');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    return res.send('Hello World!')
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

app.listen(3000, () => {
    console.log(`BusSpeak Sing to Me Service - Listening on port ${env.PORT}`)
})
