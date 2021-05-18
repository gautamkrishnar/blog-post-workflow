const http = require('http');
const fs = require('fs');
const path = require('path');
let failCounter = 0;
const MAX_FAIL_COUNT = 5;

const sendResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, {'Content-Type': 'text/plain'});
  res.write(data);
  res.end();
};

const xmlData = fs.readFileSync(path.join(__dirname, 'sample.xml'), 'utf-8');

http.createServer(function (req, res) {
  if (req.url === '/failtest') {
    const showError = failCounter !== MAX_FAIL_COUNT;
    sendResponse(res, showError ? 500 : 200, showError ? 'error!' : xmlData);
    failCounter = failCounter + 1;
  } else {
    sendResponse(res, 200, xmlData);
  }
}).listen(8080);
