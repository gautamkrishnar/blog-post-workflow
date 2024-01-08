const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with truncated description', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_DESCRIPTION_MAX_LENGTH: '10',
      INPUT_TEMPLATE: '$description $newline'
    };
    await runAndCompareSnap('Readme.truncate.description.md', envObj);
  });
});
