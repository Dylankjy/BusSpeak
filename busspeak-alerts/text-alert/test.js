const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

async function sendtoQueue(body) {
  var params = {
    DelaySeconds: 0,
    MessageAttributes:{
      "Title": {
        DataType: "String",
        StringValue: "AWS SQS"
      },
      "Author": {
        DataType: "String",
        StringValue: "Wolf"
      }
    },
    MessageBody: body,
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/473107870026/ecp-sqs-queue",
  };

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  sqs.sendMessage (params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Successfully sent to Queue", data.Messageld);
    }
  });
};

const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
  //sendtoQueue('test');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
