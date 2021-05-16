const http = require('http');
const fs = require('fs');
const path = require('path');
let failCounter = 0;
const MAX_FAIL_COUNT = 5;

const xmlData = fs.readFileSync(path.join(__dirname, 'sample.xml'), 'utf-8');
http.createServer(function (req, res) {
  if (req.url === '/failtest' && failCounter < MAX_FAIL_COUNT) {
    failCounter = failCounter + 1;
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.write('error!');
    res.end();
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(xmlData);
    res.end();
  }
}).listen(8080);
