import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Ascending sort order readme (sort_order: asc)', () => {
	it('should be equal to the saved snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_SORT_ORDER: 'asc',
		};
		// Snapshot name will also need to be changed to Readme.sort-order-asc.md
		await runAndCompareSnap('Readme.sort-order-asc.md', envObj);
	});
});
