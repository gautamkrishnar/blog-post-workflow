const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with truncated title', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TITLE_MAX_LENGTH: '10'
    };
    await runAndCompareSnap('Readme.truncate.title.md', envObj);
  });
});
