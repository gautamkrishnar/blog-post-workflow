import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Sorting disabled readme', () => {
	it('should be equal to the saved snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_DISABLE_SORT: 'true',
		};
		await runAndCompareSnap('Readme.sort.md', envObj);
	});
});
