const { DEFAULT_TEST_ENV } = require('./testUtils/default-env');
const { runAndCompareSnap } = require('./testUtils/testUtils');
describe('Generated readme with $counter template', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_TEMPLATE: '- $counter $title',
		};
		await runAndCompareSnap('Readme.counter.md', envObj);
	});
});
