import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with truncated description', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_DESCRIPTION_MAX_LENGTH: '10',
			INPUT_TEMPLATE: '$description $newline',
		};
		await runAndCompareSnap('Readme.truncate.description.md', envObj);
	});
});
