const mongoose = require('mongoose')

const BusStop = new mongoose.Schema({
    _id: { type: String },
    code: { type: Number, required: true, unique: true },
    stopName: { type: String, required: true },
    stopNameLower: { type: String, required: true, lowercase: true },
    location: {
        road: { type: String, required: true },
        type: { type: String, required: true, default: 'Point' },
        coordinates: [{ type: Number, required: true }]
    }
}, {
    timestamps: { createdAt: 'currentAsAt', updatedAt: false, _id: false }
})

BusStop.index({ code: 1 }, { unique: true })
BusStop.index({ stopName: 'text' })
BusStop.index({ location: '2dsphere' })

module.exports = mongoose.model('stops', BusStop)
