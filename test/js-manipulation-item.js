import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('item_exec can access item variable', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_ITEM_EXEC:
				'if (item.author) post.title = post.title + " by " + item.author;',
		};
		await runAndCompareSnap('Readme.exec-item.md', envObj);
	});
});
