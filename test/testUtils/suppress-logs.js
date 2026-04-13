import path from 'node:path';

const projectRoot = path.dirname(path.dirname(import.meta.dirname));

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
let logs = [];

const setupLogSuppression = () => {
	logs = [];
	process.stdout.write = (chunk, encoding, callback) => {
		logs.push(String(chunk));
		if (typeof encoding === 'function') encoding();
		else if (typeof callback === 'function') callback();
		return true;
	};
};

const restoreLogsOnFailure = function () {
	process.stdout.write = originalStdoutWrite;
	if (this.currentTest && this.currentTest.state === 'failed') {
		const testName = this.currentTest.title;
		const testFile = this.currentTest.file
			? path.relative(projectRoot, this.currentTest.file)
			: 'unknown';
		originalStdoutWrite(
			`\n--- Logs from failed test: "${testName}" (${testFile}) ---\n`,
		);
		for (const log of logs) {
			originalStdoutWrite(log);
		}
		originalStdoutWrite('--- End of logs ---\n\n');
	}
	logs = [];
};

const restoreMethods = () => {
	process.stdout.write = originalStdoutWrite;
};

export { restoreLogsOnFailure, restoreMethods, setupLogSuppression };
