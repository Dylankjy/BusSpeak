const mongoose = require('mongoose')

const BusService = new mongoose.Schema({
    _id: { type: String },
    service: { type: String, required: true },
    operator: { type: String, required: true },
    category: { type: String, required: true },
    route: {
        direction: { type: String, required: true },
        originCode: { type: Number, ref: 'stops' },
        destinationCode: { type: Number, ref: 'stops' }
    },
    loopDesc: { type: String },
    frequency: {
        AM: {
            peak: { type: String },
            offpeak: { type: String }
        },
        PM: {
            peak: { type: String },
            offpeak: { type: String }
        }
    }
}, {
    timestamps: { createdAt: 'currentAsAt', updatedAt: false, _id: false }
})

BusService.index({ service: 1 })
BusService.index({ stopName: 'text' })

module.exports = mongoose.model('services', BusService)
