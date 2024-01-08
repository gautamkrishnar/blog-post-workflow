const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with feed names', function () {
  it('should match the snapshot', async function () {
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
});
