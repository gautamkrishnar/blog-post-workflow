const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const {TEST_SNAP_DIR, TEMPLATE, TEST_FILE} = require("./testUtils/testUtils");
describe('Multiple readme generated via readme_path', function () {
  it('should match the snapshots', async function () {
    const readme1 = path.join(TEST_SNAP_DIR, 'Readme.multi.1.md');
    const readme2 = path.join(TEST_SNAP_DIR, 'Readme.multi.2.md');
    const envObj = {
      ...DEFAULT_TEST_ENV,
      INPUT_README_PATH: readme1 + ',' + readme2
    };
    process.env = {
      ...process.env,
      ...envObj
    };
    fs.writeFileSync(readme1, TEMPLATE);
    fs.writeFileSync(readme2, TEMPLATE);
    const workflow = await require(TEST_FILE);
    await workflow.runWorkflow();
    const snapshot1 = fs.readFileSync(readme1 + '.snap', 'utf-8');
    const snapshot2 = fs.readFileSync(readme2 + '.snap', 'utf-8');
    const newReadme1 = fs.readFileSync(readme1, 'utf-8');
    const newReadme2 = fs.readFileSync(readme2, 'utf-8');
    assert.strictEqual(snapshot1, newReadme1);
    assert.strictEqual(snapshot2, newReadme2);
  });
});
