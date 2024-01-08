const path = require('path');
const fs = require('fs');
const { exec, escapeHTML } = require('../../src/utils');
const assert = require('assert');

// Folder with readme snapshots
const TEST_SNAP_DIR = path.join(path.dirname(__dirname), 'snapshots');
// language=markdown
const TEMPLATE = `# Readme test
Post list example:
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

# Other contents
Test content
`;
const projectDir = path.dirname(path.dirname(__dirname));

const TEST_FILE = process.env.DIST ?
  path.join(projectDir, 'dist/blog-post-workflow') : path.join(projectDir, 'src/blog-post-workflow');
console.log('Testing: ', TEST_FILE);

const runAndCompareSnap = async (README_FILE, envObj) => {
  const readmePath = path.join(TEST_SNAP_DIR, README_FILE);
  envObj = {
    ...envObj,
    INPUT_README_PATH: readmePath
  };
  if (fs.existsSync(readmePath)) {
    console.log("Removing stale test readme", readmePath);
    fs.rmSync(readmePath);
  }
  fs.writeFileSync(readmePath, TEMPLATE);
  process.env = {
    ...process.env,
    ...envObj
  };
  const workflow = await require(TEST_FILE);
  await workflow.runWorkflow();
  const snapshot = fs.readFileSync(path.join(TEST_SNAP_DIR, README_FILE + '.snap'), 'utf-8');
  const newReadme = fs.readFileSync(readmePath, 'utf-8');
  assert.strictEqual(snapshot, newReadme);
};

module.exports = {
  runAndCompareSnap,
  TEST_SNAP_DIR,
  TEMPLATE,
  TEST_FILE
}
