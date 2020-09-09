"use strict";
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let responseBody = "";
  let statusCode = 0;

  const { id, productname } = JSON.parse(event.body);

  const messageParams = {
    Message: productname,
    TopicArn: "arn:aws:sns:us-east-2:719537100027:demo-product-cms-put-product",
  };
  AWS.config.update({ region: "us-east-2" });

  const params = {
    TableName: "Products",
    Item: {
      id: id,
      productname: productname,
    },
  };

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(messageParams)
    .promise();

  try {
    const data = await documentClient.put(params).promise();
    responseBody = JSON.stringify(data);
    statusCode = 201;

    publishTextPromise
      .then(function (data) {
        console.log(
          `Message ${messageParams.Message} send sent to the topic ${messageParams.TopicArn}`
        );
        console.log("MessageID is " + data.MessageId);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  } catch (err) {
    responseBody = `Unable to put product: ${err}`;
    statusCode = 403;
  }

  const response = {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: responseBody,
  };

  return response;
};
