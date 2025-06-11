const { DEFAULT_TEST_ENV } = require('./testUtils/default-env');
const { runAndCompareSnap } = require('./testUtils/testUtils');
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
