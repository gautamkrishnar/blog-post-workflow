import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Custom template readme generated', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_TEMPLATE: '$newline[$title]($url): $date $description $newline',
		};
		await runAndCompareSnap('Readme.custom.md', envObj);
	});
});
