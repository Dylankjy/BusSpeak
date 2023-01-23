const mongoose = require('mongoose')

const BusRoute = new mongoose.Schema({
    _id: { type: String },
    serviceNumber: { type: Number, required: true, ref: 'services' },
    direction: { type: String, required: true },

    stopInfo: {
        busStopCode: { type: Number, ref: 'busstops', required: true },
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

BusRoute.index({ serviceNumber: 1 })
BusRoute.index({ 'stopInfo.busStopCode': 1 })

module.exports = mongoose.model('routes', BusRoute)