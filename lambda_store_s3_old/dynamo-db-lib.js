const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update({ region: config.region });

const dynamoDbLib = (action, params) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
};

const writeDataIntoDB = (TableName, Item) => {
  return new Promise(async (resolve, reject) => {
    try {
      let params = {
        TableName: `${TableName}`,
        Item
      };
      console.log('params', params);
      await dynamoDbLib('put', params);
      resolve('success');
    } catch (error) {
      console.log(`error in write data into ${TableName}`, error);
      reject(error);
    }
  });
};

module.exports = { writeDataIntoDB };
