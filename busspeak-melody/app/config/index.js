const inspector = require('inspector')

const config = {
    // Application
    DEBUG_MODE: process.env.DEBUG_MODE || (inspector.url() !== undefined) ? true : false,

    // Webserver
    HOSTNAME: process.env.HOSTNAME || 'localhost',
    PORT: process.env.PORT || 5000

    // API Constants
    // constants: {
    //     SERVICE_NAME: 'Harbourfront Node REST API Template',
    //     SERVICE_DESCRIPTION: 'You can change this description in /app/config/index.js:config.constants.SERVICE_DESCRIPTION',
    //     API_VERSION: '1.0',
    //     API_BASE_URL: '/v1/api'
    // }
}

module.exports = config
