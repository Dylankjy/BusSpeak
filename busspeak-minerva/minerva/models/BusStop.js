const mongoose = require('mongoose')

const BusStop = new mongoose.Schema({
    _id: { type: String },
    code: { type: Number, required: true, unique: true },
    stopName: { type: String, required: true },
    location: {
        road: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    }
}, {
    timestamps: { createdAt: 'currentAsAt', updatedAt: false, _id: false }
})

BusStop.index({ code: 1 }, { unique: true })
BusStop.index({ stopName: 'text' })

module.exports = mongoose.model('stops', BusStop)