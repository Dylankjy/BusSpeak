const axios = require('axios')
const { populateDb, clearDb: dumpTables, connection } = require('./utils/database')
const datamall = axios.create({
    baseURL: 'http://datamall2.mytransport.sg/ltaodataservice',
    headers: {
        'AccountKey': process.env.LTA_DATAMALL_KEY,
        'accept': 'application/json'
    }
})

module.exports.handler = (event, context, callback) => {
    connection.open().then(async () => {
        const busStops = await getAll('/BusStops')
        const busRoutes = await getAll('/BusRoutes')
        const busServices = await getAll('/BusServices')

        dumpTables().then(() => {
            populateDb(busStops, busRoutes, busServices).then(() => {
                connection.close()
            })
        })

        return true
    })
}

const getAll = async (endpoint) => {
    const completeList = []
    let skip = 0

    return new Promise(async (resolve) => {
        while (true) {
            console.log(`Fetching ${endpoint} with skip ${skip}`)
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
