const _ = require("lodash");
const S3 = require("aws-sdk/clients/s3");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const s3 = new S3();
const docClient = new DynamoDB.DocumentClient();

module.exports.handler = async (event, context) => {
  const dynamoParams = {
    TableName: process.env.DYNAMODB_TABLE,
    IndexName: "statusIndex",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":status": "standby"
    }
  };

  const data = await docClient.query(dynamoParams).promise();
  const item = _.sample(data.Items);

  const params = {
    Bucket: process.env.APP_BUCKET,
    Key: item.filename
  };
  const url = s3.getSignedUrl("getObject", params);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      url
    })
  };
};
