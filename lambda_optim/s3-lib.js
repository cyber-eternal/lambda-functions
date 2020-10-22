const AWS = require('aws-sdk');
const config = require('./config');

const getS3 = () => {
  AWS.config.update({
    region: config.region,
  });

  return new AWS.S3({
    apiVersion: '2017-12-31',
    region: config.region
  });
};

const addFile = ({ name, data }) => {
  return new Promise((resolve, reject) => {
    try {
      const s3 = getS3();
      s3.upload({
        Bucket: config.s3.bucketName,
        Key: name,
        Body: data
      }, (err, data) => {
        if (err) throw new Error(err.message);
        console.log('Successfully uploaded file');
        resolve(data.Location);
      });
    } catch (error) {
      console.log('Error in add file', error);
      reject(error);
    }
  });
};

const upload = ({
  data, name, extension = 'zip'
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = `${name}.${extension}`;
      const location = await addFile({ name: fileName, data });
      resolve(location);
    } catch (error) {
      console.log('Error in upload', error);
      reject(error);
    }
  });
};

const getObject = params => {
  return new Promise(async (resolve, reject) => {
    try {
      const s3 = getS3();
      s3.getObject(params, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    } catch (error) {
      console.log('Error in upload', error);
      reject(error);
    }
  });
};

module.exports = { upload, getObject };