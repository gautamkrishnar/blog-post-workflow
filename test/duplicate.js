import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with remove duplicates flag', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_FEED_LIST: 'http://localhost:8080/duplicates',
			INPUT_REMOVE_DUPLICATES: 'true',
		};
		await runAndCompareSnap('Readme.removeDuplicates.md', envObj);
	});
});
