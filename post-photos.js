const uuidv4 = require("uuid/v4");
const S3 = require("aws-sdk/clients/s3");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const qs = require("querystring");
const s3 = new S3();
const docClient = new DynamoDB.DocumentClient();

module.exports.handler = async (event, context) => {
  const s3Key = Object.keys(qs.parse(event.Records[0].s3.object.key))[0];
  const getParams = {
    Bucket: process.env.LINE_BUCKET,
    Key: s3Key
  };

  const respGetObject = await s3.getObject(getParams).promise();

  const filename = `${uuidv4()}.png`;
  const putParams = {
    Body: respGetObject.Body,
    Bucket: process.env.APP_BUCKET,
    Key: filename
  };

  await s3.putObject(putParams).promise();

  const dynamoParams = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      filename,
      status: "standby",
      createdAt: Date.now()
    }
  };

  await docClient.put(dynamoParams).promise();

  return { statusCode: 200 };
};
