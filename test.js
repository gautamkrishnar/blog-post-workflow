const assert = require('assert');
const process = require('process');
const path = require('path');
const fs = require('fs');
const exec = require('./exec');

const DEFAULT_TEST_ENV = {
  INPUT_MAX_POST_COUNT: '10',
  INPUT_FEED_LIST: 'http://localhost:8080',
  INPUT_DISABLE_SORT: 'false',
  INPUT_TEMPLATE: 'default',
  INPUT_FILTER_COMMENTS: 'medium,stackoverflow/Comment by $author/,stackexchange/Comment by $author/',
  INPUT_USER_AGENT: 'rss-parser',
  INPUT_ACCEPT_HEADER: 'application/rss+xml',
  INPUT_GH_TOKEN: 'secret-test',
  INPUT_DATE_FORMAT: 'UTC:ddd mmm dd yyyy h:MM TT',
  INPUT_CUSTOM_TAGS: '',
  TEST_MODE: 'true'
};

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
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE)
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE  + '.snap'), 'utf-8');
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), 'utf-8');
    assert.equal(snapshot, newReadme);
  });

  it('Sorting disabled readme should be equal to the saved snapshot',async function () {
    const README_FILE = 'Readme.sort.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_DISABLE_SORT: 'true'
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE  + '.snap'), 'utf-8');
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), 'utf-8');
    assert.equal(snapshot, newReadme);
  });

  it('Custom template readme generated should match the snapshot',async function () {
    const README_FILE = 'Readme.custom.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_TEMPLATE: '$newline[$title]($url): $date $newline'
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE + '.snap'), 'utf-8');
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), 'utf-8');
    assert.equal(snapshot, newReadme);
  });
  it('Generated readme without filters should match the snapshot',async function () {
    const README_FILE = 'Readme.comments.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_FILTER_COMMENTS: ''
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE + '.snap'), 'utf-8');
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), 'utf-8');
    assert.equal(snapshot, newReadme);
  });
  it('Generated readme without custom elements should match the snapshot',async function () {
    const README_FILE = 'Readme.custom-tags.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_CUSTOM_TAGS: 'testingTag/testingTag/,testingTag2/testingTag2/',
      INPUT_TEMPLATE: '$title $url $testingTag $testingTag2 $newline'
    };
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE + '.snap'), 'utf-8');
    const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), 'utf-8');
    assert.equal(snapshot, newReadme);
  });
});
