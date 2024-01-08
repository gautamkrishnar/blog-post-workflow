const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme without custom elements', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_CUSTOM_TAGS: 'testingTag/testingTag/,testingTag2/testingTag2/',
      INPUT_TEMPLATE: '$title $url $testingTag $testingTag2 $newline'
    };
    await runAndCompareSnap('Readme.custom-tags.md', envObj);
  });
});
