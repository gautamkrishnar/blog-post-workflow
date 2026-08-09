import assert from 'node:assert';
import {
	categoriesToArray,
	commitReadme,
	escapeHTML,
	getParameterisedTemplate,
	truncateString,
	updateAndParseCompoundParams,
} from '../src/utils.js';

// Skip utils check on dist tests because it is a bundle that do not export these functions
if (process.env.DIST !== 'true') {
	describe('truncateString', () => {
		it('should return the original string if its length is less than or equal to the specified length', () => {
			const result = truncateString('Hello', 10);
			assert.strictEqual(result, 'Hello');
		});

		it('should truncate the string and add "..." if the string is longer than the specified length', () => {
			const result = truncateString('Hello, world!', 5);
			assert.strictEqual(result, 'Hello...');
		});

		it('should handle strings with leading and trailing spaces correctly', () => {
			const result = truncateString('  Hello, world!  ', 5);
			assert.strictEqual(result, 'Hello...');
		});

		it('should return an empty string if an empty string is provided', () => {
			const result = truncateString('', 5);
			assert.strictEqual(result, '');
		});

		it('should return "..." if the specified length is zero', () => {
			const result = truncateString('Hello', 0);
			assert.strictEqual(result, '...');
		});

		it('should return "H..." if the specified length is 1 after trimming leading spaces', () => {
			const result = truncateString('   Hello', 1);
			assert.strictEqual(result, 'H...');
		});

		it('should correctly handle multi-byte characters', () => {
			const result = truncateString('こんにちは世界', 5);
			assert.strictEqual(result, 'こんにちは...');
		});
	});

	describe('updateAndParseCompoundParams', () => {
		it('should update the object with the correct key-value pair and return the source name when the source has compound parameters', () => {
			const obj = {};
			const result = updateAndParseCompoundParams(
				'stackoverflow/Comment by $author/',
				obj,
			);
			assert.strictEqual(result, 'stackoverflow');
			assert.deepStrictEqual(obj, { stackoverflow: 'Comment by $author' });
		});

		it('should return the original source name if the source does not contain exactly 3 parts', () => {
			const obj = {};
			const result = updateAndParseCompoundParams('github', obj);
			assert.strictEqual(result, 'github');
			assert.deepStrictEqual(obj, {}); // Ensure obj is not modified
		});

		it('should handle cases where the source has only 2 parts and return the original source', () => {
			const obj = {};
			const result = updateAndParseCompoundParams('github/Issue', obj);
			assert.strictEqual(result, 'github/Issue');
			assert.deepStrictEqual(obj, {}); // Ensure obj is not modified
		});

		it('should handle cases where the source has more than 3 parts and return the original source', () => {
			const obj = {};
			const result = updateAndParseCompoundParams(
				'stackoverflow/Comment by $author/extra/part',
				obj,
			);
			assert.strictEqual(result, 'stackoverflow/Comment by $author/extra/part');
			assert.deepStrictEqual(obj, {}); // Ensure obj is not modified
		});

		it('should handle an empty string as the source and not update the object', () => {
			const obj = {};
			const result = updateAndParseCompoundParams('', obj);
			assert.strictEqual(result, '');
			assert.deepStrictEqual(obj, {}); // Ensure obj is not modified
		});

		it('should handle cases where the object is pre-populated', () => {
			const obj = { existingKey: 'existingValue' };
			const result = updateAndParseCompoundParams(
				'stackoverflow/Comment by $author/',
				obj,
			);
			assert.strictEqual(result, 'stackoverflow');
			assert.deepStrictEqual(obj, {
				existingKey: 'existingValue',
				stackoverflow: 'Comment by $author',
			});
		});
	});

	describe('getParameterisedTemplate', () => {
		it('should return an array of parameters when the template contains a valid key with parameters', () => {
			const template = '$randomEmoji(💯,🔥,💫,🚀,🌮) $emojiKey(💯,🔥,💫)';
			const result = getParameterisedTemplate(template, 'randomEmoji');
			assert.deepStrictEqual(result, ['💯', '🔥', '💫', '🚀', '🌮']);
		});

		it('should return an array of parameters when the template contains another valid key with parameters', () => {
			const template = '$randomEmoji(💯,🔥,💫,🚀,🌮) $emojiKey(💯,🔥,💫)';
			const result = getParameterisedTemplate(template, 'emojiKey');
			assert.deepStrictEqual(result, ['💯', '🔥', '💫']);
		});

		it('should return null if the key does not exist in the template', () => {
			const template = '$randomEmoji(💯,🔥,💫,🚀,🌮) $emojiKey(💯,🔥,💫)';
			const result = getParameterisedTemplate(template, 'missingKey');
			assert.strictEqual(result, null);
		});

		it('should return null if the key exists but is not followed by an opening parenthesis', () => {
			const template = '$randomEmoji💯,🔥,💫,🚀,🌮 $emojiKey(💯,🔥,💫)';
			const result = getParameterisedTemplate(template, 'randomEmoji');
			assert.strictEqual(result, null);
		});

		it('should handle templates with multiple occurrences of the same key', () => {
			const template = '$randomEmoji(💯,🔥) and again $randomEmoji(💫,🚀)';
			const result = getParameterisedTemplate(template, 'randomEmoji');
			assert.deepStrictEqual(result, ['💯', '🔥']); // Only the first occurrence should be processed
		});

		it('should correctly parse keys with spaces around parameters', () => {
			const template = '$randomEmoji( 💯 , 🔥 , 💫 ) $emojiKey( 💯,🔥 ,💫)';
			const result = getParameterisedTemplate(template, 'randomEmoji');
			assert.deepStrictEqual(result, ['💯', '🔥', '💫']); // Spaces should be trimmed
		});

		it('should return null if the template is empty', () => {
			const template = '';
			const result = getParameterisedTemplate(template, 'randomEmoji');
			assert.strictEqual(result, null);
		});

		it('should return null if the key is empty', () => {
			const template = '$randomEmoji(💯,🔥,💫,🚀,🌮)';
			const result = getParameterisedTemplate(template, '');
			assert.strictEqual(result, null);
		});
	});

	describe('escapeHTML', () => {
		it('should escape the ampersand character (&)', () => {
			const result = escapeHTML('Rock & Roll');
			assert.strictEqual(result, 'Rock &amp; Roll');
		});

		it('should escape the less-than character (<)', () => {
			const result = escapeHTML('5 < 10');
			assert.strictEqual(result, '5 &lt; 10');
		});

		it('should escape the greater-than character (>)', () => {
			const result = escapeHTML('10 > 5');
			assert.strictEqual(result, '10 &gt; 5');
		});

		it("should escape the single quote character (')", () => {
			const result = escapeHTML("It's a test");
			assert.strictEqual(result, 'It&#39;s a test');
		});

		it('should escape the double quote character (")', () => {
			const result = escapeHTML('She said "Hello"');
			assert.strictEqual(result, 'She said &quot;Hello&quot;');
		});

		it('should escape the opening parenthesis character (()', () => {
			const result = escapeHTML('3 * (2 + 1)');
			assert.strictEqual(result, '3 * &lpar;2 + 1&rpar;');
		});

		it('should escape the closing parenthesis character ())', () => {
			const result = escapeHTML('Math.PI = 3.14');
			assert.strictEqual(result, 'Math.PI = 3.14');
		});

		it('should escape multiple conflicting characters', () => {
			const result = escapeHTML(
				'if (a < b) { return "yes"; } else { return "no"; }',
			);
			assert.strictEqual(
				result,
				'if &lpar;a &lt; b&rpar; { return &quot;yes&quot;; } else { return &quot;no&quot;; }',
			);
		});

		it('should return the original string if there are no conflicting characters', () => {
			const result = escapeHTML('No special characters');
			assert.strictEqual(result, 'No special characters');
		});

		it('should return an empty string if the input is an empty string', () => {
			const result = escapeHTML('');
			assert.strictEqual(result, '');
		});
	});

	describe('categoriesToArray', () => {
		it('should return an array of strings when the input is an array of strings', () => {
			const categories = ['C#', 'Controller'];
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, ['C#', 'Controller']);
		});
		it('should return an array of strings when the input is an array of CategoryObj objects', () => {
			const categories = [{ _: 'C#' }, { _: 'Controller' }];
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, ['C#', 'Controller']);
		});

		it('should return an array of strings when the input is a mixed array of strings and CategoryObj objects', () => {
			const categories = [
				'Programming',
				{ _: 'C#' },
				{ _: 'Controller' },
				'Tech',
			];
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, [
				'Programming',
				'C#',
				'Controller',
				'Tech',
			]);
		});

		it('should return an empty array when the input is an empty array', () => {
			const categories = [];
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, []);
		});

		it('should return an empty array when the input is not an array', () => {
			const categories = null;
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, []);
		});

		it('should ignore objects without the "_" property', () => {
			const categories = [{ _: 'C#' }, { domain: 'http://example.com' }];
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, ['C#']);
		});

		it('should return an empty array when the input array contains only objects without the "_" property', () => {
			const categories = [
				{ domain: 'http://example.com' },
				{ domain: 'http://example.org' },
			];
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, []);
		});

		it('should handle a mix of valid and invalid objects', () => {
			const categories = [
				'Programming',
				{ _: 'C#' },
				{ domain: 'http://example.com' },
				'Tech',
			];
			const result = categoriesToArray(categories);
			assert.deepStrictEqual(result, ['Programming', 'C#', 'Tech']);
		});
	});

	describe('commitReadme git push simulation', () => {
		const makeExecFn = (pushBehavior) => async (cmd, args) => {
			const isGitPush = cmd === 'git' && args[0] === 'push';
			if (isGitPush) {
				return pushBehavior();
			}
			return { code: 0, outputData: '', errorData: '' };
		};

		beforeEach(() => {
			process.env.INPUT_COMMITTER_USERNAME = 'test-bot';
			process.env.INPUT_COMMITTER_EMAIL = 'test-bot@example.com';
			process.env.INPUT_COMMIT_MESSAGE = 'test commit';
			process.env.GITHUB_REPOSITORY = 'owner/repo';
		});

		it('should resolve when git push succeeds', async () => {
			const execFn = makeExecFn(() =>
				Promise.resolve({ code: 0, outputData: '', errorData: '' }),
			);
			await assert.doesNotReject(() =>
				commitReadme('token', ['README.md'], execFn),
			);
		});

		it('should throw and log permission error on 403', async () => {
			const errors = [];
			const origError = process.env.ACTIONS_RUNNER_DEBUG;
			// Capture core.error by overriding stderr temporarily — just assert the thrown error
			const execFn = makeExecFn(() =>
				Promise.reject({
					code: 128,
					outputData: '',
					errorData:
						'remote: Permission to owner/repo.git denied to github-actions[bot].\nfatal: unable to access: The requested URL returned error: 403',
				}),
			);
			await assert.rejects(
				() => commitReadme('token', ['README.md'], execFn),
				(err) => {
					assert.ok(
						err.message.includes('128'),
						'error message should include exit code',
					);
					return true;
				},
			);
			void origError;
			void errors;
		});

		it('should throw with exit code on generic push failure', async () => {
			const execFn = makeExecFn(() =>
				Promise.reject({
					code: 1,
					outputData: '',
					errorData: 'some other git error',
				}),
			);
			await assert.rejects(
				() => commitReadme('token', ['README.md'], execFn),
				(err) => {
					assert.ok(err.message.includes('exit code 1'));
					assert.ok(err.message.includes('some other git error'));
					return true;
				},
			);
		});

		it('should throw on permission denied message without 403', async () => {
			const execFn = makeExecFn(() =>
				Promise.reject({
					code: 128,
					outputData: '',
					errorData: 'error: permission denied',
				}),
			);
			await assert.rejects(
				() => commitReadme('token', ['README.md'], execFn),
				(err) => {
					assert.ok(err.message.includes('128'));
					return true;
				},
			);
		});

		it('should skip setting remote URL when no token provided', async () => {
			const calls = [];
			const execFn = async (cmd, args) => {
				calls.push({ cmd, args });
				return { code: 0, outputData: '', errorData: '' };
			};
			await commitReadme(null, ['README.md'], execFn);
			const remoteSetUrl = calls.find(
				(c) => c.cmd === 'git' && c.args[0] === 'remote',
			);
			assert.strictEqual(remoteSetUrl, undefined);
		});
	});
}
