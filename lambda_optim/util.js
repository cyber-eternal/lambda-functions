const file_system = require('./file-system'),
  { actionsLog } = require('./logs'),
  { tmpFilesDirectory } = require('./config'),
  path = require('path');

const getPath = file => file.substring(0, file.lastIndexOf('/'));

const zipValidateAndUnzip = async s3Data => {
  try {
    if (s3Data.object.key.split('.')[s3Data.object.key.split('.').length - 1] !== 'zip') throw new Error('Not a ZIP file. Please check');
    if (s3Data.object.size > 10 * 1024 * 1024) throw new Error('Please limit ZIP file to 10Mb');
    await file_system.downloadFile({ Bucket: s3Data.bucket.name, Key: s3Data.object.key });
    await file_system.unzip({ path: tmpFilesDirectory, key: s3Data.object.key });
    return 'Zip file validated and unziped';
  } catch (error) {
    console.log('Error in zipValidator: ', error);
    await actionsLog('init', path.join(tmpFilesDirectory, s3Data.object.key.split('.')[0]), 'ERR', error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  getPath,
  zipValidateAndUnzip
};