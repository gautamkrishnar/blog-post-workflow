const { DEFAULT_TEST_ENV } = require('./testUtils/default-env');
const { runAndCompareSnap } = require('./testUtils/testUtils');
describe('Default template readme generated', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...DEFAULT_TEST_ENV,
		};
		await runAndCompareSnap('Readme.md', envObj);
	});
});
