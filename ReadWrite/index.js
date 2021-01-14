const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');

// Configure the region
AWS.config.update({region: 'us-east-2'});
const RequestQueueUrl = "https://sqs.us-east-2.amazonaws.com/248117129417/nodeshop.fifo";   // SQS request queue to read message from

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const ResponseQueueUrl = "https://sqs.us-east-2.amazonaws.com/248117129417/ResponseQueue.fifo";  // SQS response queue to send response to


// Creating a response body to be send to response queue
// This should be modified based on the kind of response you expect back on a sqs response queue
function sendRespQueue(message) {
    var sqsMessage = JSON.parse(message.Body);
    
    let orderData = {
        'userEmail': sqsMessage.userEmail,
        'itemName': sqsMessage.itemName,
        'itemPrice': sqsMessage.itemPrice,
        'itemsQuantity': sqsMessage.itemsQuantity
    }

    let sqsOrderData = {
        MessageAttributes: {
          "userEmail": {
            DataType: "String",
            StringValue: orderData.userEmail
          },
          "itemName": {
            DataType: "String",
            StringValue: orderData.itemName
          },
          "itemPrice": {
            DataType: "Number",
            StringValue: orderData.itemPrice
          },
          "itemsQuantity": {
            DataType: "Number",
            StringValue: orderData.itemsQuantity
          }
        },
        MessageBody: JSON.stringify(orderData),
        MessageDeduplicationId: orderData.userEmail,
        MessageGroupId: "UserOrders",
        QueueUrl: ResponseQueueUrl
    };

    // send the response to the SQS queue
    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();
    
    sendSqsMessage.then((data) => {
        console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);
    }).catch((err) => {
        console.log(`OrdersSvc | ERROR: ${err}`);       
    });    
}

// Create our consumer to read message from request queue
const app = Consumer.create({
    queueUrl: RequestQueueUrl,
    handleMessage: async (message) => {
        sendRespQueue(message);
    },
    sqs: new AWS.SQS(),
    batchSize: 10
});

app.on('error', (err) => {
    console.error(err.message);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

console.log(`MQ read and write running`);
app.start();