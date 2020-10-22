const { Parser } = require("htmlparser2");
const { DomHandler } = require("domhandler");
const rawHtml =
  "<p color='red'>Hello world <span>SPAN</span></p> <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
const handler = new DomHandler(function (error, dom) {
  if (error) {
    // Handle error
  } else {
    // Parsing completed, do something
    console.log('arr', dom[0]);
    
  }
});
const parser = new Parser(handler);
parser.write(rawHtml);
parser.end();