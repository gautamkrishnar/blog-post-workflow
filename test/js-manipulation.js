const {DEFAULT_TEST_ENV} = require('./testUtils/default-env');
const {runAndCompareSnap} = require('./testUtils/testUtils');
describe('Generated readme with advanced manipulation via JS', function () {
  it('should match the snapshot', async function () {
    const envObj = {
      ...process.env,
      ...DEFAULT_TEST_ENV,
      INPUT_ITEM_EXEC: 'post.title=post.title.replace("Gautam",""); post.title=post.title.replace("browser","");'
    };
    await runAndCompareSnap('Readme.exec.md', envObj);
  });
});
