import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with categories names', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_FEED_LIST: 'http://localhost:8080',
			INPUT_TEMPLATE: '$categories',
		};
		await runAndCompareSnap('Readme.categories.md', envObj);
	});
});
