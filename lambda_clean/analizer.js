const { Parser } = require("htmlparser2");
const { DomHandler } = require("domhandler");
const rawHtml = fs.readFileSync(filePath);
const domHandler = new DomHandler((error, dom) => {
  if (error) {
    console.log('Error in domHandler: ', error);
  } else {
    console.log('dom', dom);
  }
});
const parser = new Parser(domHandler);
parser.write(rawHtml);
parser.end();

// const htmlParsing = filePath => {
//   const file = fs.readFileSync(filePath);
//   const parsedHtml = {};
//   var parser = new htmlparser.Parser({
//     // ! HTML parser function here
//   }, { decodeEntities: true });
//   parser.write(file);
//   parser.end();
//   fs.writeFileSync(`${filePath}.json`, JSON.stringify(parsedHtml));
//   console.log('File created', `${filePath}.json`);
//   return;
// };