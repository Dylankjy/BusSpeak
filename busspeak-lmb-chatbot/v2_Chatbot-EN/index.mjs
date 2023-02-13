import moment from 'moment'
// const moment = require('moment')

import fetch from 'node-fetch'
// const fetch = require('node-fetch')

import dotenv from 'dotenv'
// const dotenv = require('dotenv')

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

import axios from 'axios'

dotenv.config({ path: '.env' })

const LtaApiKey = process.env.DATAMALL_API_KEY
const GglApiKey = process.env.GOOGLEMAPS_API_KEY
const OneMapApiToken = process.env.ONEMAP_API_TOKEN

const getSlots = (intentRequest) => {
    return intentRequest['sessionState']['intent']['slots']
}

const getSlot = (intentRequest, slotName) => {
    const slots = getSlots(intentRequest)
    if (slots != null && slots.hasOwnProperty(slotName) && slots[slotName] !== null){
        return slots[slotName]['value']['interpretedValue']
    }
    else{
        return null
    }
}

const getSessionAttributes = (intentRequest) => {
    const sessionState = intentRequest['sessionState']
    if (sessionState.hasOwnProperty('sessionAttributes')){
        return sessionState['sessionAttributes']
    }
    
    return {}
}

const elicitIntent = (intentRequest, sessionAttributes, message) => {
    return {
        'sessionState': {
            'dialogAction': {
                'type': 'ElicitIntent'
            },
            'sessionAttributes': sessionAttributes
        },
        'messages': message,
        'requestAttributes': intentRequest['requestAttributes']
    }
}

const elicitSlot = (intentRequest, sessionAttributes, slotName) => {
    intentRequest['sessionState']['intent']['state'] = 'InProgress'
    return {
        "sessionState": {
            "sessionAttributes": sessionAttributes,
            "dialogAction": {
                "slotToElicit": slotName,
                "type": "ElicitSlot"
            },
            'intent': intentRequest['sessionState']['intent']
        },
        "messages": [],
        "requestAttributes": intentRequest['requestAttributes']
    }
}

const elicitSlotMsg = (intentRequest, sessionAttributes, slotName, Messages) => {
    intentRequest['sessionState']['intent']['state'] = 'InProgress'
    return {
        "sessionState": {
            "sessionAttributes": sessionAttributes,
            "dialogAction": {
                "slotToElicit": slotName,
                "type": "ElicitSlot"
            },
            'intent': intentRequest['sessionState']['intent']
        },
        "messages": Messages,
        "requestAttributes": intentRequest['requestAttributes']
    }
}

const delegate = (intentRequest, sessionAttributes, nextIntentName, slots) => {

    return {
        "sessionState": {
            "sessionAttributes": sessionAttributes,
            "dialogAction": {
                "slotElicitationStyle": "Default",
                "slotToElicit": "string",
                "type": "Delegate"
            },
            "intent": {
                "confirmationState": "Confirmed",
                "name": nextIntentName,
                "slots": slots,
                "state": "ReadyForFulfillment"
            }
        },
        "messages": [],
        "requestAttributes": intentRequest['requestAttributes']
    }
}

const close = (intentRequest, sessionAttributes, fulfillmentState, message) => {
    intentRequest['sessionState']['intent']['state'] = fulfillmentState
    return {
        'sessionState': {
            'sessionAttributes': sessionAttributes,
            'dialogAction': {
                'type': 'Close'
            },
            'intent': intentRequest['sessionState']['intent']
        },
        'messages': [message],
        'sessionId': intentRequest['sessionId'],
        'requestAttributes': intentRequest['requestAttributes']
    }
}

const queryMinerva = async (payload) => {
    const funcName = 'arn:aws:lambda:ap-southeast-1:868750684322:function:minerva-getdata'

    const client = new LambdaClient({region: 'ap-southeast-1'});
    const command = new InvokeCommand({
      FunctionName: funcName,
      Payload: JSON.stringify(payload),
      LogType: 'Tail',
    });
  
    const { Payload, LogResult } = await client.send(command);
    const result = JSON.parse(Buffer.from(Payload));
    return result;
}

const translateTextZH = async (rawText) => {
    const funcName = 'arn:aws:lambda:ap-southeast-2:868750684322:function:Chatbot-Translate'

    const payload = {
        "text": rawText,
        "sourceLang": "en",
        "targetLang": "zh"
      }
    const client = new LambdaClient({region: 'ap-southeast-2'});
    const command = new InvokeCommand({
      FunctionName: funcName,
      Payload: JSON.stringify(payload),
      LogType: 'Tail',
    });
  
    const { Payload, LogResult } = await client.send(command);
    const result = JSON.parse(Buffer.from(Payload));
    return result;
}

const stopInfoFromName = async (stopName) => {
    const payload = {
        "query": {
            "stopName": stopName
        }, 
        "collection": "stops",
        "limit": "1"
    }

    const resp = await queryMinerva(payload)
    const stopInfo = resp['result'][0]

    return stopInfo
}

const distanceFromLatLonInKm = (lat1,lon1,lat2,lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180)
  }

