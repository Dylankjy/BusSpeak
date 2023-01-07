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

//S3 Response API
S3ResponseAPI = {
"Labels":[
  {
      "Name": "BusSmth",
      "Confidence": 99.99717712402344,
      "Instances": [],
      "Parents": [
          { 
          "Name": "Bus" 
          }
       ],
      "Aliases": [
          {
          "Name": "Vehicle" 
          }
       ]
  }
]};

// var arrival_msg = "Your " + S3ResponseAPI['Labels'][0]['Parents'][0].Name + " has arrived".toString();
var arrival_msg = "bus"
// Setup the sendMessage parameter object
const params = {
  MessageBody: JSON.stringify({
    arrival_msg: arrival_msg,
    date: (new Date()).toISOString()
  }),
  QueueUrl: `https://sqs.ap-southeast-1.amazonaws.com/${accountId}/${queueName}`
};
//console.log(S3ResponseAPI['Labels'][0]['Parents'][0].Name);

sqs.sendMessage(params, (err, data) => {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Successfully added message", data.MessageId);
  }
});