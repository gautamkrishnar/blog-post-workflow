'use strict';

let _suppressLogs = null;

const getSuppressLogs = async () => {
	if (!_suppressLogs) {
		_suppressLogs = await import('./testUtils/suppress-logs.js');
	}
	return _suppressLogs;
};

// Root hooks for Mocha.
// Guard on MOCHA_WORKER_ID so suppression only runs in worker processes.
// The spec reporter runs in the main process (no MOCHA_WORKER_ID), which
// must never have its stdout intercepted.
exports.mochaHooks = {
	async beforeEach() {
		if (process.env.MOCHA_WORKER_ID) {
			const { setupLogSuppression } = await getSuppressLogs();
			setupLogSuppression();
		}
	},

	async afterEach() {
		if (process.env.MOCHA_WORKER_ID) {
			const { restoreLogsOnFailure } = await getSuppressLogs();
			restoreLogsOnFailure.call(this);
		}
	},

	afterAll() {
		if (process.env.MOCHA_WORKER_ID && _suppressLogs) {
			_suppressLogs.restoreMethods();
		}
	},
};
