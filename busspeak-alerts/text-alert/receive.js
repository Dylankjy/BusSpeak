const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
AWS.config.update({region: 'ap-southeast-1'});

// Create SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

// Replace with your accountid and the queue name you setup
const queueUrl = `https://sqs.ap-southeast-1.amazonaws.com/868750684322/Bus-SQSQueue`

// Setup the receiveMessage parameters
const params = {
  QueueUrl: queueUrl,
  MaxNumberOfMessages: 10,
  VisibilityTimeout: 30,
  WaitTimeSeconds: 0
};

sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {

    // for (let i = 0; i < data.Messages.length; i++) {
    //   console.log(data.Messages[i].MessageId)
    // }

    var deleteParams = {
      QueueUrl: queueUrl,
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    //console.log("Message Await Deletion", data.Messages[0]);
    var obj = JSON.parse(data.Messages[0].Body);
    console.log("Message Await Deletion", "message shown:" + obj.arrival_msg);
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  }

  //return obj.arrival_msg;
});