const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with no validation flag', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FEED_LIST: 'http://localhost:8080/empty-tags',
      INPUT_DISABLE_ITEM_VALIDATION: 'true'
    };
    await runAndCompareSnap('Readme.emptyTags.md', envObj);
  });
});
