// on Lambda side

//SendMessage
var AWS = require('aws-sdk');
var sqs = new AWS.SQS();

// For Standard Queue
exports.handler = async (event) => {
    
    var params = {
      DelaySeconds: 2,
      MessageAttributes: {
        "Author": {
          DataType: "String",
          StringValue: "Voon Qiao Qing"
        },
      },
      MessageBody: "TEST of the SQS service.",
      QueueUrl: "https://sqs.ap-southeast-1.amazonaws.com/358578802142/ecp-sqs-queue"
    };
    
    let queueRes = await sqs.sendMessage(params).promise();
    const response = {
        statusCode: 200,
        body: queueRes,
    };
    
    return response;
};

//ReceiveMessage
var AWS = require('aws-sdk');
var sqs = new AWS.SQS();
var queueURL = "https://sqs.ap-southeast-1.amazonaws.com/358578802142/ecp-sqs-queue";


// For Standard Queue
exports.handler = async (event) => {
    
    var params = {
         AttributeNames: [
            "SentTimestamp"
         ],
         MaxNumberOfMessages: 10,
         MessageAttributeNames: [
            "All"
         ],
         QueueUrl: queueURL,
         VisibilityTimeout: 20,
         WaitTimeSeconds: 0
    };
    
    let queueRes = await sqs.receiveMessage(params).promise();
    const response = {
        statusCode: 200,
        body: queueRes,
    };
    
    return response;
};

