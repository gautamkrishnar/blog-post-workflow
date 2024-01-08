const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with $emojiKey template', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TEMPLATE: '- $emojiKey(💯,🔥)'
    };
    await runAndCompareSnap('Readme.emojiKey.md', envObj);
  });
});
