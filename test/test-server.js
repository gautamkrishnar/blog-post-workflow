const http = require('http');
const fs = require('fs');
const path = require('path');
const xmlData = fs.readFileSync(path.join(__dirname, 'sample.xml'), 'utf-8');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(xmlData);
    res.end();
}).listen(8080);
