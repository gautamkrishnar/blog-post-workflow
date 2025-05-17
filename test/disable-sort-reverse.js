const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');

describe('Disabled sort with desc order (disable_sort: true, sort_order: desc)', function () {
  it('should reverse feed order and be equal to the saved snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_DISABLE_SORT: 'true',
      INPUT_REVERSE_ORDER: 'true',
      INPUT_MAX_POST_COUNT: '3'
    };
    await runAndCompareSnap('Readme.disable-sort-reverse-order.md', envObj);
  });
});
