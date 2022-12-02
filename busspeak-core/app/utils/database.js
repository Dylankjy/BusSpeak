const mongoose = require('mongoose')
const env = require('../config')

class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        mongoose.connect(`${env.services.MONGO.HOST}/${env.services.MONGO.DATABASE}${env.services.MONGO.OPTIONS}`)
            .then(() => {
                console.log('Database connection successful')
            })
            .catch((err) => {
                console.error('Database connection error')
            })
    }
}

module.exports = new Database()
