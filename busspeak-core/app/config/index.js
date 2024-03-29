const inspector = require('inspector')

const config = {
    // Application
    DEBUG_MODE: process.env.DEBUG_MODE || (inspector.url() !== undefined) ? true : false,

    // BusSpeak Core
    BUS_STOP_CODE: parseInt(process.env.BUS_STOP_CODE) || 00000,

    // Webserver
    HOSTNAME: process.env.HOSTNAME || 'localhost',
    PORT: process.env.PORT || 5000,
    MAX_REQUESTS_PER_MINUTE: process.env.MAX_REQUESTS_PER_MINUTE || 100,

    // Services and databases
    services: {
        MONGO: {
            HOST: process.env.MONGO_HOST || 'mongodb://localhost:27017',
            DATABASE: process.env.MONGO_DATABASE || 'test',
            OPTIONS: process.env.MONGO_OPTIONS || ''
        }
    },

    // API Constants
    constants: {
        SERVICE_NAME: 'Harbourfront Node REST API Template',
        SERVICE_DESCRIPTION: 'You can change this description in /app/config/index.js:config.constants.SERVICE_DESCRIPTION',
        API_VERSION: '1.0',
        API_BASE_URL: '/v1/api'
    },

    socketClient: {
        ENDPOINT: process.env.SOCKET_ENDPOINT || 'http://127.0.0.1:5010',
        OPTIONS: {
            reconnectionDelayMax: 5000,
            reconnection: true,
            reconnectionAttempts: 9999
        }
    }
}

module.exports = config
