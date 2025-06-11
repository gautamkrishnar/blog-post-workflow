const { DEFAULT_TEST_ENV } = require('./testUtils/default-env');
const { runAndCompareSnap } = require('./testUtils/testUtils');
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
