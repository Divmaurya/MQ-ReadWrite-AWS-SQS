const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = process.argv.slice(2)[0];

// import the AWS SDK
const AWS = require('aws-sdk');

//Configure the region
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const queueUrl = "SQS_QUEUE_URL";
//const queueUrl = "https://sqs.us-east-2.amazonaws.com/248117129417/nodeshop.fifo";

app.get('/', (req, res) => {
    res.send("Get response")
})

// the new endpoint
app.post('/order', (req, res) => {

    let orderData = {
        'userEmail': req.body['userEmail'],
        'itemName': req.body['itemName'],
        'itemPrice': req.body['itemPrice'],
        'itemsQuantity': req.body['itemsQuantity']
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
        MessageDeduplicationId: req.body['userEmail'],
        MessageGroupId: 'UserOrders',
        QueueUrl: queueUrl
    };

    // Sent the order data to the SQS queue
    let sendSqsMessage = sqs.sendMessage(sqsOrderData).promise();

    sendSqsMessage.then((data) => {
        console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);
        res.send("Thank you for your order. Check your inbox for the confirmation email.");
    }).catch((err) => {
        console.log(`OrdersSvc | ERROR: ${err}`);

        // Send email to emails API
        res.send("We ran into an error. Please try again.");
    });
});

console.log(`Application is running at port: ${port}`);
app.listen(port);