const secondsToHms = (d) => {
    d = Number(d)
    const h = Math.floor(d / 3600)
    const m = Math.floor(d % 3600 / 60)
    const s = Math.floor(d % 3600 % 60)

    const hDisplay = h > 0 ? h + (h == 1 ? ' hr ' : ' hrs ') : ''
    const mDisplay = m > 0 ? m + (m == 1 ? ' min ' : ' mins ') : ''
    const sDisplay = s > 0 ? s + 's' : ''
    return hDisplay + mDisplay + sDisplay
}

const getNextBusTime = async (intentRequest) => {
    const sessionAttributes = getSessionAttributes(intentRequest)
    try{
        const serviceNo = getSlot(intentRequest, 'ServiceNo')
        var busStop = getSlot(intentRequest, 'BusStop')

        if(busStop == null){
            if(sessionAttributes['stops'] != null){
                const stopsAttr = JSON.parse(sessionAttributes['stops'])
                const cachedStops = stopsAttr['busstops']
                var suggestedStops = []

                for (let i = 0; i < cachedStops.length; i++) {
                    const thisStop = cachedStops[i]
                    const suggestion = {
                        "title": `${thisStop['name']} (${thisStop['code']})`,
                        "message": thisStop['code']
                    }
                    suggestedStops.push(suggestion)
                
                }

                var ans = "From which bus stop?"
                if(sessionAttributes['language'] == 'zh'){
                    const translateResp = await translateTextZH(ans)
                    ans = translateResp.toString()
                }

                const answer = {
                    "message": ans,
                    "platform": "kommunicate",
                    "metadata": {
                        "contentType": "300",
                        "templateId": "6",
                        "payload": suggestedStops
                    }
                }
    
                const message = {
                    'contentType': 'CustomPayload', 
                    'content': JSON.stringify(answer)
                }

                return elicitSlotMsg(intentRequest, sessionAttributes, 'BusStop', [message])

            }
            else{
                return elicitSlot(intentRequest, sessionAttributes, 'BusStop')
            }
        }

        if(serviceNo == null){
            if(busStop != null){
                const payload = {
                    "query": {
                        "stopInfo.busStop": parseInt(busStop)
                    },
                    "collection": "routes",
                    "limit": "100"
                }
            
                const resp = await queryMinerva(payload)
                const routeInfo = resp['result']

                var suggestedServices = []

                for (let i = 0; i < routeInfo.length; i++) {
                    const service = routeInfo[i]['service']['service']
                    const suggestion = {
                        "title": service,
                        "message": service
                    }
                    suggestedServices.push(suggestion)
                }

                if(suggestedServices.length == 0){
                    return elicitSlot(intentRequest, sessionAttributes, 'ServiceNo')
                }

                var ans = 'For which service?'

                if(sessionAttributes['language'] == 'zh'){
                    const translateResp = await translateTextZH(ans)
                    ans = translateResp.toString()
                }

                const answer = {
                    "message": ans,
                    "platform": "kommunicate",
                    "metadata": {
                        "contentType": "300",
                        "templateId": "6",
                        "payload": suggestedServices
                    }
                }
    
                const message = {
                    'contentType': 'CustomPayload', 
                    'content': JSON.stringify(answer)
                }

                // intentRequest['sessionState']['intent']['state'] = 'InProgress'
                // return {
                //     "sessionState": {
                //         "sessionAttributes": sessionAttributes,
                //         "dialogAction": {
                //             "slotToElicit": 'ServiceNo',
                //             "type": "ElicitSlot"
                //         },
                //         'intent': intentRequest['sessionState']['intent']
                //     },
                //     "messages": [message],
                //     "requestAttributes": intentRequest['requestAttributes']
                // }
                return elicitSlotMsg(intentRequest, sessionAttributes, 'ServiceNo', [message])
            }
            else{
                return elicitSlot(intentRequest, sessionAttributes, 'ServiceNo')
            }
        }
        
        var answer = ''
        
        const response = await fetch(`http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${busStop}&${serviceNo}`, {
                method: 'GET',
                headers: { 'AccountKey': `${LtaApiKey}`, 'Content-Type': 'application/json' }
            })
            
        const data = await response.json()
    
        if (data == null){
            const message = {
                'contentType': 'PlainText',
                'content': "Uh oh, we couldn't find the information you were looking for. Please try again later."
            }
            
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)
        }
        
        if (data.Services.length > 0) {
                for (let i=0; i < data.Services.length; i++) {
                    if (data.Services[i].ServiceNo == serviceNo) {
                        
                        let nextArrivalUtc = moment(data.Services[i].NextBus.EstimatedArrival).utc()
                        if (nextArrivalUtc.isBefore(moment())) {
                            // bus left
                            nextArrivalUtc = moment(data.Services[i].NextBus2.EstimatedArrival).utc()
                        }
                        const diff = moment(nextArrivalUtc, 'h:mm:ss').fromNow()
                    
                        answer = `The next bus ${serviceNo} arrives in ${diff}.`
                    }
                }
                if (answer == ''){
                    answer = serviceNo + " is not running at this bus stop currently."
                }
            } else {
                answer = 'There are no buses running at this bus stop currently.'
            }

            if(sessionAttributes['language'] == 'zh'){
                const translateResp = await translateTextZH(answer)
                answer = translateResp.toString()
            }
            
            const message = {
                'contentType': 'PlainText',
                'content': answer
            }
            
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }
    catch(error) {
        const message = {
            'contentType': 'PlainText',
            'content': "Sorry, we couldn't get the information you're looking for."
     }
     
     return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }

}

