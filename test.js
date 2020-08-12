const assert = require('assert');
const process = require('process');
const path = require('path');
const fs = require('fs');
const exec = require('./exec');

// language=markdown
const TEMPLATE = `# Readme test
Post list example:
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

# Other contents
Test content
`;
const TEST_FILE = process.env.DIST ? './dist/blog-post-workflow' :'./blog-post-workflow';
console.log('Testing: ', TEST_FILE);

// Test block
describe('Blog post workflow tests', function () {
  it('Default template readme generated should match the snapshot',async function () {
    const README_FILE = 'Readme.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      INPUT_MAX_POST_COUNT: "10",
      INPUT_FEED_LIST: "http://localhost:8080",
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_DISABLE_SORT: "false",
      INPUT_TEMPLATE: "default",
      INPUT_FILTER_COMMENTS: "stackoverflow,medium",
      INPUT_USER_AGENT: "rss-parser",
      INPUT_ACCEPT_HEADER: "application/rss+xml",
      INPUT_GH_TOKEN: "secret-test",
      TEST_MODE: "true"
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE  + '.snap'), "utf-8");
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), "utf-8");
    assert.equal(snapshot, newReadme);
  });

  it('Sorting disabled readme should be equal to the saved snapshot',async function () {
    const README_FILE = 'Readme.sort.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      INPUT_MAX_POST_COUNT: "10",
      INPUT_FEED_LIST: "http://localhost:8080",
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_DISABLE_SORT: "true",
      INPUT_TEMPLATE: "default",
      INPUT_FILTER_COMMENTS: "stackoverflow,medium",
      INPUT_USER_AGENT: "rss-parser",
      INPUT_ACCEPT_HEADER: "application/rss+xml",
      INPUT_GH_TOKEN: "secret-test",
      TEST_MODE: "true"
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE  + '.snap'), "utf-8");
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), "utf-8");
    assert.equal(snapshot, newReadme);
  });

  it('Custom template readme generated should match the snapshot',async function () {
    const README_FILE = 'Readme.custom.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      INPUT_MAX_POST_COUNT: "10",
      INPUT_FEED_LIST: "http://localhost:8080",
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_DISABLE_SORT: "false",
      INPUT_TEMPLATE: "$newline[$title]($url) $newline",
      INPUT_USER_AGENT: "rss-parser",
      INPUT_ACCEPT_HEADER: "application/rss+xml",
      INPUT_FILTER_COMMENTS: "medium,stackoverflow/Comment by $author/",
      INPUT_GH_TOKEN: "secret-test",
      TEST_MODE: "true",
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE + '.snap'), "utf-8");
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), "utf-8");
    assert.equal(snapshot, newReadme);
  });
  it('Generated readme without filters should match the snapshot',async function () {
    const README_FILE = 'Readme.comments.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      INPUT_MAX_POST_COUNT: "10",
      INPUT_FEED_LIST: "http://localhost:8080",
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_DISABLE_SORT: "false",
      INPUT_TEMPLATE: "$newline[$title]($url) $newline",
      INPUT_USER_AGENT: "rss-parser",
      INPUT_ACCEPT_HEADER: "application/rss+xml",
      INPUT_GH_TOKEN: "secret-test",
      TEST_MODE: "true",
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE + '.snap'), "utf-8");
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), "utf-8");
    assert.equal(snapshot, newReadme);
  });
});
