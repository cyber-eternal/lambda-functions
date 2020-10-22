const Kraken = require('kraken'),
  fs = require('fs'),
  path = require('path'),
  minify = require('html-minifier').minify,
  config = require('./config'),
  sharp = require('sharp');
// const https = require('https');


// const kraken = new Kraken({
//   api_key: config.kraken.key,
//   api_secret: config.kraken.secret
// });

const krakenOptimizing = file => {
  return new Promise((resolve, reject) => {
    try {
      const kraken = new Kraken({
        api_key: config.kraken.key,
        api_secret: config.kraken.secret
      });

      const opts = {
        file: fs.createReadStream(file),
        wait: true,
        lossy: true
      };

      kraken.upload(opts, function (err, data) {
        if (err) {
          console.log('Failed. Error message: %s', err);
          throw new Error(err.message)
        } else {
          console.log('Success. Optimized image URL: %s', data);
          resolve(data);
        }
      });
    } catch (_e) {
      console.log('Error in krakenOptimizing', _e);
      reject(_e);
    }
  })
}
// const request = url => {
//   return new Promise((resolve, reject) => {
//     https.get(url, res => {
//       res.on('data', d => {
//         console.log('RESPONSE:', d);
//         resolve(d);
//       });
//     }).on('error', (e) => {
//       console.error('Error: ', e);
//       reject(e);
//     });
//   })
// }

// const ActionsLog = (action, full_path, status, message, isFirstTime) => {
//   return new Promise((resolve, reject) => {
//     const log = ` ${isFirstTime ? 'DATE TIME | action | full_path | status | message \n ': ''} \n ${new Date().toISOString()} | ${action} | ${full_path} | ${status} | ${message}`;
//     fs.appendFileSync('./actions_log.txt', log);
//     resolve('The file was saved!');
//   })
// }

// ActionsLog('test', 'test', 'test', 'test').then(a => console.log('a:', a));
// console.time('test');
// krakenOptimizing('./file.png').then(d => {
//   console.log('d: ', d);
//   krakenOptimizing('./file1.png').then(d => {
//     console.log('d: ', d);
//     krakenOptimizing('./file2.png').then(d => {
//       console.log('d: ', d);
//       console.timeEnd('test');

//       // ActionsLog('test', 'test', 'test', 'test').then(a => console.log('a:', a));
//     });
//     // ActionsLog('test', 'test', 'test', 'test').then(a => console.log('a:', a));
//   });
//   // ActionsLog('test', 'test', 'test', 'test').then(a => console.log('a:', a));
// });
const https = require('https');
var fetchUrl = require("fetch").fetchUrl;

const requestPromise = url => {
  return new Promise((resolve, reject) => {
    fetchUrl(url, (error, meta, body) => {
      if (error) {
        console.log('ERROR in requestPromise', error);
        return reject(error);
      }
      console.log(body);
      resolve(body);
    });
  });
};
// requestPromise('https://dl.kraken.io/api/23/e6/16/806235a6c058972a2fa3aba692/94ab88db-fdce-4552-9481-1c6ce8b218c6.jpg').then(i => {
//   fs.writeFileSync('./review1_opt.jpg', i);
// })

console.time('test');
krakenOptimizing('./review1.jpg').then(d => {
  console.log('d: ', d);
  requestPromise(d.kraked_url).then(image => {
    fs.writeFileSync('./review1_opt.jpg', image);
  });
  console.timeEnd('test');
  // ActionsLog('test', 'test', 'test', 'test').then(a => console.log('a:', a));
});

// krakenOptimizing('./file2.png').then(d => {
//   console.log('d: ', d);
//   // ActionsLog('test', 'test', 'test', 'test').then(a => console.log('a:', a));
// });
// console.timeEnd('test');

// Promise.all([krakenOptimizing('./file.png'), krakenOptimizing('./file1.png')]).then((values) => {
//   console.log('values: ', values);
//   console.timeEnd('test');
// });

