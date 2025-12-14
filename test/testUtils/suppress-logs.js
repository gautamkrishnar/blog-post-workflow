const core = require('@actions/core');
const path = require('node:path');

// Get project root directory (where package.json is)
const projectRoot = path.dirname(path.dirname(__dirname));

// Store original methods
const originalMethods = {
	info: core.info,
	debug: core.debug,
	warning: core.warning,
	error: core.error,
	setSecret: core.setSecret,
	setOutput: core.setOutput,
	setFailed: core.setFailed,
	notice: core.notice,
	startGroup: core.startGroup,
	endGroup: core.endGroup,
};

// Store logs during test execution
let logs = [];

/**
 * Setup log suppression before each test
 */
const setupLogSuppression = () => {
	// Clear logs
	logs = [];

	// Mock core methods to capture logs instead of printing
	core.info = (...args) => {
		logs.push({ level: 'info', args });
	};

	core.debug = (...args) => {
		logs.push({ level: 'debug', args });
	};

	core.warning = (...args) => {
		logs.push({ level: 'warning', args });
	};

	core.error = (...args) => {
		logs.push({ level: 'error', args });
	};

	core.setSecret = () => {
		// Suppress ::add-mask:: output
	};

	core.setOutput = () => {
		// Suppress ::set-output:: output
	};

	core.setFailed = (...args) => {
		logs.push({ level: 'setFailed', args });
	};

	core.notice = (...args) => {
		logs.push({ level: 'notice', args });
	};

	core.startGroup = () => {
		// Suppress group output
	};

	core.endGroup = () => {
		// Suppress group output
	};
};

/**
 * Restore original methods and dump logs if test failed
 */
const restoreLogsOnFailure = function () {
	// Check if current test failed
	if (this.currentTest && this.currentTest.state === 'failed') {
		// Dump all captured logs
		const testName = this.currentTest.title;
		const testFile = path.relative(projectRoot, this.currentTest.file);
		console.log(`\n--- Logs from failed test: "${testName}" (${testFile}) ---`);
		for (const log of logs) {
			const message = log.args.join(' ');
			console.log(`[${log.level.toUpperCase()}] ${message}`);
		}
		console.log('--- End of logs ---\n');
	}

	// Clear logs array
	logs = [];
};

/**
 * Restore original core methods
 */
const restoreMethods = () => {
	core.info = originalMethods.info;
	core.debug = originalMethods.debug;
	core.warning = originalMethods.warning;
	core.error = originalMethods.error;
	core.setSecret = originalMethods.setSecret;
	core.setOutput = originalMethods.setOutput;
	core.setFailed = originalMethods.setFailed;
	core.notice = originalMethods.notice;
	core.startGroup = originalMethods.startGroup;
	core.endGroup = originalMethods.endGroup;
};

module.exports = {
	setupLogSuppression,
	restoreLogsOnFailure,
	restoreMethods,
};
