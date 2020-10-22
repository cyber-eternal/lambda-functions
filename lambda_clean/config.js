module.exports = {
  region: 'us-east-1',
  s3: {
    bucketName: 'my-zip-files'
  },
  tmpFilesDirectory: '/tmp',
  config: {
    prohibext: ['exe', 'ini', 'bat', 'apk', 'dll', 'zip', 'dmg'],
    adom: [],
    jsevents: ['onload', 'onerror', 'onclick']
  },
  params: {
    action: 'A', // ? C
    adom: [],
    cscd: true, // false
    cbht: true, // false
    cbcs: true, // false
    cbjs: true, // false
    cshd: true, // false
    csft: true, // false
  }
};