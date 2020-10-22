module.exports = {
  region: 'us-east-1',
  s3: {
    bucketName: 'BUCKET_NAME'
  },
  tmpFilesDirectory: '/tmp',
  config: {
    prohibext: ['exe', 'ini', 'bat', 'apk', 'dll', 'zip', 'dmg']
  },
  params: {
    omht: true,
    omcs: true,
    omjs: true,
    oijp: true,
    oipn: true,
    oigi: true
  },
  codeFileExtensions: ['html', 'css', 'js'],
  imageFileExtensions: ['jpg', 'gif', 'png'],
  kraken: {
    key: '488c7795ede96835a7f75fd689418899',
    secret: '8ed0f9d1e72739cf0a978e33fc5aba0646d41837'
  },
  htmlMinifierOptions: {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    removeComments: true,
    removeTagWhitespace: true,
    removeEmptyAttributes: true,
    minifyCss: true,
    minifyJs: true,
    minifyURLs: true,
    processConditionalComments: true,
    html5: true
  },
};