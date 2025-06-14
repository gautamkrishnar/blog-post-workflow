const { DEFAULT_TEST_ENV } = require('./testUtils/default-env');
const { runAndCompareSnap } = require('./testUtils/testUtils');
describe('Default template readme generated', () => {
	it('Generated readme with $randomEmoji template should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_TEMPLATE: '- $randomEmoji(💯,🔥,💫,🚀,🌮)',
		};
		await runAndCompareSnap('Readme.randomEmoji.md', envObj);
	});
});
