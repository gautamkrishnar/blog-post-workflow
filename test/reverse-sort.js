const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');

describe('Reverse sorting readme', function () {
  it('should be equal to the saved snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_REVERSE_SORT: 'true'
    };
    await runAndCompareSnap('Readme.reverse-sort.md', envObj);
  });
});
