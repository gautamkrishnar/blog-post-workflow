const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with categories template', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_FEED_LIST: 'http://localhost:8080',
      INPUT_TEMPLATE: '$categories',
      INPUT_CATEGORIES_TEMPLATE: '$category<br/>'
    };
    await runAndCompareSnap('Readme.categories.template.md', envObj);
  });
});
