import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with feed names', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_FEED_LIST:
				'http://localhost:8080,http://localhost:8080,http://localhost:8080',
			INPUT_FEED_NAMES: 'hello,,world',
			INPUT_TEMPLATE: '$newline - $feedName -> $title ',
			INPUT_MAX_POST_COUNT: '100',
		};
		await runAndCompareSnap('Readme.feedNames.md', envObj);
	});
});
