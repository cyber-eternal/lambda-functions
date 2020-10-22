const file_system = require('./file-system'),
  fs = require('fs'),
  { actionsLog } = require('./helpers'),
  { tmpFilesDirectory } = require('./config'),
  path = require('path'),
  { sha512 } = require('js-sha512');

const hashing = filePath => {
  const file = fs.readFileSync(filePath);
  const hash = sha512(file);
  return hash;
}

const isClean = action => {
  if (action === 'C') return true;
  else if (action === 'A') return false;
  else throw new Error('Invalid action');
}

const getPath = file => file.substring(0, file.lastIndexOf('/'));

const getFileSizeInBytes = filename => fs.statSync(filename)['size'];

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

const getRootDir = async (path, rootDir = '/') => {
  try {
    const files = fs.readdirSync(`${path}${rootDir}`);
    const rootFilesList = ['index.html', 'index.htm', 'money.htm', 'money.htm'];
    let mainHtml = files.find(i => rootFilesList.includes(i));
    let result = { rootDir, mainHtml };
    if (mainHtml) return result;
    else {
      const htmlFiles = files.filter(i => i.includes('.html') || i.includes('.htm'));
      if (htmlFiles.length === 1) {
        [mainHtml] = htmlFiles;
        return { rootDir, mainHtml }
      };
      if (htmlFiles.length > 1) throw new Error('Multiple HTML files found, please define index.html');
      if (!htmlFiles.length) {
        const directories = files.filter(i => fs.lstatSync(`${path}${rootDir}/${i}`).isDirectory());
        if (!directories.length) throw new Error('Empty ZIP, or error reading it. Please check');
        if (directories.length > 1) throw new Error('Please add one webpage per ZIP file');
        if (directories.length === 1) {
          result = await getRootDir(path, `${rootDir}${directories[0]}/`)
        };
      }
      return result;
    }
  } catch (e) {
    console.log('Error in getRootDir: ', e);
    await actionsLog('init', '', 'ERR', e.message);
    return e;
  }
}

const actionsLog = (action, full_path, status, message, folderPath) => {
  return new Promise(resolve => {
    const log = `${new Date().toISOString()} | ${action} | ${full_path} | ${status} | ${message} \n`;
    fs.appendFileSync(`${folderPath}/actions_log.txt`, log);
    resolve('The file was saved!');
  })
}

module.exports = {
  hashing,
  isClean,
  getPath,
  zipValidateAndUnzip,
  getFileSizeInBytes,
  getRootDir,
  actionsLog
};