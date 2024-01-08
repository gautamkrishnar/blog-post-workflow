const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with remove duplicates flag', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FEED_LIST: 'http://localhost:8080/duplicates',
      INPUT_REMOVE_DUPLICATES: 'true'
    };
    await runAndCompareSnap('Readme.removeDuplicates.md', envObj);
  });
});
