import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Default template readme generated', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...DEFAULT_TEST_ENV,
		};
		await runAndCompareSnap('Readme.md', envObj);
	});
});
