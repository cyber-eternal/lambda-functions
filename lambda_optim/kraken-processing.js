const Kraken = require('kraken'),
  { actionsLog } = require('./logs'),
  config = require('./config'),
  fs = require('fs'),
  requestPromise = require('./request-promise');

const kraken = new Kraken({
  api_key: config.kraken.key,
  api_secret: config.kraken.secret
});

const krakenOptimizing = file => {
  return new Promise((resolve, reject) => {
    try {
      const opts = {
        file: fs.createReadStream(file),
        wait: true,
        lossy: true
      };
      kraken.upload(opts, (err, data) => {
        if (err) throw new Error(err.message);
        resolve(data);
      });
    } catch (_e) {
      console.log('Error in krakenOptimizing', _e);
      reject(_e);
    }
  });
};

const optimizeImages = async (filesList, directory) => {
  let path = '';
  const { oijp, oipn, oigi } = config.params;
  for (const [key, value] of Object.entries(filesList)) {
    const filePath = `${directory}/${key}`;
    path = key;
    if ((value.Extension === 'jpg' && oijp) || (value.Extension === 'png' && oipn) || (value.Extension === 'gif' && oigi)) {
      const optimizedFile = await krakenOptimizing(filePath);
      if (optimizedFile.success) {
        if (optimizedFile.saved_bytes > 0) {
          await actionsLog('images', path, 'OK', `File optimized – ${optimizedFile.saved_bytes} saved bytes`, directory);
          const image = await requestPromise(optimizedFile.kraked_url);
          fs.writeFileSync(filePath, image);
        } else if (optimizedFile.saved_bytes === 0) {
          await actionsLog('images', path, 'OK', 'File already optimized', directory);
        } else {
          await actionsLog('images', path, 'ERR', 'Problem optimizing the image', directory);
        }
      }
    } else {
      await actionsLog('file', path, 'OK', `No optimization required for ${value.Extension} files`, directory);
    }
  }
  return 'Images Optimizing Process is Completed';
};

module.exports = optimizeImages;