// request('https://dl.kraken.io/api/4f/85/70/2197bdc5e7a38f272a4890f3c7/f0f6961f-6692-4b3e-a6f2-b9b804f81518.png').then(d => fs.writeFileSync('test.png', d));


// const getAllFiles = (dirPath, _path = '', filesList = {}) => {
//   const files = fs.readdirSync(dirPath);
//   files.forEach(item => {
//     const fileDir = path.join(dirPath, item);
//     if (fs.statSync(fileDir).isDirectory()) {
//       filesList = getAllFiles(fileDir, path.join(_path, item), filesList);
//     } else {
//       const extname = path.extname(item);
//       // if (extname === '.html') {
//       //   htmlParsing(fileDir);
//       // } else if (extname === '.css') {
//       //   cssParsing(fileDir);
//       // } else if (extname === '.js') {
//       //   jsParsing(fileDir);
//       // }
//       filesList[path.join(_path, item)] = {
//         Filename: item.split('.')[0],
//         Extension: extname ? extname.split('.')[1] : false
//       }
//     }
//   });
//   return filesList;
// };


// console.log('result: ', result);


// const getFilesByExtension = list => {
//   const codeFilesList = {};
//   const imageFilesList = {};
//   const otherFilesList = {};
//   for (const i in list) {
//     if (['css', 'html', 'js'].includes(list[i].Extension)) codeFilesList[i] = list[i];
//     else if (['jpg', 'png', 'gif'].includes(list[i].Extension)) imageFilesList[i] = list[i];
//     else (otherFilesList[i] = list[i]) && fs.unlinkSync(`./test_1/${i}`);
//   }
//   return { codeFilesList, imageFilesList, otherFilesList }
// }

// const { codeFilesList, imageFilesList, otherFilesList } = getFilesByExtension(result);

// const removeFiles = path => fs.unlinkSync(`/tmp/test_1${path}`);

// console.log('codeFilesList: ', codeFilesList);
// console.log('imageFilesList: ', imageFilesList);
// console.log('otherFilesList: ', otherFilesList);


// const actionsLog = (action, full_path, status, message, folderPath) => {
//   return new Promise(resolve => {
//     const log = `\n ${new Date().toISOString()} | ${action} | ${full_path} | ${status} | ${message} \n`;
//     fs.appendFileSync(`${folderPath}/actions_log.txt`, log);
//     resolve('The file was saved!');
//   })
// }

// const result = getAllFiles('./test_1');

// console.log('result: ', result);

// const minifier = async (filesList, directory) => {
//   const options = config.htmlMinifierOptions;
//   let path = '';
//   const { omht, omcs, omjs } = config.params;
//   for (const [key, value] of Object.entries(filesList)) {
//     path = key;
//     const filePath = `${directory}/${key}`;
//     if ((value.Extension === 'html' && omht) || (value.Extension === 'css' && omcs) || (value.Extension === 'js' && omjs)) {
//       const data = fs.readFileSync(filePath).toString();
//       const result = minify(data, options);
//       fs.writeFileSync(filePath, JSON.stringify(result));
//       console.log('MINIFIED file: ', key);
//       await actionsLog('minify', key, 'OK', 'File minified', directory);
//     } else {
//       await actionsLog('file', path, 'OK', `No minification required for ${value.Extension} files`, directory);
//     }
//   }
//   return 'Minifying/optimizing Process is Completed';
// };

// minifier(result, './test_1')

// sharp('./te.gif')
//   // .png({
//   //   quality: 40,
//   //   nearLossless: true
//   // })
//   // .png({ compressionLevel: 9, adaptiveFiltering: true, force: true, quality: 40 })
//   // .jpeg({ compressionLevel: 9, adaptiveFiltering: true, force: true, quality: 40 })
//   .gif({ force: true })
//   // .withMetadata()
//   .toBuffer()
//   .then(outputBuffer => {
//     fs.writeFileSync('te_updated.gif', outputBuffer)
//     // outputBuffer contains upside down, 300px wide, alpha channel flattened
//     // onto orange background, composited with overlay.png with SE gravity,
//     // sharpened, with metadata, 90% quality WebP image data. Phew!
//   });