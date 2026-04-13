import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Folder with readme snapshots
const TEST_SNAP_DIR = path.join(path.dirname(import.meta.dirname), 'snapshots');
// language=markdown
const TEMPLATE = `# Readme test
Post list example:
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->

# Other contents
Test content
`;
const projectDir = path.dirname(path.dirname(import.meta.dirname));

const TEST_FILE = process.env.DIST
	? path.join(projectDir, 'dist/blog-post-workflow.js')
	: path.join(projectDir, 'src/blog-post-workflow.js');

const runAndCompareSnap = async (README_FILE, envObjParam) => {
	const readmePath = path.join(TEST_SNAP_DIR, README_FILE);
	const envObj = {
		...envObjParam,
		INPUT_README_PATH: readmePath,
	};
	if (fs.existsSync(readmePath)) {
		console.log('Removing stale test readme', readmePath);
		fs.rmSync(readmePath);
	}
	fs.writeFileSync(readmePath, TEMPLATE);
	process.env = {
		...process.env,
		...envObj,
	};
	const workflow = await import(pathToFileURL(TEST_FILE).href);
	await workflow.runWorkflow();
	const snapshot = fs.readFileSync(
		path.join(TEST_SNAP_DIR, `${README_FILE}.snap`),
		'utf-8',
	);
	const newReadme = fs.readFileSync(readmePath, 'utf-8');
	assert.strictEqual(snapshot, newReadme);
};

export { runAndCompareSnap, TEMPLATE, TEST_FILE, TEST_SNAP_DIR };
