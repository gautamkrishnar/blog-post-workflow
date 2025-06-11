const { DEFAULT_TEST_ENV } = require('./testUtils/default-env');
const { runAndCompareSnap } = require('./testUtils/testUtils');
describe('Generated readme without filters', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_FILTER_COMMENTS: '',
		};
		await runAndCompareSnap('Readme.comments.md', envObj);
	});
});
