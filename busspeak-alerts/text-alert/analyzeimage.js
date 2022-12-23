
//Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)

// Load the SDK
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
AWS.config.update({region: 'ap-southeast-1'});

// const AWSParameters = {
//     'region': 'ap-southeast-1',
//     }

const bucket = 'custom-labels-console-ap-southeast-1-b064f8de29' // the bucketname without s3://
const photo  = 'double_decker_bus_singapore_13.png' // the name of file

const client = new AWS.Rekognition(AWSParameters);
const params = {
  Image: {
    S3Object: {
      Bucket: bucket,
      Name: photo
    },
  },
  MaxLabels: 10
}
client.detectLabels(params, function(err, response) {
  if (err) {
    console.log(err, err.stack); // if an error occurred
  } else {
    console.log(`Detected labels for: ${photo}`)
    response.Labels.forEach(label => {
      console.log(`Label:      ${label.Name}`)
      console.log(`Confidence: ${label.Confidence}`)
      console.log("Instances:")
      label.Instances.forEach(instance => {
        let box = instance.BoundingBox
        console.log("  Bounding box:")
        console.log(`    Top:        ${box.Top}`)
        console.log(`    Left:       ${box.Left}`)
        console.log(`    Width:      ${box.Width}`)
        console.log(`    Height:     ${box.Height}`)
        console.log(`  Confidence: ${instance.Confidence}`)
      })
      console.log("Parents:")
      label.Parents.forEach(parent => {
        console.log(`  ${parent.Name}`)
      })
      console.log("------------")
      console.log("")
    }) // for response.labels
  } // if
});
                            

// //Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// //PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)

// // Load the SDK
// var AWS = require('aws-sdk');
// AWS.config.loadFromPath('./config.json');
// AWS.config.update({region: 'ap-southeast-1'});

// const bucket = 'testanalyzebucket' // the bucketname without s3://
// const photo  = '31887235757_6f4e414890_b.jpg' // the name of file

// const client = new AWS.Rekognition();
// const params = {
//   Image: {
//     S3Object: {
//       Bucket: bucket,
//       Name: photo
//     },
//   },
//   MaxLabels: 10
// }
// client.detectLabels(params, function(err, response) {
//   if (err) {
//     console.log(err, err.stack); // if an error occurred
//   } else {
//     console.log(`Detected labels for: ${photo}`)
//     response.Labels.forEach(label => {
//       console.log(`Label:      ${label.Name}`)
//       console.log(`Confidence: ${label.Confidence}`)
//       console.log("Instances:")
//       label.Instances.forEach(instance => {
//         let box = instance.BoundingBox
//         console.log("  Bounding box:")
//         console.log(`    Top:        ${box.Top}`)
//         console.log(`    Left:       ${box.Left}`)
//         console.log(`    Width:      ${box.Width}`)
//         console.log(`    Height:     ${box.Height}`)
//         console.log(`  Confidence: ${instance.Confidence}`)
//       })
//       console.log("Parents:")
//       label.Parents.forEach(parent => {
//         console.log(`  ${parent.Name}`)
//       })
//       console.log("------------")
//       console.log("")
//     }) // for response.labels
//   } // if
// });
                            