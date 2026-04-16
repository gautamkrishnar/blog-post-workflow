import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('item_exec can access customTags variable', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_CUSTOM_TAGS: 'testingTag/testingTag/',
			INPUT_ITEM_EXEC:
				'if (customTags.testingTag === "world") post.title = "[TAGGED] " + post.title;',
		};
		await runAndCompareSnap('Readme.exec-custom-tags.md', envObj);
	});
});
