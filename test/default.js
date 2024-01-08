const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Default template readme generated', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...DEFAULT_TEST_ENV
    };
    await runAndCompareSnap('Readme.md', envObj);
  });
});
