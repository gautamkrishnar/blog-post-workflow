import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { DEFAULT_TEST_ENV } from './test/testUtils/default-env.js';
// language=markdown
const template = `# Readme test
Post list example:
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

# Other contents
Test content
`;
fs.writeFileSync(path.join(import.meta.dirname, 'test', 'Readme.md'), template);
console.log('Written test file....');
Object.assign(process.env, {
	...DEFAULT_TEST_ENV,
	INPUT_README_PATH: path.join(import.meta.dirname, 'test', 'Readme.md'),
});
const testFile = process.env.DIST
	? './dist/blog-post-workflow.js'
	: './src/blog-post-workflow.js';
console.log('Testing: ', testFile);
const action = await import(
	pathToFileURL(path.join(import.meta.dirname, testFile)).href
);
action.runWorkflow();
