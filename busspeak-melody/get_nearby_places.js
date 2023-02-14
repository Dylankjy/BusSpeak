// Axios
const axios = require('axios')

// AWS SDK for Lambda
const AWS = require('aws-sdk')

const lambda = new AWS.Lambda({
    region: 'ap-southeast-1'
})

module.exports.handler = async (event, context, callback) => {
    // wait for all promises to resolve
    context.callbackWaitsForEmptyEventLoop = false

    const body = JSON.parse(event.body)

    const { location } = body

    const closestLocationRes = await axios.post(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.long}&key=${process.env.GOOGLE_MAPS_APIKEY}&types=point_of_interest`)

    const closestLocation = closestLocationRes.data.results[0].address_components[0].long_name

    const params = {
        FunctionName: 'minerva-getdata',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
            'query': {
                'location': {
                    '$near': {
                        '$geometry': {
                            'type': 'Point',
                            'coordinates': [location.long, location.lat]
                        },
                        // '$minDistance': 0,
                        '$maxDistance': 500
                    }
                }
            },
            'limit': 25,
            'collection': 'stops'
        })
    }

    const lambdaRes = await lambda.invoke(params).promise()
    const lambdaResParsed = JSON.parse(lambdaRes.Payload)
    
    console.log(lambdaResParsed)

    return {
        'statusCode': 200,
        'headers': { 'Content-Type': 'application/json' },
        'body': JSON.stringify({
            nearbyLocation: closestLocation,
            result: lambdaResParsed.result
        })
    }
}
