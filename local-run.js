const process = require('process');
const path = require('path');
const fs = require('fs');
// language=markdown
const template = `# Readme test
Post list example:
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

# Other contents
Test content
`;
fs.writeFile(path.join(__dirname, 'test', 'Readme.md'), template, () => {
  console.log('Written test file....');
  process.env.INPUT_MAX_POST_COUNT = '5';
  process.env.INPUT_FEED_LIST = 'http://localhost:8080';
  process.env.INPUT_FILTER_COMMENTS = 'stackoverflow,medium';
  process.env.INPUT_README_PATH = path.join(__dirname, 'test', 'Readme.md');
  process.env.INPUT_DISABLE_SORT = 'false';
  process.env.INPUT_USER_AGENT = 'rss-parser';
  process.env.INPUT_ACCEPT_HEADER= 'application/rss+xml';
  process.env.INPUT_TEMPLATE = 'default';
  process.env.INPUT_DATE_FORMAT = 'UTC:ddd mmm dd yyyy h:MM TT';
  process.env.TEST_MODE = 'true';
  process.env.INPUT_CUSTOM_TAGS = '';
  process.env.INPUT_TITLE_MAX_LENGTH = '';
  process.env.INPUT_DESCRIPTION_MAX_LENGTH = '';
  process.env.INPUT_ITEM_EXEC = '';
  process.env.INPUT_OUTPUT_ONLY = 'false';
  process.env.INPUT_ENABLE_KEEPALIVE = 'true';
  process.env.INPUT_TAG_POST_PRE_NEWLINE = 'false';
  process.env.INPUT_RETRY_COUNT = '0';
  process.env.INPUT_RETRY_WAIT_TIME = '1';
  process.env.INPUT_DISABLE_ITEM_VALIDATION  = 'false';
  process.env.INPUT_FILTER_DATES = '';
  const testFile = process.env.DIST ? './dist/blog-post-workflow' :'./blog-post-workflow';
  console.log('Testing: ', testFile);
  require(testFile);
});
