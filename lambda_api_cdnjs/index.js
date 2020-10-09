'use strict';
const https = require('https');

exports.handler = async event => {
  console.log("EVENT: ", JSON.stringify((event)));
  await request();
  return {
    statusCode: 200,
    body: 'OK'
  }
};

const request = () => {
  return new Promise((resolve, reject) => {
    https.get('https://api.cdnjs.com/libraries/jquery?fields=latest,version,sri', res => {
      res.on('data', d => {
        console.log('RESPONSE:', JSON.parse(d.toString()));
        resolve(resolve);
      });
    }).on('error', (e) => {
      console.error('Error: ', e);
      reject(e);
    });
  })
}