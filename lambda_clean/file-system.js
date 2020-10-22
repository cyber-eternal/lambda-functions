const s3 = require('./s3-lib'),
  fs = require('fs'),
  { spawn } = require('child_process'),
  archiver = require('archiver'),
  unzipper = require('unzipper'),
  path = require('path'),
  config = require('./config'),
  { getFileSizeInBytes, hashing, actionsLog } = require('./helpers'),
  FileType = require('file-type');

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
        throw new Error('Empty ZIP, or error reading it. Please check');
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

const cleanTmpDirectory = dir => {
  return new Promise((resolve) => {
    const remove = spawn('rm', ['-rf', `${dir}`]);
    remove.on('close', () => {
      const removeZip = spawn('rm', ['-rf', `${dir}.zip`]);
      removeZip.on('close', () => {
        resolve(true);
      });
    });
  });
};

const getAllFiles = async (dirPath, _path = '', filesList = {}) => {
  const files = fs.readdirSync(dirPath);
  for (const item of files) {
    const fileDir = path.join(dirPath, item);
    if (item !== '__MACOSX') {
      if (fs.statSync(fileDir).isDirectory()) {
        filesList = await getAllFiles(fileDir, path.join(_path, item), filesList);
      } else {
        const extname = path.extname(item);
        filesList[path.join(_path, item)] = {
          Filename: item.split('.')[0],
          Extension: extname ? extname.split('.')[1] : false,
          Sha: hashing(fileDir),
          FileSize: getFileSizeInBytes(fileDir),
          FileType: await FileType.fromFile(fileDir),
          Used: false,
          Updated: false,
          Tree: {}
        };
      }
    }
  }
  return filesList;
};

const getFilesByExtensionAndClean = (list, dir) => {
  const codeFilesList = {};
  const imageFilesList = {};
  const otherFilesList = {};
  for (const i in list) {
    if (config.codeFileExtensions.includes(list[i].Extension)) codeFilesList[i] = list[i];
    else if (config.imageFileExtensions.includes(list[i].Extension)) imageFilesList[i] = list[i];
    else (otherFilesList[i] = list[i]) && fs.unlinkSync(`${dir}/${i}`) && actionsLog('files', i, 'WARN', 'Potentially harmful file deleted', dir);
  }
  return { codeFilesList, imageFilesList };
};

module.exports = {
  downloadFile,
  unzip,
  archive,
  cleanTmpDirectory,
  getAllFiles,
  getFilesByExtensionAndClean
};