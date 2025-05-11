const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');

describe('Ascending sort order readme (sort_order: asc)', function () {
  it('should be equal to the saved snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_SORT_ORDER: 'asc' // Changed from REVERSE_SORT: 'true'
    };
    // Snapshot name will also need to be changed to Readme.sort-order-asc.md
    await runAndCompareSnap('Readme.sort-order-asc.md', envObj);
  });
});
