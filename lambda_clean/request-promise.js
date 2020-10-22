const https = require('https');

module.exports = url => {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res.on('data', d => {
        console.log('RESPONSE:', d);
        resolve(d);
      });
    }).on('error', (e) => {
      console.error('Error: ', e);
      reject(e);
    });
  });
};