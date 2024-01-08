const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Readme generated after retry', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FEED_LIST: 'http://localhost:8080/failtest',
      INPUT_RETRY_COUNT: '5'
    };
    await runAndCompareSnap('Readme.retry.md', envObj);
  }).timeout(20 * 1000);
});
