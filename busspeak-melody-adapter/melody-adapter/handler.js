// Axios
const axios = require('axios')

module.exports.handler = async (event, context, callback) => {
    const res = await axios.post('http://localhost:3000/play', { stopID: event.stopID })

    return res.data
}
