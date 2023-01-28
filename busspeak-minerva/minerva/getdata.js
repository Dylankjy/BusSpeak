const { connection } = require('./utils/database')

const BusStop = require('./models/BusStop')
const BusRoute = require('./models/BusRoute')
const BusService = require('./models/BusService')

module.exports.handler = async (event, context, callback) => {
    const { query, collection, limit=200 } = event
    let result

    // Open database connection
    await connection.open()

    // Check whether query and collection are present
    if (!query || !collection) {
        return {
            statusCode: 400,
            message: 'Missing parameters in request body. Expected: { query=(object), collection=(string), limit=(integer, default: 200) }'
        }
    }

    if (collection === 'stops') {
        result = await BusStop.find(query).limit(limit).exec()
    }

    if (collection === 'routes') {
        result = await BusRoute.find(query).limit(limit).populate('stopInfo.busStop service').exec()
    }

    if (collection === 'services') {
        result = await BusService.find(query).limit(limit).populate('route.originStop route.destinationStop').exec()
    }

    if (!result) {
        return {
            statusCode: 400,
            message: 'Invalid collection name. Expected: [stops, routes, services]'
        }
    }

    // Close database connection
    connection.close()

    return {
        statusCode: 200,
        limit,
        result: result
    }
}
