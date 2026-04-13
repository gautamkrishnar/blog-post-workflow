import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with no validation flag', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_FEED_LIST: 'http://localhost:8080/empty-tags',
			INPUT_DISABLE_ITEM_VALIDATION: 'true',
		};
		await runAndCompareSnap('Readme.emptyTags.md', envObj);
	});
});
