const assert = require('assert');
const process = require('process');
const path = require('path');
const fs = require('fs');
const {exec, escapeHTML} = require('../utils');

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
  INPUT_FEED_NAMES: '',
  INPUT_DISABLE_HTML_ENCODING: 'false',
  TEST_MODE: 'true'
};

// Folder with readme snapshots
const TEST_SNAP_DIR = path.join(__dirname);

// language=markdown
const TEMPLATE = `# Readme test
Post list example:
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

# Other contents
Test content
`;
const TEST_FILE = process.env.DIST ? path.join(__dirname, '../dist/blog-post-workflow') : path.join(__dirname, '../blog-post-workflow');
console.log('Testing: ', TEST_FILE);

const runAndCompareSnap = async (README_FILE, envObj) => {
  envObj = {
    ...envObj,
    INPUT_README_PATH: path.join(TEST_SNAP_DIR, README_FILE)
  };
  fs.writeFileSync(path.join(TEST_SNAP_DIR, README_FILE), TEMPLATE);
  await exec('node', [TEST_FILE],{env: envObj});
  const snapshot = fs.readFileSync(path.join(TEST_SNAP_DIR , README_FILE + '.snap'), 'utf-8');
  const newReadme = fs.readFileSync(path.join(TEST_SNAP_DIR , README_FILE), 'utf-8');
  assert.strictEqual(snapshot, newReadme);
};

// Test block
describe('Blog post workflow tests', function () {
  it('Default template readme generated should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV
    };
    await runAndCompareSnap('Readme.md', envObj);
  });

  it('Multiple readme generated via readme_path should match the snapshots',async function () {
    const readme1 = path.join(TEST_SNAP_DIR, 'Readme.multi.1.md');
    const readme2 = path.join(TEST_SNAP_DIR, 'Readme.multi.2.md');
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: readme1 + ',' + readme2
    };
    fs.writeFileSync(readme1, TEMPLATE);
    fs.writeFileSync(readme2, TEMPLATE);
    await exec('node', [TEST_FILE],{env: envObj});
    const snapshot1 = fs.readFileSync(readme1 + '.snap', 'utf-8');
    const snapshot2 = fs.readFileSync(readme2 + '.snap', 'utf-8');
    const newReadme1 = fs.readFileSync(readme1, 'utf-8');
    const newReadme2 = fs.readFileSync(readme2, 'utf-8');
    assert.strictEqual(snapshot1, newReadme1);
    assert.strictEqual(snapshot2, newReadme2);
  });

  it('Sorting disabled readme should be equal to the saved snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_DISABLE_SORT: 'true'
    };
    await runAndCompareSnap('Readme.sort.md', envObj);
  });

  it('Custom template readme generated should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TEMPLATE: '$newline[$title]($url): $date $description $newline'
    };
    await runAndCompareSnap('Readme.custom.md', envObj);
  });
  it('Generated readme without filters should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FILTER_COMMENTS: ''
    };
    await runAndCompareSnap('Readme.comments.md', envObj);
  });
  it('Generated readme without custom elements should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_CUSTOM_TAGS: 'testingTag/testingTag/,testingTag2/testingTag2/',
      INPUT_TEMPLATE: '$title $url $testingTag $testingTag2 $newline'
    };
    await runAndCompareSnap('Readme.custom-tags.md', envObj);
  });

  it('Generated readme with $emojiKey template should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TEMPLATE: '- $emojiKey(💯,🔥)'
    };
    await runAndCompareSnap('Readme.emojiKey.md', envObj);
  });

  it('Generated readme with $randomEmoji template should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TEMPLATE: '- $randomEmoji(💯,🔥,💫,🚀,🌮)'
    };
    await runAndCompareSnap('Readme.randomEmoji.md', envObj);
  });

  it('Generated readme with $counter template should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TEMPLATE: '- $counter $title'
    };
    await runAndCompareSnap('Readme.counter.md', envObj);
  });

  it('Generated readme with truncated title should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TITLE_MAX_LENGTH: '10'
    };
    await runAndCompareSnap( 'Readme.truncate.title.md', envObj);
  });

  it('Generated readme with truncated description should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_DESCRIPTION_MAX_LENGTH: '10',
      INPUT_TEMPLATE: '$description $newline'
    };
    await runAndCompareSnap('Readme.truncate.description.md', envObj);
  });

  it('Generated readme with advanced manipulation via JS should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_ITEM_EXEC: 'post.title=post.title.replace("Gautam",""); post.title=post.title.replace("browser","");'
    };
    await runAndCompareSnap('Readme.exec.md', envObj);
  });

  it('Readme generated after retry should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FEED_LIST: 'http://localhost:8080/failtest',
      INPUT_RETRY_COUNT: '5'
    };
    await runAndCompareSnap('Readme.retry.md', envObj);
  }).timeout(20*1000);

  it('Generated readme with feed names should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FEED_LIST: 'http://localhost:8080,http://localhost:8080,http://localhost:8080',
      INPUT_FEED_NAMES: 'hello,,world',
      INPUT_TEMPLATE: '$newline - $feedName -> $title ',
      INPUT_MAX_POST_COUNT: '100',
    };
    await runAndCompareSnap('Readme.feedNames.md', envObj);
  });

  it('Generated readme with categories names should match the snapshot',async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FEED_LIST: 'http://localhost:8080',
      INPUT_TEMPLATE: '$categories',
    };
    await runAndCompareSnap('Readme.categories.md', envObj);
  });

  it('escapeHTML should work as expected', function () {
    assert.strictEqual(escapeHTML('<hello>()\'"'), '&lt;hello&gt;&lpar;&rpar;&#39;&quot;');
  });
});
