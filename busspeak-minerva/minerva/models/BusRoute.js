const mongoose = require('mongoose')

const BusRoute = new mongoose.Schema({
    _id: { type: String },
    service: { type: String, required: true, ref: 'services' },
    direction: { type: String, required: true },

    stopInfo: {
        busStop: { type: Number, ref: 'stops', required: true },
        stopSequence: { type: Number, required: true },
        distance: { type: Number, required: true },

        timings: {
            weekday: {
                firstBus: { type: Number },
                lastBus: { type: Number }
            },
            saturday: {
                firstBus: { type: Number },
                lastBus: { type: Number }
            },
            sunday: {
                firstBus: { type: Number },
                lastBus: { type: Number }
            }
        }
    }
}, {
    timestamps: { createdAt: 'currentAsAt', updatedAt: false, _id: false }
})

BusRoute.index({ service: 1 })
BusRoute.index({ 'stopInfo.busStop': 1 })

module.exports = mongoose.model('routes', BusRoute)
