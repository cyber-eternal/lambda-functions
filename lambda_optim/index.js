const path = require('path'),
  fs = require('fs'),
  file_system = require('./file-system'),
  config = require('./config'),
  optimizeImages = require('./kraken-processing'),
  minifyFiles = require('./minify'),
  { zipValidateAndUnzip } = require('./util'),
  s3 = require('./s3-lib');

const { tmpFilesDirectory } = config;

exports.handler = async event => {
  let unzipedFolder;
  try {
    console.log('REQUEST DATA: ', JSON.stringify(event));
    const s3Data = event.Records[0].s3;
    await zipValidateAndUnzip(s3Data);
    if (s3Data.object.key.includes('_updated')) throw new Error('Already updated');
    unzipedFolder = path.join(tmpFilesDirectory, s3Data.object.key.split('.')[0]);
    const filesList = file_system.getAllFiles(unzipedFolder);
    console.log('filesList: ', JSON.stringify(filesList));
    const { codeFilesList, imageFilesList } = await file_system.getFilesByExtensionAndClean(filesList, unzipedFolder);
    await minifyFiles(codeFilesList, unzipedFolder);
    await optimizeImages(imageFilesList, unzipedFolder);
    await file_system.archive(`${unzipedFolder}`, unzipedFolder);
    const updatedZip = fs.readFileSync(`${unzipedFolder}.zip`);
    await s3.upload({ data: updatedZip, name: `${s3Data.object.key.split('.')[0]}_updated` });
    await file_system.cleanTmpDirectory(unzipedFolder);
    return {
      statusCode: 200,
      body: 'Success',
    };
  } catch (_e) {
    console.log('Error in handler: ', _e);
    await file_system.cleanTmpDirectory(unzipedFolder);
    return {
      statusCode: 409,
      body: 'Failure',
    };
  }
};