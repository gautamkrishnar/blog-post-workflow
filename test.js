const assert = require('assert');
const process = require('process');
const path = require('path');
const fs = require('fs');
const {exec} = require('./utils');

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
  INPUT_TITLE_MAX_LENGTH: '',
  INPUT_DESCRIPTION_MAX_LENGTH: '',
  INPUT_ITEM_EXEC: '',
  INPUT_OUTPUT_ONLY: 'false',
  INPUT_ENABLE_KEEPALIVE: 'true',
  INPUT_TAG_POST_PRE_NEWLINE:'false',
  INPUT_RETRY_COUNT:'0',
  INPUT_RETRY_WAIT_TIME: '1',
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

const runAndCompareSnap = async (README_FILE, envObj) => {
  await exec('node', [TEST_FILE],{env: envObj});
  const snapshot = fs.readFileSync(path.join(__dirname, 'test' , README_FILE + '.snap'), 'utf-8');
  const newReadme = fs.readFileSync(path.join(__dirname, 'test' , README_FILE), 'utf-8');
  assert.equal(snapshot, newReadme);
};

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
    await runAndCompareSnap(README_FILE, envObj);
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
    await runAndCompareSnap(README_FILE, envObj);
  });

  it('Custom template readme generated should match the snapshot',async function () {
    const README_FILE = 'Readme.custom.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_TEMPLATE: '$newline[$title]($url): $date $description $newline'
    };
    await runAndCompareSnap(README_FILE, envObj);
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
    await runAndCompareSnap(README_FILE, envObj);
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
    await runAndCompareSnap(README_FILE, envObj);
  });

  it('Generated readme with $emojiKey template should match the snapshot',async function () {
    const README_FILE = 'Readme.emojiKey.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_TEMPLATE: '- $emojiKey(💯,🔥)'
    };
    await runAndCompareSnap(README_FILE, envObj);
  });

  it('Generated readme with $randomEmoji template should match the snapshot',async function () {
    const README_FILE = 'Readme.randomEmoji.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_TEMPLATE: '- $randomEmoji(💯,🔥,💫,🚀,🌮)'
    };
    await runAndCompareSnap(README_FILE, envObj);
  });

  it('Generated readme with truncated title should match the snapshot',async function () {
    const README_FILE = 'Readme.truncate.title.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_TITLE_MAX_LENGTH: '10'
    };
    await runAndCompareSnap(README_FILE, envObj);
  });

  it('Generated readme with truncated description should match the snapshot',async function () {
    const README_FILE = 'Readme.truncate.description.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_DESCRIPTION_MAX_LENGTH: '10',
      INPUT_TEMPLATE: '$description $newline'
    };
    await runAndCompareSnap(README_FILE, envObj);
  });

  it('Generated readme with advanced manipulation via JS should match the snapshot',async function () {
    const README_FILE = 'Readme.exec.md';
    fs.writeFileSync(path.join(__dirname, 'test', README_FILE), TEMPLATE);
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: path.join(__dirname, 'test', README_FILE),
      INPUT_ITEM_EXEC: 'post.title=post.title.replace("Gautam",""); post.title=post.title.replace("browser","");'
    };
    await runAndCompareSnap(README_FILE, envObj);
  });
});
