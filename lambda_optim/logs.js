const fs = require('fs');

const actionsLog = (action, full_path, status, message, folderPath) => {
  return new Promise(resolve => {
    const log = `${new Date().toISOString()} | ${action} | ${full_path} | ${status} | ${message} \n`;
    fs.appendFileSync(`${folderPath}/actions_log.txt`, log);
    resolve('The file was saved!');
  })
}

module.exports = { actionsLog }