const { v4: uuid } = require('uuid');
const dynamoDb = require('./dynamo-db-lib');
const FileType = require('file-type');
const s3 = require('./s3-lib');
const response = require('./response-lib');
const config = require('./config');

exports.handler = async event => {
  try {
    const body = event.body;
    const buffer = await dataValidation(body);
    const LanderID = uuid();
    const fileLocation = await s3.upload({ data: buffer, name: LanderID });
    await dynamoDb.writeDataIntoDB(config.dynamoDB.tableName, { UserID: uuid(), LanderID, Action: 'C', Status: 'P', s3Url: fileLocation });
    return response.success({ "ok": LanderID });
  } catch (_e) {
    console.log('Error in handler: ', _e);
    return response.failure({ err: _e.message });
  }
};

const dataValidation = async data => {
  if (!data) throw new Error('notzip');
  const fileBuffer = returnBuffer(data);
  const fileType = await FileType.fromBuffer(fileBuffer);
  console.log('fileType', fileType);
  if (fileType && fileType.ext !== 'zip') throw new Error('notzip');
  return fileBuffer;
};

const returnBuffer = base64 => Buffer.from(base64, 'base64');
