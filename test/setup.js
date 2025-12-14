const {
	setupLogSuppression,
	restoreLogsOnFailure,
	restoreMethods,
} = require('./testUtils/suppress-logs');

// Root hooks for Mocha
exports.mochaHooks = {
	beforeEach() {
		setupLogSuppression();
	},

	afterEach() {
		restoreLogsOnFailure.call(this);
	},

	afterAll() {
		restoreMethods();
	},
};
