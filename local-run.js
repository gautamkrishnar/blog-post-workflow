const process = require('process');
const path = require('path');
const fs = require('fs');
const {DEFAULT_TEST_ENV} = require('./test/testUtils/default-env');
// language=markdown
const template = `# Readme test
Post list example:
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

# Other contents
Test content
`;
fs.writeFile(path.join(__dirname, 'test', 'Readme.md'), template, () => {
  console.log('Written test file....');
  Object.assign(process.env, {
    ...DEFAULT_TEST_ENV,
    INPUT_README_PATH: path.join(__dirname, 'test', 'Readme.md')
  });
  const testFile = process.env.DIST ? './dist/blog-post-workflow' : './src/blog-post-workflow';
  console.log('Testing: ', testFile);
  require(testFile);
});
