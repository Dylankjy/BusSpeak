// This file contains every router file to load into express.

const env = require('../config')
const BASE_URL = env.constants.API_BASE_URL

module.exports = (app) => {
    app.use(`${BASE_URL}/`, require('./index/controller'))
}
