import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Disabled sort with desc order (disable_sort: true, sort_order: desc)', () => {
	it('should reverse feed order and be equal to the saved snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_DISABLE_SORT: 'true',
			INPUT_REVERSE_ORDER: 'true',
			INPUT_MAX_POST_COUNT: '3',
		};
		await runAndCompareSnap('Readme.disable-sort-reverse-order.md', envObj);
	});
});
