const { minify } = require('html-minifier'),
  config = require('./config'),
  fs = require('fs'),
  { actionsLog } = require('./logs');

module.exports = async (filesList, directory) => {
  const options = config.htmlMinifierOptions;
  let path = '';
  const { omht, omcs, omjs } = config.params;
  for (const [key, value] of Object.entries(filesList)) {
    path = key;
    const filePath = `${directory}/${key}`;
    if ((value.Extension === 'html' && omht) || (value.Extension === 'css' && omcs) || (value.Extension === 'js' && omjs)) {
      const data = fs.readFileSync(filePath).toString();
      const result = minify(data, options);
      fs.writeFileSync(filePath, JSON.stringify(result));
      await actionsLog('minify', key, 'OK', 'File minified', directory);
    } else {
      await actionsLog('minify', path, 'OK', `No minification required for ${value.Extension} files`, directory);
    }
  }
  return 'Minifying/optimizing Process is Completed';
};