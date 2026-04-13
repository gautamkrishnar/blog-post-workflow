import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

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
