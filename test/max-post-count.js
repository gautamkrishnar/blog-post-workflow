import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with max post count', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_MAX_POST_COUNT: '1',
		};
		await runAndCompareSnap('Readme.maxPostCount.md', envObj);
	});
});
