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
const duplicateXmlData = fs.readFileSync(path.join(__dirname, 'sample.duplicate.xml'), 'utf-8');


http.createServer(function (req, res) {
  if (req.url === '/failtest') {
    const showError = failCounter !== MAX_FAIL_COUNT;
    sendResponse(res, showError ? 500 : 200, showError ? 'error!' : xmlData);
    failCounter = failCounter + 1;
  } else if (req.url === '/empty-tags') {
    const emptyTagResponse = `
    <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
      <channel>
          <title>Gautam krishna.R</title>
          <author>Gautam krishna.R</author>
          <description>test</description>
          <link></link>
          <language></language>
          <item>
          <title></title>
          <author></author>
          <pubDate></pubDate>
          <link></link>
          <guid>https://dev.to/gautamkrishnar/hi-im-gautam-krishnar</guid>
          <description></description>
            <testingTag>hello</testingTag>
            <testingTag2>apple</testingTag2>
          <category>introductions</category>
        </item>
      </channel>
    </rss>
    `;
    sendResponse(res, 200, emptyTagResponse);
  } else if (req.url === '/duplicates') {
    sendResponse(res, 200, duplicateXmlData);
  }
  else {
    sendResponse(res, 200, xmlData);
  }
}).listen(8080);
