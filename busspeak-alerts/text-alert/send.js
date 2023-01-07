module.exports = {
  S3CustomLabels: function() {
    const S3CustomLabels = {
      CustomLabels: [
        {
          Name: 'busNumber',
          Confidence: 38.54399871826172,
          Geometry: [Object]
        }
      ],
      ResponseMetadata: {
        RequestId: 'ffe442fb-13fa-417f-a659-4e198f7034d0',
        HTTPStatusCode: 200,
        HTTPHeaders: {
          'x-amzn-requestid': 'ffe442fb-13fa-417f-a659-4e198f7034d0',
          'content-type': 'application/x-amz-json-1.1',
          'content-length': '208',
          date: 'Fri, 06 Jan 2023 08:28:28 GMT'
        },
        RetryAttempts: 0
      }
    }
    return S3CustomLabels['CustomLabels'][0]['Name'];
  },
  S3CustomLabelText: function() {
    const S3CustomLabelText = {
      TextDetections: [
        {
          DetectedText: '983',
          Type: 'LINE',
          Id: 0,
          Confidence: 99.81364440917969,
          Geometry: [Object]
        },
        {
          DetectedText: '983',
          Type: 'WORD',
          Id: 1,
          ParentId: 0,
          Confidence: 99.81364440917969,
          Geometry: [Object]
        }
      ],
      TextModelVersion: '3.0',
      ResponseMetadata: {
        RequestId: 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
        HTTPStatusCode: 200,
        HTTPHeaders: {
          'x-amzn-requestid': 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
          'content-type': 'application/x-amz-json-1.1',
          'content-length': '900',
          date: 'Fri, 06 Jan 2023 08:28:29 GMT'
        },
        RetryAttempts: 0
      }
    }
    return S3CustomLabelText['TextDetections'][0]['DetectedText'];
  },
  activateSQS: async function(busNumber) {
    //isBusOrNot, isBusNumberOrNot, 
    
    // Load the AWS SDK for Node.js
    const AWS = require('aws-sdk');
    // Set the region we will be using
    AWS.config.loadFromPath('./config.json');
    AWS.config.update({region: 'ap-southeast-1'});

    // Create SQS service client
    const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

    // Replace with your accountid and the queue name you setup
    const accountId = '868750684322';
    const queueName = 'Bus-SQSQueue';

    // Setup the sendMessage parameter object
    const params = {
      MessageBody: JSON.stringify({
        arrival_msg: busNumber + " has arrived!",
        date: (new Date()).toISOString()
      }),
      QueueUrl: `https://sqs.ap-southeast-1.amazonaws.com/${accountId}/${queueName}`
    };
    //console.log(S3CustomLabels['CustomLabels'][0]['Name']);
    //console.log(S3CustomLabelText['TextDetections'][0]['DetectedText']);
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        console.log("Error", err);
      } else {
          console.log("Successfully added message", data.MessageId);
      }
    });
  }
};

// module.exports = { S3CustomLabels, S3CustomLabelText, activateSQS }

// module.exports = {
//   S3CustomLabels: function() {
//     const S3CustomLabels = {
//         CustomLabels: [
//           {
//             Name: 'busNumber',
//             Confidence: 38.54399871826172,
//             Geometry: [Object]
//           }
//         ],
//         ResponseMetadata: {
//           RequestId: 'ffe442fb-13fa-417f-a659-4e198f7034d0',
//           HTTPStatusCode: 200,
//           HTTPHeaders: {
//             'x-amzn-requestid': 'ffe442fb-13fa-417f-a659-4e198f7034d0',
//             'content-type': 'application/x-amz-json-1.1',
//             'content-length': '208',
//             date: 'Fri, 06 Jan 2023 08:28:28 GMT'
//           },
//           RetryAttempts: 0
//         }
//       }
//       return S3CustomLabels;
//     },
//   S3CustomLabelText: function() {
//     const S3CustomLabelText = {
//       TextDetections: [
//         {
//           DetectedText: '983',
//           Type: 'LINE',
//           Id: 0,
//           Confidence: 99.81364440917969,
//           Geometry: [Object]
//         },
//         {
//           DetectedText: '983',
//           Type: 'WORD',
//           Id: 1,
//           ParentId: 0,
//           Confidence: 99.81364440917969,
//           Geometry: [Object]
//         }
//       ],
//       TextModelVersion: '3.0',
//       ResponseMetadata: {
//         RequestId: 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
//         HTTPStatusCode: 200,
//         HTTPHeaders: {
//           'x-amzn-requestid': 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
//           'content-type': 'application/x-amz-json-1.1',
//           'content-length': '900',
//           date: 'Fri, 06 Jan 2023 08:28:29 GMT'
//         },
//         RetryAttempts: 0
//       }
//     }
//     return S3CustomLabelText;
//   },
//   activateSQS: function() {
//     // Load the AWS SDK for Node.js
//     const AWS = require('aws-sdk');
//     // Set the region we will be using
//     AWS.config.loadFromPath('./config.json');
//     AWS.config.update({region: 'ap-southeast-1'});

//     // Create SQS service client
//     const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

//     // Replace with your accountid and the queue name you setup
//     const accountId = '868750684322';
//     const queueName = 'Bus-SQSQueue';

//     // var arrival_msg = "Your " + S3ResponseAPI['Labels'][0]['Parents'][0].Name + " has arrived".toString();
//     // var arrival_msg = S3CustomLabels['CustomLabels'][0]['Name']
//     // Setup the sendMessage parameter object
//     const params = {
//       MessageBody: JSON.stringify({
//         arrival_msg: S3CustomLabelText['TextDetections'][0]['DetectedText'] + " has arrived!",
//         date: (new Date()).toISOString()
//       }),
//       QueueUrl: `https://sqs.ap-southeast-1.amazonaws.com/${accountId}/${queueName}`
//     };
//     //console.log(S3CustomLabels['CustomLabels'][0]['Name']);
//     //console.log(S3CustomLabelText['TextDetections'][0]['DetectedText']);
//     sqs.sendMessage(params, (err, data) => {
//       if (err) {
//         console.log("Error", err);
//       } else {
//         if (S3CustomLabels['CustomLabels'][0]['Name'] == 'busNumber') {
//           if (S3CustomLabelText['TextDetections'][0]['DetectedText'] == '983') {
//             console.log("Successfully added message", data.MessageId);
//           }
//         }
//       }
//     });
//   }
// };

//module.exports = { activateSQS }

// var AWS = require('aws-sdk');
// var sqs = new AWS.SQS();

// // For Standard Queue
// exports.handler = async (event) => {
    
//     var params = {
//       DelaySeconds: 2,
//       MessageAttributes: {
//         "Author": {
//           DataType: "String",
//           StringValue: "Voon Qiao Qing"
//         },
//       },
//       MessageBody: "TEST of the SQS service.",
//       QueueUrl: "https://sqs.ap-southeast-1.amazonaws.com/358578802142/ecp-sqs-queue"
//     };
    
//     let queueRes = await sqs.sendMessage(params).promise();
//     const response = {
//         statusCode: 200,
//         body: queueRes,
//     };
//     console.log(response);
//     return response;
// };