import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with truncated title', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_TITLE_MAX_LENGTH: '10',
		};
		await runAndCompareSnap('Readme.truncate.title.md', envObj);
	});
});
