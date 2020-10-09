const s3 = require('./s3-lib');
const fs = require('fs');
const archiver = require('archiver');
const unzipper = require('unzipper');
const config = require('./config');

const downloadFile = async params => {
  const data = await s3.getObject(params);
  fs.writeFileSync(`${config.tmpFilesDirectory}/${params.Key}`, data.Body);
  return;
};

const unzip = ({ path, key }) => {
  return new Promise((resolve, reject) => {
    console.log('Starting unzip process', path, key);
    fs.createReadStream(`${path}/${key}`).pipe(unzipper.Extract({ path: `${path}/${key.split('.')[0]}` })).on('close', _e => {
      if (_e) {
        console.log('ERROR: Read Stream', _e);
        return reject(_e);
      }
      resolve(true);
    });
  });
};

const archive = (name, dir) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${name}.zip`);
    const archive = archiver('zip');
    archive.on('error', err => {
      reject(err);
    });
    archive.pipe(output);
    archive.directory(dir, false);
    archive.finalize();
    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      resolve(true);
    });
  });
};

module.exports = {
  downloadFile,
  unzip,
  archive
};