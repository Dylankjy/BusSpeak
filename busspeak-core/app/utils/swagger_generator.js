const env = require('../config')

const swaggerAutogen = require('swagger-autogen')()

const outputFile = './app/api/swagger.json'
const endpointsFiles = ['./app/api/index.js']

// Swagger configuration
const configuration = {
    info: {
        version: env.constants.API_VERSION,
        title: env.constants.SERVICE_NAME,
        description: env.constants.SERVICE_DESCRIPTION
    },
    host: `${env.HOSTNAME}:${env.PORT}`,
    basePath: env.constants.API_BASE_URL
}

swaggerAutogen(outputFile, endpointsFiles, configuration)