const getInterchangeFromService = async (intentRequest) => {
    const sessionAttributes = getSessionAttributes(intentRequest)
    try {

        const serviceNo = getSlot(intentRequest, 'ServiceNo')
        
        const payload = {
            "query": {
                "service": serviceNo
            },
            "collection": "services",
            "limit": "200"
        }
    
        const resp = await queryMinerva(payload)
        const route = resp['result'][0]['route']
    
        var answer = `The service ${serviceNo} goes between Bus Stop ${route['originStop']['stopName']} (${route['originStop']['code']}) and Bus Stop ${route['destinationStop']['stopName']} (${route['destinationStop']['code']}).`
        
        if(sessionAttributes['language'] == 'zh'){
            const translateResp = await translateTextZH(answer)
            answer = translateResp.toString()
        }
        
        const message = {
               'contentType': 'PlainText',
               'content': answer
        }
        
        return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }
    catch(error) {
        const message = {
            'contentType': 'PlainText',
            'content': error.toString()
     }
     
     return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }
}

const getClosestBusStops = async (intentRequest) => {
    var sessionAttributes = getSessionAttributes(intentRequest)

    try{
        var lat;
        var lng;
        var radius = getSlot(intentRequest, 'Radius')
        
        if (radius == null){
            radius = 500
        }

        if(sessionAttributes['latitude']!=null && sessionAttributes['longitude']!=null){
            // get from session variables
            lat = sessionAttributes['latitude']
            lng = sessionAttributes['longitude']
        }
        else{
            // elicit address slot
            const address = getSlot(intentRequest, 'Address')

            if (address == null){
                return elicitSlot(intentRequest, sessionAttributes, 'Address')
            }

            if(address.trim().toLowerCase() == 'kommunicatemediaevent'){

                // User sent location as response.
                const requestAttributes = intentRequest['requestAttributes']

                const attachmentStr = requestAttributes['attachments']
                const latKeyword = '{\"lat\":'
                const lonKeyword = ',\"lon\":'
            
                const lati = attachmentStr.substring(
                    attachmentStr.indexOf(latKeyword) + latKeyword.length,
                    attachmentStr.indexOf(lonKeyword)
                )
                const longi = attachmentStr.substring(
                    attachmentStr.indexOf(lonKeyword) + lonKeyword.length,
                    attachmentStr.indexOf('}}]')
                )
    
                sessionAttributes['latitude'] = lati
                sessionAttributes['longitude'] = longi
                lat = lati
                lng = longi       
                    
            }
            else{
                const formattedAddress = encodeURIComponent(address)
    
                const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&components=country:SG&key=${GglApiKey}`
                const geocodeResponse = await fetch(geocodeURL, {
                    method: 'GET',
                    headers: {}
                })
            
                const geocodeData = await geocodeResponse.json()
            
                if (geocodeData == null){
                    const message = {
                        'contentType': 'PlainText',
                        'content': "We could not find your provided address. Please check that you've provided the right one."
                    }
                    return close(intentRequest, sessionAttributes, 'Fulfilled', message)
                }
            
                const coords = geocodeData['results'][0]['geometry']['location']
                lat = coords['lat']
                lng = coords['lng']
                sessionAttributes['latitude'] = coords['lat']
                sessionAttributes['longitude'] = coords['lng']
            }
        }

        var answerText = ""
        var cardBtns = []

        if(sessionAttributes['stops'] != null){
            const stopsAttr = JSON.parse(sessionAttributes['stops'])
            if(stopsAttr['lat'] == lat && stopsAttr['lng'] == lng){

                const cachedStops = stopsAttr['busstops']
                 
                if (cachedStops.length == 5){
                    answerText = 'Here are the 5 bus stops closest to you right now.'
                }
                else{
                    answerText = `Here are ${cachedStops.length} bus stops within ${radius} metres of your address.`
                }

                for (let i = 0; i < cachedStops.length; i++) {
                    const thisStop = cachedStops[i]
                    const button = { "name": `${thisStop['name']} (${thisStop['code']})`,
                                    "action": {
                                    "type": "link",
                                    "payload": {
                                        "url": `https://d2jvkzfrk526ww.cloudfront.net/ring?stop=${thisStop['code']}`
                                        }
                                    }
                                    }
                            
                
                    //nearestStops.push(thisStop)
                    cardBtns.push(button)
                
                }
            }
        }
        

        if(cardBtns.length == 0){
            const type = 'transit_station'
            const nearbysearchURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lng}&radius=${radius}&type=${type}&key=${GglApiKey}`
        
            //const nearbysearchURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords['lat']}%2C${coords['lng']}&type=${type}&rankby=distance&key=${GglApiKey}`
            //const findPlaceURL = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${address}&inputtype=textquery&locationbias=circle%3A${radius}%40${coords['lat']}%2C${coords['lng']}&fields=formatted_address%2Cname%2Cgeometry%2Ctype&key=${GglApiKey}`
        
            const nearbysearchResponse = await fetch(nearbysearchURL, {
                method: 'GET',
                headers: {}
            })
        
            const nearbysearchData = await nearbysearchResponse.json()
        
            if (nearbysearchData == null){
                const message = {
                    'contentType': 'PlainText',
                    'content': "Sorry, We couldn't find the information you're looking for."
                }
                return close(intentRequest, sessionAttributes, 'Fulfilled', message)
            }
        
            var nearestStops = []
        
            if (nearbysearchData['results'].length == 0) {
                const answer = `There are no bus stops near this address.`
                const message = {
                    'contentType': 'PlainText',
                    'content': answer
                }
                return close(intentRequest, sessionAttributes, 'Fulfilled', message)
            }

            if (nearbysearchData['results'].length > 5){
                answerText = 'Here are the 5 bus stops closest to you right now.'
            }
            else{
                answerText = `Here are ${nearbysearchData['results'].length} bus stops within ${radius} metres of your address.`
            }
        


            var numOfStops = nearbysearchData['results'].length
            
            if(numOfStops > 5){
                numOfStops = 5
            }
        
            for (let i = 0; i < numOfStops; i++) {
        
                const thisName = nearbysearchData['results'][i]['name']
                const thisStopInfo = await stopInfoFromName(thisName)
                if (thisStopInfo != null){
                    const thisCode = thisStopInfo['code']
                    // Minerva coords are longitude, latitude
                    // const thisDistance = distanceFromLatLonInKm(thisStopInfo['location']['coordinates'][1], thisStopInfo['location']['coordinates'][0], parseFloat(lat), parseFloat(lng)) // NaN
                    // const thisDistanceFrmt = Math.round(thisDistance*1000) // NaN

                    const button = { "name": `${thisName} (${thisCode})`,
                                    "action": {
                                    "type": "link",
                                    "payload": {
                                        "url": `https://d2jvkzfrk526ww.cloudfront.net/ring?stop=${thisCode}`
                                        }
                                    }
                                    }
                        
                    cardBtns.push(button)

                    const thisStopCache = {"name": thisName, "code": thisCode}
                    nearestStops.push(thisStopCache)
            
                }
            }

            const stopCache = JSON.stringify({
                'lat': lat,
                'lng': lng,
                'busstops': nearestStops
            })

            sessionAttributes['stops'] = stopCache
        
        }

        var tit = "Nearby bus stops"
        var desc = "Tap on a bus stop to find out more."

        if(sessionAttributes['language'] == 'zh'){
            const translateResp1 = await translateTextZH(tit)
            tit = translateResp1.toString()
            const translateResp2 = await translateTextZH(desc)
            desc = translateResp2.toString()
        }

        const answer = {
            "platform": "kommunicate",
            "metadata": {
              "contentType": "300",
              "templateId": "10",
              "payload": [
                {
                  "title": tit,
                  "description": desc,
                  "buttons": cardBtns
                }
              ]
            }
          }

          const message = {
            'contentType': 'CustomPayload', 
            'content': JSON.stringify(answer)
        }
    
        
        return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }
    catch(error) {
        const message = {
            'contentType': 'PlainText',
            'content': "Sorry, we couldn't get the information you're looking for."
     }
     
     return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }

}

