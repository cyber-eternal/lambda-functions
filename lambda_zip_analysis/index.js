const css = require('css');
const espree = require("espree");
const htmlparser = require("htmlparser2");
const path = require('path');
const fs = require('fs');
const file_system = require('./file-system');
const hashing = require('./hashing');
const config = require('./config');
const s3 = require('./s3-lib');
const dynamoDb = require('./dynamo-db-lib');
const { spawn } = require('child_process');

exports.handler = async event => {
  try {
    console.log('REQUEST DATA: ', JSON.stringify(event));
    const { tmpFilesDirectory } = config;
    const s3Data = event.Records[0].s3;
    if (s3Data.object.key.split('.')[s3Data.object.key.split('.').length - 1] !== 'zip') throw new Error('Not Zip');
    if (s3Data.object.key.includes('_updated')) throw new Error('Already updated');
    await file_system.downloadFile({ Bucket: s3Data.bucket.name, Key: s3Data.object.key });
    await file_system.unzip({ path: tmpFilesDirectory, key: s3Data.object.key });
    const unzipedFolder = path.join(tmpFilesDirectory, s3Data.object.key.split('.')[0]);
    const hashJson = getAllFiles(unzipedFolder);
    fs.writeFileSync(`${unzipedFolder}/zip_description.json`, JSON.stringify(hashJson));
    await file_system.archive(`${unzipedFolder}_updated`, unzipedFolder);
    const updatedZip = fs.readFileSync(`${unzipedFolder}_updated.zip`);
    const fileLocation = await s3.upload({ data: updatedZip, name: `${s3Data.object.key.split('.')[0]}_updated` });
    console.log('fileLocation: ', fileLocation);
    await dynamoDb.updateInDB(s3Data.object.key.split('.')[0], fileLocation);
    await cleanTmpDirectory();
    return {
      statusCode: 200,
      body: 'Success',
    };
  } catch (_e) {
    console.log('Error in handler: ', _e);
    await cleanTmpDirectory();
    return {
      statusCode: 409,
      body: 'Failure',
    };
  }
};

const getAllFiles = (dirPath, _path = '', shaJson = {}) => {
  const files = fs.readdirSync(dirPath);
  files.forEach(item => {
    const fileDir = path.join(dirPath, item);
    if (fs.statSync(fileDir).isDirectory()) {
      shaJson = getAllFiles(fileDir, path.join(_path, item), shaJson);
    } else {
      const extname = path.extname(item);
      if (extname === '.html') {
        htmlParsing(fileDir);
      } else if (extname === '.css') {
        cssParsing(fileDir);
      } else if (extname === '.js') {
        jsParsing(fileDir);
      }
      shaJson[path.join(_path, item)] = hashing(fileDir);
    }
  });
  return shaJson;
};

const htmlParsing = filePath => {
  const file = fs.readFileSync(filePath);
  const parsedHtml = {};
  var parser = new htmlparser.Parser({
    // ! HTML parser function here
  }, { decodeEntities: true });
  parser.write(file);
  parser.end();
  fs.writeFileSync(`${filePath}.json`, JSON.stringify(parsedHtml));
  console.log('File created', `${filePath}.json`);
  return;
};

const cssParsing = filePath => {
  const file = fs.readFileSync(filePath);
  const obj = css.parse(file.toString(), { source: 'source.css' });
  fs.writeFileSync(`${filePath}.json`, JSON.stringify(obj));
  console.log('File created', `${filePath}.json`);
  return;
};

const jsParsing = filePath => {
  const file = fs.readFileSync(filePath);
  const ast = espree.parse(file, { ecmaVersion: 6 });
  fs.writeFileSync(`${filePath}.json`, JSON.stringify(ast));
  console.log('File created', `${filePath}.json`);
  return;
};

const cleanTmpDirectory = () => {
  return new Promise((resolve) => {
    const remove = spawn('rm', ['-rf', '/tmp']);
    remove.on('close', () => {
      const create = spawn('mkdir', ['/tmp']);
      create.on('close', () => {
        resolve(true);
      });
    });
  })
}
