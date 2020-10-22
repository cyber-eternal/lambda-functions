const { fetchUrl } = require('fetch');

module.exports = url => {
  return new Promise((resolve, reject) => {
    fetchUrl(url, (error, meta, body) => {
      if (error) {
        console.log('ERROR in requestPromise', error);
        return reject(error);
      }
      resolve(body);
    });
  });
};