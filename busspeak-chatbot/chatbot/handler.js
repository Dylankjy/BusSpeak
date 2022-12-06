'use strict'
const fetch = require('node-fetch')
const moment = require('moment')

// TD: use param store for API keys
const apiKey = '8vHBg7b/SrC78oWoKaWWSQ=='

// TD: caching

module.exports.getFirstLastStop = async (event, context, callback) => {
    const serviceNo = event.currentIntent.slots['ServiceNo']

    try {
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

            // get origin and destination (code) from matching bus service
            for (let i = 0; i < data.value.length; i++) {
                if (data.value[i]['ServiceNo'] == serviceNo) {
                    originCode = data.value[i]['OriginCode']
                    destinationCode = data.value[i]['DestinationCode']
                    break
                }
            }

            queryIndex += 500
        }

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
        }
        if (originCode == destinationCode) {
            destinationName = originName
        }

        const answer = `The bus service ${serviceNo} goes between Bus Stop ${originName} (${originCode}) and Bus Stop ${destinationName} (${destinationCode}).`

        return {
            'sessionAttributes': {},
            'dialogAction': {
                'type': 'Close',
                'fulfillmentState': 'Fulfilled',
                'message': {
                    'contentType': 'PlainText',
                    'content': answer
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports.getNextBusTime = async (event, context, callback) => {
    const serviceNo = event.currentIntent.slots['ServiceNo']
    const stopCode = event.currentIntent.slots['StopCode']
    let answer = ''

    try {
        const response = await fetch(`http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${stopCode}&${serviceNo}`, {
            method: 'GET',
            headers: { 'AccountKey': `${apiKey}`, 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (data.Services.length > 0) {
            const nextArrivalRaw = data.Services[0].NextBus.EstimatedArrival
            const nextArrival = nextArrivalRaw.substring(nextArrivalRaw.indexOf('T') + 1, nextArrivalRaw.indexOf('+'))
            const diff = moment(nextArrival, 'h:mm:ss').fromNow()
            answer = `The next bus ${serviceNo} arrives in ${diff}.`
        } else {
            answer = 'This bus is not active currently.'
        }

        return {
            'sessionAttributes': {},
            'dialogAction': {
                'type': 'Close',
                'fulfillmentState': 'Fulfilled',
                'message': {
                    'contentType': 'PlainText',
                    'content': answer
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}
