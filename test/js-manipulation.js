import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { runAndCompareSnap } from './testUtils/testUtils.js';

describe('Generated readme with advanced manipulation via JS', () => {
	it('should match the snapshot', async () => {
		const envObj = {
			...process.env,
			...DEFAULT_TEST_ENV,
			INPUT_ITEM_EXEC:
				'post.title=post.title.replace("Gautam",""); post.title=post.title.replace("browser","");',
		};
		await runAndCompareSnap('Readme.exec.md', envObj);
	});
});