const melodyIntent = async (intentRequest) => {
    var sessionAttributes = getSessionAttributes(intentRequest)

    try{
        const radius = 500;
        var lat;
        var lng;
        var cardButtons = []
        // var cardBtns = []

        if(sessionAttributes['latitude']==null || sessionAttributes['longitude']==null){

            var content = "Please provide your location using the location button (bottom right), then try again."
            if(sessionAttributes['language'] == 'zh'){
                const translateResp = await translateTextZH(content)
                content = translateResp.toString()
            }

            const message = {
                'contentType': 'PlainText',
                'content': content
            }
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)

        }
        else{
            lat = sessionAttributes['latitude']
            lng = sessionAttributes['longitude']

            if(sessionAttributes['melody'] != null){
                const melodyAttr = JSON.parse(sessionAttributes['melody'])
                if(melodyAttr['lat'] == lat && melodyAttr['lng'] == lng){
                    // use melody object.
                    cardButtons = melodyAttr['cardButtons']
                }
            }

            if(cardButtons.length == 0){

                const type = 'transit_station'
                const nearbysearchURL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lng}&radius=${radius}&type=${type}&key=${GglApiKey}`
            
                const nearbysearchResponse = await fetch(nearbysearchURL, {
                    method: 'GET',
                    headers: {}
                })
            
                const nearbysearchData = await nearbysearchResponse.json()
            
                if (nearbysearchData == null){

                    var content = "Sorry, We couldn't find the information you're looking for."
                    if(sessionAttributes['language'] == 'zh'){
                        const translateResp = await translateTextZH(content)
                        content = translateResp.toString()
                    }
        
                    const message = {
                        'contentType': 'PlainText',
                        'content': content
                    }

                    return close(intentRequest, sessionAttributes, 'Fulfilled', message)
                }
        
            
                if (nearbysearchData['results'].length == 0) {

                    var content = 'There are no bus stops near this address.'
                    if(sessionAttributes['language'] == 'zh'){
                        const translateResp = await translateTextZH(content)
                        content = translateResp.toString()
                    }

                    const message = {
                        'contentType': 'PlainText',
                        'content': content
                    }

                    return close(intentRequest, sessionAttributes, 'Fulfilled', message)
                }
        
                var numOfStops = nearbysearchData['results'].length
        
                if(numOfStops > 5){
                    numOfStops = 5
                }
            
                for (let i = 0; i < numOfStops; i++) {
            
                    const thisName = nearbysearchData['results'][i]['name']
                    const thisStopInfo = await stopInfoFromName(thisName)
                    if (thisStopInfo != null){
                        const thisCode = thisStopInfo['code']
                        const thisValue = 'melody ' + thisCode
        
                        const btn = {"text": `${thisName} (${thisCode})`, "value": thisValue}
                
                        cardButtons.push(btn)
                
                    }
                }

                const melody = JSON.stringify({
                    'lat': lat,
                    'lng': lng,
                    'cardButtons': cardButtons
                })

                sessionAttributes['melody'] = melody

            }
        }

        var tit = "Play a jingle"
        var desc = "Select a bus stop:"

        if(sessionAttributes['language'] == 'zh'){
            const translateResp1 = await translateTextZH(tit)
            tit = translateResp1.toString()
            const translateResp2 = await translateTextZH(desc)
            desc = translateResp2.toString()
        }
    
        const message = {
            "contentType": "ImageResponseCard",
            "imageResponseCard": {
                "title": tit,
                "subtitle": desc,
                "buttons": cardButtons
            }
        }

        
        return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }
    catch(error) {

     var content = "Sorry, we couldn't get the information you're looking for."
     if(sessionAttributes['language'] == 'zh'){
         const translateResp = await translateTextZH(content)
         content = translateResp.toString()
     }

     const message = {
         'contentType': 'PlainText',
         'content': content
     }
     
     return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }

}

const melodyActionIntent = async (intentRequest) => {
    var sessionAttributes = getSessionAttributes(intentRequest)

    try{

        const stopCode = getSlot(intentRequest, 'stopNum')
        const payload = {
            "query": {
                "code": stopCode
            }, 
            "collection": "stops",
            "limit": "1"
        }
    
        const resp = await queryMinerva(payload)

        if(resp['result'].length > 0){

            const stopInfo = resp['result'][0]

            const stopCodeInt = parseInt(stopCode)

            axios.post('https://gfegn6mkia.execute-api.ap-southeast-1.amazonaws.com/melody/play', { stopID: stopCodeInt })

            // const message1 = {
            //     'contentType': 'PlainText',
            //     'content': `The jingle is now playing at bus stop ${stopInfo['stopName']}`
            // }

            // const message2 = {
            //     "contentType": "ImageResponseCard",
            //     "imageResponseCard": {
            //         "title": "Ring another stop?",
            //         "buttons": [
            //             {"text": 'Yes', "value": "ring for me"},
            //             {"text": 'No', "value": "no"}
            //         ]
            //     }
            // }

            // intentRequest['sessionState']['intent']['state'] = 'Fulfilled'
            // return {
            //     'sessionState': {
            //         'sessionAttributes': sessionAttributes,
            //         'dialogAction': {
            //             'type': 'Close'
            //         },
            //         'intent': intentRequest['sessionState']['intent']
            //     },
            //     'messages': [message3],
            //     'sessionId': intentRequest['sessionId'],
            //     'requestAttributes': intentRequest['requestAttributes']
            // }
         
            //return close(intentRequest, sessionAttributes, 'Fulfilled', message1)

        }
        else{
            const message = {
                'contentType': 'PlainText',
                'content': 'Something went wrong.'
            }
         
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)
        }

    }
    catch(error) {
        const message = {
            'contentType': 'PlainText',
            'content': "Sorry, we couldn't find the bus stop you were looking for."
        }
     
        return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }

}

const getRoute = async (intentRequest) => {
    var sessionAttributes = getSessionAttributes(intentRequest)
    try{
        var from_lat;
        var from_lng;
        var to_lat;
        var to_lng;

        const toAddress = getSlot(intentRequest, 'ToAddress')
        if(toAddress == null){

            var content = "To where?"
            if(sessionAttributes['language'] == 'zh'){
                content = '去哪里?'
            }

            const message = {
                'contentType': 'PlainText',
                'content': content
            }

            // return elicitSlot(intentRequest, sessionAttributes, 'FromAddress')
            return elicitSlotMsg(intentRequest, sessionAttributes, 'ToAddress', [message])
        }

        if(sessionAttributes['latitude'] != null && sessionAttributes['longitude'] != null){
            // Current address set, Ask for address type

            const fromAddressType = getSlot(intentRequest, 'FromAddressType')

            if(fromAddressType == null){

                var msg1 = "Where are you starting your journey from?"
                var tit = "Select an option:"
                var currLoc_text = "My current location"
                var another_text = "Another location"

                if(sessionAttributes['language'] == 'zh'){
                    msg1 = "你从哪里开始你的旅程?"
                    tit = "选择一个选项:"
                    currLoc_text = "我现在的位置"
                    another_text = "另一个位置"
                }

                const message1 = {
                    'contentType': 'PlainText',
                    'content': msg1
                }
                
                const message2 = {
                    "contentType": "ImageResponseCard",
                    "imageResponseCard": {
                        "title": tit,
                        "buttons": [
                            {"text": currLoc_text, "value": "Current location"},
                            {"text": another_text, "value": "Address"}
                        ]
                    }
                }

                // return elicitSlot(intentRequest, sessionAttributes, 'FromAddressType')
                return elicitSlotMsg(intentRequest, sessionAttributes, 'FromAddressType', [message1, message2])
            }
            else if(fromAddressType.trim().toLowerCase() == 'currentlocation'){
                // Get session attributes

                from_lat = sessionAttributes['latitude']
                from_lng = sessionAttributes['longitude']
            }
            else{

                // Address prompt, as chosen by user
                const fromAddress = getSlot(intentRequest, 'FromAddress')
                if(fromAddress == null){

                    var content = "From where?"
                    if(sessionAttributes['language'] == 'zh'){
                        content = '从哪里?'
                    }

                    const message = {
                        'contentType': 'PlainText',
                        'content': content
                    }

                    // return elicitSlot(intentRequest, sessionAttributes, 'FromAddress')
                    return elicitSlotMsg(intentRequest, sessionAttributes, 'FromAddress', [message])
                }
                const from_formattedAddress = encodeURIComponent(fromAddress)
                const from_geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${from_formattedAddress}&components=country:SG&key=${GglApiKey}`
                const from_geocodeResponse = await fetch(from_geocodeURL, {
                    method: 'GET',
                    headers: {}
                })
                const from_geocodeData = await from_geocodeResponse.json()
            
                if (from_geocodeData == null){
                    const message = {
                        'contentType': 'PlainText',
                        'content': "We could not generate any itineraries for your requested route. Please check that you've provided a valid starting address."
                    }
            
                    return close(intentRequest, sessionAttributes, 'Fulfilled', message)
                }
            
                const from_coords = from_geocodeData['results'][0]['geometry']['location']
                from_lat = from_coords['lat']
                from_lng = from_coords['lng']

            }

        }
        else{
            // Address prompt by default
            const fromAddress = getSlot(intentRequest, 'FromAddress')

            if(fromAddress == null){

                var content = "From where?"
                    if(sessionAttributes['language'] == 'zh'){
                        content = '从哪里?'
                    }

                    const message = {
                        'contentType': 'PlainText',
                        'content': content
                    }

                    // return elicitSlot(intentRequest, sessionAttributes, 'FromAddress')
                    return elicitSlotMsg(intentRequest, sessionAttributes, 'FromAddress', [message])
                
            }
            const from_formattedAddress = encodeURIComponent(fromAddress)
            const from_geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${from_formattedAddress}&components=country:SG&key=${GglApiKey}`
            const from_geocodeResponse = await fetch(from_geocodeURL, {
                method: 'GET',
                headers: {}
            })
            const from_geocodeData = await from_geocodeResponse.json()
        
            if (from_geocodeData == null){
                const message = {
                    'contentType': 'PlainText',
                    'content': "We could not generate any itineraries for your requested route. Please check that you've provided a valid starting address."
                }
        
                return close(intentRequest, sessionAttributes, 'Fulfilled', message)
            }
        
            const from_coords = from_geocodeData['results'][0]['geometry']['location']
            from_lat = from_coords['lat']
            from_lng = from_coords['lng']
        }

        const mode = getSlot(intentRequest, 'Mode')

        if(mode == null){

            var msg1 = "Any preferred mode of transport?"
            var tit = "Select an option:"
            var noPref_text = 'No preference'
            var bus_text = 'Bus'
            var train_text = 'Train (MRT)'

            if(sessionAttributes['language'] == 'zh'){
                msg1 = "有什么首选的交通方式吗？"
                tit = "选择一个选项:"
                noPref_text = '没有偏好'
                bus_text = '巴士'
                train_text = '火车 (MRT)'

            }

            const message1 = {
                'contentType': 'PlainText',
                'content': msg1
            }
            
            const message2 = {
                "contentType": "ImageResponseCard",
                "imageResponseCard": {
                    "title": tit,
                    "buttons": [
                        {"text": noPref_text, "value": "TRANSIT"},
                        {"text": bus_text, "value": "BUS"},
                        {"text": train_text, "value": "RAIL"}
                    ]
                }
            }

            return elicitSlotMsg(intentRequest, sessionAttributes, 'Mode', [message1, message2])

            // return elicitSlot(intentRequest, sessionAttributes, 'Mode')
        }

        //const toAddress = getSlot(intentRequest, 'ToAddress')
        const to_formattedAddress = encodeURIComponent(toAddress)
        const to_geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${to_formattedAddress}&components=country:SG&key=${GglApiKey}`
        const to_geocodeResponse = await fetch(to_geocodeURL, {
            method: 'GET',
            headers: {}
        })
        const to_geocodeData = await to_geocodeResponse.json()
    
        if (to_geocodeData == null){
            const message = {
                'contentType': 'PlainText',
                'content': "We could not generate any itineraries for your requested route. Please check that you've provided a valid destination address."
            }
    
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)
        }
    
        const to_coords = to_geocodeData['results'][0]['geometry']['location']
        to_lat = to_coords['lat']
        to_lng = to_coords['lng']
    
        const today = new Date()
        const date = today.getMonth() + 1 + '-' + today.getDate() + '-' + today.getFullYear()
        // const time = today.toLocaleTimeString()
        const time = '10:30:00'
    
        // TRANSIT, BUS, RAIL
        // const mode = 'TRANSIT'
    
        const routingURL = `https://developers.onemap.sg/privateapi/routingsvc/route?start=${from_lat},${from_lng}&end=${to_lat},${to_lng}&routeType=pt&token=${OneMapApiToken}&date=${date}&time=${time}&mode=${mode}`
    
        const routeResponse = await fetch(routingURL, {
            method: 'GET',
            headers: {}
        })
    
        const routeData = await routeResponse.json()
    
        if (routeData == null){
            const message = {
                'contentType': 'PlainText',
                'content': `We could not generate any itineraries for your requested route! Please check that you've provided valid addresses.`
            }
    
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)
        }
    
        let answer = ''
        let html_answer = ''
        let numOfItinerary = 0
        try {
            numOfItinerary = routeData['plan']['itineraries'].length
        }
        catch{
            const message = {
                'contentType': 'PlainText',
                'content': `We could not generate any itineraries for your requested route! Please check that you've provided valid addresses.`
            }
    
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)
        }
    
        if (numOfItinerary == 0){
            answer = 'We could not generate any itineraries for your requested route! Please try again later.'
            html_answer = '<p>We could not generate any itineraries for your requested route! Please try again later.</p>'
        }
        else{
            answer = `${numOfItinerary} itineraries have been generated.`
            html_answer = `<p>${numOfItinerary} routes have been generated. from:</p>`
            for (let i=0; i < numOfItinerary; i++) {
                const thisItinerary = routeData['plan']['itineraries'][i]
        
                // duration is in seconds
                const duration = secondsToHms(thisItinerary['duration'])
                let priceText = 'Unavailable'
                if (thisItinerary['fare'] != 'info unavailable') {
                    priceText = `$${thisItinerary['fare']}`
                }
                const numSteps = thisItinerary['legs'].length
        
                answer += `\nItinerary #${i+1}: Takes ${duration}${priceText}, And has ${numSteps} steps:\n`
                html_answer += `<h5><u>Route ${i+1}</u></h5><b>Duration:</b> ${duration} </br><b>Cost:</b> ${priceText} </br><b>${numSteps} steps:</b><ol>`

        
                for (let j=0; j < numSteps; j++) {
                    answer += `Step ${j+1}: `
 
                    html_answer += `<li>`
                    const thisStep = thisItinerary['legs'][j]

        
                    const mode = thisStep['mode']
        
                    let origin = ''
                    if (j == 0) {
                        origin = 'from your starting point '
                    }
        
                    const toObj = thisStep['to']
                    const toVertex = toObj['vertexType']
                    let toWhere = ''
        
                    if (toVertex == 'TRANSIT' && (/[a-z]/i.test(toObj['stopCode']) == false)) {
                        toWhere = `Bus stop ${toObj['name']} (${toObj['stopCode']})`
                    } else {
                        toWhere = toObj['name']
                    }
        
                    if (mode == 'WALK') {
                        // distance is in metres
                        const distance = Math.round(thisStep['distance'])
                        const direction = thisStep['steps'][0]['absoluteDirection']
                        answer += `Walk ${distance} metres ${direction} ${origin}to ${toWhere}.`
                        html_answer+= `Walk ${distance} metres ${direction} ${origin}to ${toWhere}. </li>`
                    } else if (mode == 'BUS') {
                        const busNum = thisStep['route']
                        const destinationIndex = toObj['stopIndex']
                        const originIndex = thisStep['from']['stopIndex']
                        const numStops = parseInt(destinationIndex) - parseInt(originIndex)
        
                        answer += `Take bus ${busNum} ${origin}to ${toWhere}. (${numStops} stops)`
                        html_answer+= `Take bus ${busNum} ${origin}to ${toWhere}. (${numStops} stops) </li>`
                    } else if (mode == 'SUBWAY') {
                        const routeName = thisStep['routeLongName']
                        const destinationIndex = toObj['stopIndex']
                        const originIndex = thisStep['from']['stopIndex']
                        const numStops = parseInt(destinationIndex) - parseInt(originIndex)
                        answer += `Take the ${routeName} ${origin}to ${toWhere}. (${numStops} stops)`
                        html_answer+= `Take the ${routeName} ${origin}to ${toWhere}. (${numStops} stops) </li>`
                    }
                    html_answer+= '</li>'
                }
                html_answer+= '</ol>'
            }
    
        }
    
        // const message = {
        //     'contentType': 'PlainText',
        //     'content': answer
        // }

        if(sessionAttributes['language'] == 'zh'){
            const translateResp = await translateTextZH(html_answer)
            html_answer = translateResp.toString()
        }
    
        const html_message = {
            "messageType":"html",
            "platform": "kommunicate",
            "message": html_answer
          }
    
        const message = {
            'contentType': 'CustomPayload',
            'content': JSON.stringify(html_message)
        }
    
        return close(intentRequest, sessionAttributes, 'Fulfilled', message)

    }
    catch {
        const message = {
            'contentType': 'PlainText',
            'content': "Sorry, we couldn't get the information you're looking for."
     }
     
     return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }
}

