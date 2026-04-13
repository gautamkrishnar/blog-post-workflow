import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme without custom elements', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_CUSTOM_TAGS: 'testingTag/testingTag/,testingTag2/testingTag2/',
			INPUT_TEMPLATE: '$title $url $testingTag $testingTag2 $newline',
		};
		await runAndCompareSnap('Readme.custom-tags.md', envObj);
	});
});
