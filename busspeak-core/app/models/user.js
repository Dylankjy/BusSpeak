const mongoose = require('mongoose')

const User = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    password: { type: String, required: true }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

module.exports = mongoose.model('users', User)
