const fetch = require('node-fetch')
const moment = require('moment')

// TD: use param store for API keys
const apiKey = '8vHBg7b/SrC78oWoKaWWSQ=='

// TD: caching

// simple test func - this bus service goes from where to where *using desc*
const getStartEndInterchange = async (serviceNo) => {
    console.log('here1')

    // GET BUS STOP CODES
    let queryIndex = 0
    let originCode = ''
    let destinationCode = ''
    while (originCode == '') {
        const response = await fetch(`http://datamall2.mytransport.sg/ltaodataservice/BusServices?$skip=${queryIndex}`, {
            method: 'GET',
            headers: { 'AccountKey': `${apiKey}`, 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        for (let i = 0; i < data.value.length; i++) {
            if (data.value[i]['ServiceNo'] == serviceNo) {
                originCode = data.value[i]['OriginCode']
                destinationCode = data.value[i]['DestinationCode']
                break
            }
        }

        queryIndex += 500
        console.log('next loop ' + queryIndex)
    }
    console.log('OUT orgCODE is ' +originCode)
    console.log('OUT destCODE is ' +destinationCode)

    // Get BUS STOP NAMES FROM CODES
    queryIndex = 0
    let originName = ''
    let destinationName = ''
    while (originName == '' || destinationName == '') {
        const response = await fetch(`http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${queryIndex}`, {
            method: 'GET',
            headers: { 'AccountKey': `${apiKey}`, 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        for (let i = 0; i < data.value.length; i++) {
            if (data.value[i]['BusStopCode'] == originCode) {
                originName = data.value[i]['Description']
            } else if (data.value[i]['BusStopCode'] == destinationCode) {
                destinationName = data.value[i]['Description']
            }
            if (originName != '' && destinationName != '') {
                break
            }
        }

        queryIndex += 500
        console.log('next loop 2 ' + queryIndex)
    }
    if (originCode == destinationCode) {
        destinationName = originName
    }
    console.log('OUT org is ' + originName)
    console.log('OUT dest is ' + destinationName)
}

// when is the next bus arriving
const getNextBusTime = async (stopCode, serviceNo) => {
    console.log('here2')

    const response = await fetch(`http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${stopCode}&${serviceNo}`, {
        method: 'GET',
        headers: { 'AccountKey': `${apiKey}`, 'Content-Type': 'application/json' }
    })

    const data = await response.json()
    console.log(data)
    if (data.Services.length > 0) {
        const nextArrivalRaw = data.Services[0].NextBus.EstimatedArrival
        const nextArrival = nextArrivalRaw.substring(nextArrivalRaw.indexOf('T') + 1, nextArrivalRaw.indexOf('+'))
        const diff = moment(nextArrival, 'h:mm:ss').fromNow()
        console.log(diff)
    }
}

// getStartEndInterchange('853')
getNextBusTime(83139, 15)
