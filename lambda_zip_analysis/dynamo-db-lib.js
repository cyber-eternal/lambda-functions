const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update({ region: config.region });

const dynamoDbLib = (action, params) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
};

const updateInDB = (key, updatedUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        TableName: `${config.dynamoDB.tableName}`,
        Key: { LanderID: key },
        UpdateExpression: 'SET #updatedS3Url = :updatedS3Url',
        ExpressionAttributeValues: { ':updatedS3Url': updatedUrl },
        ExpressionAttributeNames: { '#updatedS3Url': 'updatedS3Url' },
      };
      console.log('params', params);
      await dynamoDbLib('update', params);
      resolve('success');
    } catch (error) {
      console.log('ERROR in updateInDB', error);
      reject(error);
    }
  });
};

module.exports = { updateInDB };
