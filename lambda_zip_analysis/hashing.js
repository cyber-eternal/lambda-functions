const sha512 = require('js-sha512').sha512;
const fs = require('fs');

const hashing = filePath => {
  const file = fs.readFileSync(filePath);
  const hash = sha512(file);
  return hash;
}

module.exports = hashing;