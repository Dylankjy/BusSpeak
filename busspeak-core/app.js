// Load environment
const env = require('./app/config')

// Express
const express = require('express')
const app = express()

// Rate limiting
const rateLimit = require('express-rate-limit')
app.use(rateLimit({
    windowMs: 1 * 60 * 1000,
    max: env.MAX_REQUESTS_PER_MINUTE,
    message: { message: 'Too many requests. Try again later.' }
}))

// Swagger
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./app/api/swagger.json')

// Routes
require('./app/api')(app)

const webserver = () => {
    app.listen(env.PORT, (err) => {
        if (err) {
            throw err
        }
        console.log(`BusSpeak Core - Listening on port ${env.PORT}`)
    })

    // Swagger API Docs
    app.use(`/v1/docs`, swaggerUi.serve, swaggerUi.setup(swaggerFile))
}

webserver()
