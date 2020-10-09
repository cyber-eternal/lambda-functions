'use strict';
const AWS = require('aws-sdk');
const config = require('./config');
const response = require('./response-lib');
const dynamoDb = require('./dynamo-db-lib');
const { v4: uuid } = require('uuid');

exports.handler = async event => {
  try {
    const LanderID = uuid();
    const key = `${LanderID}.zip`;
    const signedURL = await getSignedURL(key);
    const s3Url = `https://${config.s3.bucketName}.s3.amazonaws.com/${key}`;
    await dynamoDb.writeDataIntoDB(config.dynamoDB.tableName, { UserID: uuid(), LanderID, Action: 'C', Status: 'P', s3Url });
    return response.success({ ok: signedURL });
  } catch (_e) {
    console.log('Error in handler: ', _e);
    return response.failure({ err: _e.message });
  }
};

const getSignedURL = Key => {
  return new Promise((resolve, reject) => {
    const awsCredentials = config.aws;
    AWS.config.update(awsCredentials);
    const params = {
      Bucket: config.s3.bucketName,
      Key,
      Expires: 30 * 60, // 30 minutes
      ContentType: 'application/zip'
    };
    const options = {
      signatureVersion: 'v4',
      region: awsCredentials.region,
      endpoint: new AWS.Endpoint(`${params.Bucket}.s3-accelerate.amazonaws.com`), useAccelerateEndpoint: true,
    };
    const client = new AWS.S3(options);
    client.getSignedUrl('putObject', params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};