const setCurrentLocation = async (intentRequest) => {
    const sessionAttributes = getSessionAttributes(intentRequest)
    const requestAttributes = intentRequest['requestAttributes']

    try{
        if(requestAttributes['attachments'] == '[]'){
            return delegate(intentRequest, sessionAttributes, 'FallbackIntent', {})
        }
        else{
            const attachmentStr = requestAttributes['attachments']
            const latKeyword = '{\"lat\":'
            const lonKeyword = ',\"lon\":'
        
            const lat = attachmentStr.substring(
                attachmentStr.indexOf(latKeyword) + latKeyword.length,
                attachmentStr.indexOf(lonKeyword)
            )
            const lon = attachmentStr.substring(
                attachmentStr.indexOf(lonKeyword) + lonKeyword.length,
                attachmentStr.indexOf('}}]')
            )

            sessionAttributes['latitude'] = lat
            sessionAttributes['longitude'] = lon

            const answer = 'Your current location has been updated.'

            const message = {
                'contentType': 'PlainText',
                'content': answer
            }
            
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)

        }
    
    }
    catch(e){
        // answer = JSON.stringify(e)
        const message = {
            'contentType': 'PlainText',
            'content': JSON.stringify(e)
        }
        
        return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }

}

const setLanguage = async (intentRequest) => {
    const sessionAttributes = getSessionAttributes(intentRequest)

    try{
        const language = getSlot(intentRequest, 'Language')
        var answer;

        if(language != null){
            sessionAttributes['language'] = language
            answer = `Your language has been updated to ${language}.`

            if(sessionAttributes['language'] == 'zh'){
                const translateResp = await translateTextZH(answer)
                answer = translateResp.toString()
            }

            const message = {
                'contentType': 'PlainText',
                'content': answer
            }
            
            return close(intentRequest, sessionAttributes, 'Fulfilled', message)
        }
        else{

            var msg = "Which language would you like to change to?"
            if(sessionAttributes['language'] == 'zh'){
                const translateResp = await translateTextZH(msg)
                msg = translateResp.toString()
            }

            const answer = {
                "message": msg,
                "platform": "kommunicate",
                "metadata": {
                    "contentType": "300",
                    "templateId": "6",
                    "payload": [{
                        "title": '中文',
                        "message": 'zh'
                        },
                        {
                            "title": 'English',
                            "message": 'en'
                        }
                    ]
                }
            }

            const message = {
                'contentType': 'CustomPayload', 
                'content': JSON.stringify(answer)
            }

            // intentRequest['sessionState']['intent']['state'] = 'InProgress'
            // return {
            //     "sessionState": {
            //         "sessionAttributes": sessionAttributes,
            //         "dialogAction": {
            //             "slotToElicit": 'Language',
            //             "type": "ElicitSlot"
            //         },
            //         'intent': intentRequest['sessionState']['intent']
            //     },
            //     "messages": [message],
            //     "requestAttributes": intentRequest['requestAttributes']
            // }
            return elicitSlotMsg(intentRequest, sessionAttributes, 'Language', [message])
        }

    }
    catch(e){
        // answer = JSON.stringify(e)
        const message = {
            'contentType': 'PlainText',
            'content': JSON.stringify(e)
        }
        
        return close(intentRequest, sessionAttributes, 'Fulfilled', message)
    }

}



const dispatch = (intentRequest) => {
    const intentName = intentRequest['sessionState']['intent']['name']
    var response = null
    if (intentName == 'GetNextBusTime'){
        return getNextBusTime(intentRequest)
    }
    else if (intentName == 'GetInterchangeFromService'){
        return getInterchangeFromService(intentRequest)
    }
    else if (intentName == 'GetClosestBusStops'){
        return getClosestBusStops(intentRequest)
    }
    else if (intentName == 'GetRoute'){
        return getRoute(intentRequest)
    }
    else if(intentName == 'SetCurrentLocation'){
        return setCurrentLocation(intentRequest)
    }
    else if(intentName == 'SetLanguage'){
        return setLanguage(intentRequest)
    }
    else if(intentName == 'MelodyIntent'){
        return melodyIntent(intentRequest)
    }
    else if(intentName == 'MelodyActionIntent'){
        return melodyActionIntent(intentRequest)
    }
    
}

export const handler = async (event, context, callback) => {
    const response = await dispatch(event)
    return response
}