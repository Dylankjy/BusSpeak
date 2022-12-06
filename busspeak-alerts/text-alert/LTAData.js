const fetch = require('node-fetch')

// TD: use param store for API keys
const apiKey = '8vHBg7b/SrC78oWoKaWWSQ=='

// TD: caching

// simple test func - this bus service goes from where to where *using desc*
const busroute = async (serviceNo) => {
    console.log('here')

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
        // console.log(data)
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

    
    // Get NEAREST BUS ARRIVAL FROM ORIGIN
    let originLocation = ''
    let destinedBus = ''
    console.log(serviceNo)
    while (originLocation == '' || destinedBus == '') {
        const response = await fetch(`http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${originCode}`, {
            method: 'GET',
            headers: { 'AccountKey': `${apiKey}`, 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        //data.value[i]['Description']
        console.log(data)
        //console.log(data)

        // for (let i = 0; i < data.length; i++) {
        //     if (data.value[i]['BusStopCode'] == originCode) {
        //         originName = data.value[i]['Description']
        //     } else if (data.value[i]['BusStopCode'] == destinationCode) {
        //         destinationName = data.value[i]['Description']
        //     }
        //     if (originName != '' && destinationName != '') {
        //         break
        //     }
        // }
    }

    const now = Date.now();
    const arrivalResponse = (bus) => {
      const arrival = bus.EstimatedArrival;
      return {
        time: arrival,
        duration_ms: arrival ? new Date(arrival) - now : null,
        lat: parseFloat(bus.Latitude, 10),
        lng: parseFloat(bus.Longitude, 10),
        load: bus.Load,
        feature: bus.Feature,
        type: bus.Type,
      };
    };
  
    // const services = body.Services.map((service) => {
    //   const { NextBus, NextBus2, NextBus3 } = service;
  
    //   return {
    //     no: service.ServiceNo,
    //     operator: service.Operator,
    //     next: arrivalResponse(NextBus),
    //     subsequent: arrivalResponse(NextBus2), // Legacy pre
    //     next2: arrivalResponse(NextBus2),
    //     next3: arrivalResponse(NextBus3),
    //   };
    // });
}

busroute('72')

    //     for (let i = 0; i < data.value.length; i++) {
    //         if (data.value[i]['BusStopCode'] == originCode) {
    //             originName = data.value[i]['Description']
    //         } else if (data.value[i]['BusStopCode'] == destinationCode) {
    //             destinationName = data.value[i]['Description']
    //         }
    //         if (originName != '' && destinationName != '') {
    //             break
    //         }
    //     }

    //     queryIndex += 500
    //     console.log('next loop 2 ' + queryIndex)
    // }
    // if (originCode == destinationCode) {
    //     destinationName = originName
    // }
    // console.log('OUT org is ' + originName)
    // console.log('OUT dest is ' + destinationName)