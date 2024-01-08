const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Custom template readme generated', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_TEMPLATE: '$newline[$title]($url): $date $description $newline'
    };
    await runAndCompareSnap('Readme.custom.md', envObj);
  });
});
