const { play } = require('ichion')

module.exports = (socket) => {
    socket.on('busstop_play_melody', async (data) => {
        console.log('Playing melody')
        play('../../temp/pianoman.mp3')
    })
}
