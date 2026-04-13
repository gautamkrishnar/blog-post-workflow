import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DEFAULT_TEST_ENV } from './testUtils/default-env.js';
import { TEMPLATE, TEST_FILE, TEST_SNAP_DIR } from './testUtils/testUtils.js';

describe('Multiple readme generated via readme_path', () => {
	it('should match the snapshots', async () => {
		const readme1 = path.join(TEST_SNAP_DIR, 'Readme.multi.1.md');
		const readme2 = path.join(TEST_SNAP_DIR, 'Readme.multi.2.md');
		const envObj = {
			...DEFAULT_TEST_ENV,
			INPUT_README_PATH: `${readme1},${readme2}`,
		};
		process.env = {
			...process.env,
			...envObj,
		};
		fs.writeFileSync(readme1, TEMPLATE);
		fs.writeFileSync(readme2, TEMPLATE);
		const workflow = await import(pathToFileURL(TEST_FILE).href);
		await workflow.runWorkflow();
		const snapshot1 = fs.readFileSync(`${readme1}.snap`, 'utf-8');
		const snapshot2 = fs.readFileSync(`${readme2}.snap`, 'utf-8');
		const newReadme1 = fs.readFileSync(readme1, 'utf-8');
		const newReadme2 = fs.readFileSync(readme2, 'utf-8');
		assert.strictEqual(snapshot1, newReadme1);
		assert.strictEqual(snapshot2, newReadme2);
	});
});
