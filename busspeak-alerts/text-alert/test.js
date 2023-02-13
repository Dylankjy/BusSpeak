

// const S3CustomLabels = {
//   CustomLabels: [
//     {
//       Name: 'busNumber',
//       Confidence: 38.54399871826172,
//       Geometry: [Object]
//     }
//   ],
//   ResponseMetadata: {
//     RequestId: 'ffe442fb-13fa-417f-a659-4e198f7034d0',
//     HTTPStatusCode: 200,
//     HTTPHeaders: {
//       'x-amzn-requestid': 'ffe442fb-13fa-417f-a659-4e198f7034d0',
//       'content-type': 'application/x-amz-json-1.1',
//       'content-length': '208',
//       date: 'Fri, 06 Jan 2023 08:28:28 GMT'
//     },
//     RetryAttempts: 0
//   }
// }

// const S3CustomLabelText = {
//   TextDetections: [
//     {
//       DetectedText: '983',
//       Type: 'LINE',
//       Id: 0,
//       Confidence: 99.81364440917969,
//       Geometry: [Object]
//     },
//     {
//       DetectedText: '983',
//       Type: 'WORD',
//       Id: 1,
//       ParentId: 0,
//       Confidence: 99.81364440917969,
//       Geometry: [Object]
//     }
//   ],
//   TextModelVersion: '3.0',
//   ResponseMetadata: {
//     RequestId: 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
//     HTTPStatusCode: 200,
//     HTTPHeaders: {
//       'x-amzn-requestid': 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
//       'content-type': 'application/x-amz-json-1.1',
//       'content-length': '900',
//       date: 'Fri, 06 Jan 2023 08:28:29 GMT'
//     },
//     RetryAttempts: 0
//   }
// }

// START RequestId: 1272d459-3cab-44e7-9f68-6d72a8bc46e2 Version: $LATEST
// {'CustomLabels': [{'Name': 'busNumber', 'Confidence': 38.54399871826172, 'Geometry': {'BoundingBox': {'Width': 0.09378000348806381, 'Height': 0.10745000094175339, 'Left': 0.4156799912452698, 'Top': 0.09431999921798706}}}], 'ResponseMetadata': {'RequestId': 'ffe442fb-13fa-417f-a659-4e198f7034d0', 'HTTPStatusCode': 200, 'HTTPHeaders': {'x-amzn-requestid': 'ffe442fb-13fa-417f-a659-4e198f7034d0', 'content-type': 'application/x-amz-json-1.1', 'content-length': '208', 'date': 'Fri, 06 Jan 2023 08:28:28 GMT'}, 'RetryAttempts': 0}}
// detect: 0.09745000094175339
// detect: 0.08378000348806382
// {'TextDetections': [{'DetectedText': '983', 'Type': 'LINE', 'Id': 0, 'Confidence': 99.81364440917969, 'Geometry': {'BoundingBox': {'Width': 0.10791847109794617, 'Height': 0.10737259685993195, 'Left': 0.40745651721954346, 'Top': 0.09454052895307541}, 'Polygon': [{'X': 0.40745651721954346, 'Y': 0.10589297115802765}, {'X': 0.504095196723938, 'Y': 0.09454052895307541}, {'X': 0.515375018119812, 'Y': 0.1905606985092163}, {'X': 0.4187363088130951, 'Y': 0.20191313326358795}]}}, {'DetectedText': '983', 'Type': 'WORD', 'Id': 1, 'ParentId': 0, 'Confidence': 99.81364440917969, 'Geometry': {'BoundingBox': {'Width': 0.09956587105989456, 'Height': 0.10737259685993195, 'Left': 0.41163283586502075, 'Top': 0.09454052895307541}, 'Polygon': [{'X': 0.41163283586502075, 'Y': 0.11075146496295929}, {'X': 0.504095196723938, 'Y': 0.09454052895307541}, {'X': 0.5111986994743347, 'Y': 0.18570218980312347}, {'X': 0.4187363088130951, 'Y': 0.20191313326358795}]}}], 'TextModelVersion': '3.0', 'ResponseMetadata': {'RequestId': 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0', 'HTTPStatusCode': 200, 'HTTPHeaders': {'x-amzn-requestid': 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0', 'content-type': 'application/x-amz-json-1.1', 'content-length': '900', 'date': 'Fri, 06 Jan 2023 08:28:29 GMT'}, 'RetryAttempts': 0}}
// END RequestId: 1272d459-3cab-44e7-9f68-6d72a8bc46e2

//console.log(S3CustomLabels['CustomLabels'][0]['Name']);
//console.log(S3CustomLabelText['TextDetections'][0]['DetectedText']);

// {
//     TextDetections: [
//       {
//         DetectedText: '983',
//         Type: 'LINE',
//         Id: 0,
//         Confidence: 99.81364440917969,
//         Geometry: [Object]
//       },
//       {
//         DetectedText: '983',
//         Type: 'WORD',
//         Id: 1,
//         ParentId: 0,
//         Confidence: 99.81364440917969,
//         Geometry: [Object]
//       }
//     ],
//     TextModelVersion: '3.0',
//     ResponseMetadata: {
//       RequestId: 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
//       HTTPStatusCode: 200,
//       HTTPHeaders: {
//         'x-amzn-requestid': 'ecdffd95-4f5a-415b-bf32-fa5479ccedd0',
//         'content-type': 'application/x-amz-json-1.1',
//         'content-length': '900',
//         date: 'Fri, 06 Jan 2023 08:28:29 GMT'
//       },
//       RetryAttempts: 0
//     }
//   }

// const AWS = require('aws-sdk');
// AWS.config.update({region: 'us-east-1'});

// async function sendtoQueue(body) {
//   var params = {
//     DelaySeconds: 0,
//     MessageAttributes:{
//       "Title": {
//         DataType: "String",
//         StringValue: "AWS SQS"
//       },
//       "Author": {
//         DataType: "String",
//         StringValue: "Wolf"
//       }
//     },
//     MessageBody: body,
//     QueueUrl: "https://sqs.us-east-1.amazonaws.com/473107870026/ecp-sqs-queue",
//   };

// const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
//   sqs.sendMessage (params, function(err, data) {
//     if (err) {
//       console.log("Error", err);
//     } else {
//       console.log("Successfully sent to Queue", data.Messageld);
//     }
//   });
// };

// const express = require("express");
// const app = express();
// const port = 3000;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
//   //sendtoQueue('test');
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}!`);
// });
