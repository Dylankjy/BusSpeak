// Get environment variables
const dotenv = require('dotenv')
dotenv.config()

// axios
const axios = require('axios')
const datamall = axios.create({
    baseURL: 'http://datamall2.mytransport.sg/ltaodataservice',
    headers: {
        'AccountKey': process.env.LTA_DATAMALL_KEY,
        'accept': 'application/json'
    }
})

// Mongoose
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Database connection successful.')
}).catch((err) => {
    console.error('Error connecting to MongoDB', err)
})

// Models
const BusStop = require('./models/BusStop')
const BusRoute = require('./models/BusRoute')
const BusService = require('./models/BusService')

module.exports.populate_database = async (event, context, callback) => {
    const busStops = await getAll('/BusStops')
    const busRoutes = await getAll('/BusRoutes')
    const busServices = await getAll('/BusServices')

    clearDb().then(() => {
        populateDb(busStops, busRoutes, busServices).then(() => {
            mongoose.disconnect()
        })
    })

    return true
}

const getAll = async (endpoint) => {
    const completeList = []
    let skip = 0

    return new Promise(async (resolve) => {
        while (true) {
            const res = await datamall.get(`${endpoint}?$skip=${skip}`)
            completeList.push(...res.data.value)

            if (res.data.value.length === 0) {
                break
            }

            skip += 500
        }

        return resolve(completeList)
    })
}

const clearDb = async () => {
    await BusStop.deleteMany({})
    await BusRoute.deleteMany({})
    await BusService.deleteMany({})
}

const populateDb = async (busStops, busRoutes, busServices) => {
    // Populate BusStop
    for (const busStop of busStops) {
        console.log(`${busStop.BusStopCode}`)
        const newBusStop = new BusStop({
            _id: parseInt(busStop.BusStopCode),
            code: parseInt(busStop.BusStopCode),
            stopName: busStop.Description,
            location: {
                road: busStop.RoadName,
                latitude: busStop.Latitude,
                longitude: busStop.Longitude
            }
        })

        await newBusStop.save()
    }

    // Populate BusRoute
    for (const busRoute of busRoutes) {
        console.log(`${busRoute.ServiceNo}-${(busRoute.Direction === 1) ? 'DOWN' : 'UP'}-${busRoute.StopSequence}`)
        const newBusRoute = new BusRoute({
            _id: `${busRoute.ServiceNo}-${(busRoute.Direction === 1) ? 'DOWN' : 'UP'}-${busRoute.StopSequence}`,
            serviceNumber: parseInt(busRoute.ServiceNo),
            operator: busRoute.Operator,
            direction: (busRoute.Direction === 1) ? 'DOWN' : 'UP',
            stopInfo: {
                busStopCode: parseInt(busRoute.BusStopCode),
                stopSequence: parseInt(busRoute.StopSequence),
                distance: parseInt(busRoute.Distance),
                timings: {
                    weekday: {
                        firstBus: (busRoute.WD_FirstBus !== '-') ? parseInt(busRoute.WD_FirstBus) : null,
                        lastBus: (busRoute.WD_LastBus !== '-') ? parseInt(busRoute.WD_LastBus) : null
                    },
                    saturday: {
                        firstBus: (busRoute.SAT_FirstBus !== '-') ? parseInt(busRoute.SAT_FirstBus) : null,
                        lastBus: (busRoute.SAT_LastBus !== '-') ? parseInt(busRoute.SAT_LastBus) : null
                    },
                    sunday: {
                        firstBus: (busRoute.SUN_FirstBus !== '-') ? parseInt(busRoute.SUN_FirstBus) : null,
                        lastBus: (busRoute.SUN_LastBus !== '-') ? parseInt(busRoute.SUN_LastBus) : null
                    }
                }
            }
        })

        await newBusRoute.save()
    }

    // Populate BusService
    for (const busService of busServices) {
        console.log(`${busService.ServiceNo}-${(busService.Direction === 1) ? 'DOWN' : 'UP'}`)
        const newBusService = new BusService({
            _id: `${busService.ServiceNo}-${(busService.Direction === 1) ? 'DOWN' : 'UP'}`,
            serviceNumber: parseInt(busService.ServiceNo),
            operator: busService.Operator,
            category: busService.Category,
            route: {
                direction: (busService.Direction === 1) ? 'DOWN' : 'UP',
                originCode: busService.OriginCode,
                destinationCode: busService.DestinationCode
            },
            loopDesc: (busService.LoopDesc !== '') ? busService.LoopDesc : null,
            frequency: {
                AM: {
                    peak: (busService.AM_Peak_Freq !== '-') ? busService.AM_Peak_Freq : null,
                    offpeak: (busService.AM_Offpeak_Freq !== '-') ? busService.AM_Offpeak_Freq : null
                },
                PM: {
                    peak: (busService.PM_Peak_Freq !== '-') ? busService.PM_Peak_Freq : null,
                    offpeak: (busService.PM_Offpeak_Freq !== '-') ? busService.PM_Offpeak_Freq : null
                }
            }
        })

        await newBusService.save()
    }
}
