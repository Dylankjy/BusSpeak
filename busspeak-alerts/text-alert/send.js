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


// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region we will be using
AWS.config.update({region: 'ap-southeast-1'});

// Create SQS service client
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

// Replace with your accountid and the queue name you setup
const accountId = '358578802142';
const queueName = 'ecp-sqs-queue';

// Setup the sendMessage parameter object
const params = {
  MessageBody: JSON.stringify({
    order_id: 1234,
    date: (new Date()).toISOString()
  }),
  QueueUrl: `https://sqs.ap-southeast-1.amazonaws.com/${accountId}/${queueName}`
};

sqs.sendMessage(params, (err, data) => {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Successfully added message", data.MessageId);
  }
});