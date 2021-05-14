const {spawn} = require('child_process');
const core = require('@actions/core');

/**
 * Executes a command and returns its result as promise
 * @param cmd {string} command to execute
 * @param args {array} command line args
 * @param options {Object} extra options
 * @return {Promise<Object>}
 */
const exec = (cmd, args = [], options = {}) => new Promise((resolve, reject) => {
  let outputData = '';
  const optionsToCLI = {
    ...options
  };
  if (!optionsToCLI.stdio) {
    Object.assign(optionsToCLI, {stdio: ['inherit', 'inherit', 'inherit']});
  }
  const app = spawn(cmd, args, optionsToCLI);
  if (app.stdout) {
    // Only needed for pipes
    app.stdout.on('data', function (data) {
      outputData += data.toString();
    });
  }

  app.on('close', (code) => {
    if (code !== 0) {
      return reject({code, outputData});
    }
    return resolve({code, outputData});
  });
  app.on('error', () => reject({code: 1, outputData}));
});

/**
 * Builds the new readme by replacing the readme's <!-- BLOG-POST-LIST:START --><!-- BLOG-POST-LIST:END --> tags
 * @param previousContent {string} actual readme content
 * @param newContent {string} content to add
 * @return {string}: content after combining previousContent and newContent
 */
const buildReadme = (previousContent, newContent) => {
  const tagNameInput = core.getInput('comment_tag_name');
  const tagToLookFor = tagNameInput ? `<!-- ${tagNameInput}:` : `<!-- BLOG-POST-LIST:`;
  const closingTag = '-->';
  const tagNewlineFlag = core.getInput('tag_post_pre_newline') === 'true';
  const startOfOpeningTagIndex = previousContent.indexOf(
    `${tagToLookFor}START`,
  );
  const endOfOpeningTagIndex = previousContent.indexOf(
    closingTag,
    startOfOpeningTagIndex,
  );
  const startOfClosingTagIndex = previousContent.indexOf(
    `${tagToLookFor}END`,
    endOfOpeningTagIndex,
  );
  if (
    startOfOpeningTagIndex === -1 ||
    endOfOpeningTagIndex === -1 ||
    startOfClosingTagIndex === -1
  ) {
    // Exit with error if comment is not found on the readme
    core.error(
      `Cannot find the comment tag on the readme:\n${tagToLookFor}START -->\n${tagToLookFor}END -->`
    );
    process.exit(1);
  }
  return [
    previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
    tagNewlineFlag ? '\n' : '',
    newContent,
    tagNewlineFlag ? '\n' : '',
    previousContent.slice(startOfClosingTagIndex),
  ].join('');
};

/**
 * Unicode aware javascript truncate
 * @param str {string} string to truncated
 * @param length {number} length to truncate
 * @return {string} truncated value
 */
const truncateString = (str, length) => {
  const trimmedString = str.trim();
  const truncatedString = [...trimmedString].slice(0, length).join('');
  return truncatedString === trimmedString ?
    trimmedString : truncatedString.trim() + '...';
};

/**
 * Code to do git commit
 * @param githubToken {string} github token
 * @param readmeFilePath {string} path to the readme file
 * @param emptyCommit {boolean} sets whether to do an empty commit or not
 * @return {Promise<void>}
 */
const commitReadme = async (githubToken, readmeFilePath, emptyCommit = false) => {
  // Getting config
  const committerUsername = core.getInput('committer_username');
  const committerEmail = core.getInput('committer_email');
  const commitMessage = core.getInput('commit_message');
  // Doing commit and push
  await exec('git', [
    'config',
    '--global',
    'user.email',
    committerEmail,
  ]);
  if (githubToken) {
    // git remote set-url origin
    await exec('git', ['remote', 'set-url', 'origin',
      `https://${githubToken}@github.com/${process.env.GITHUB_REPOSITORY}.git`]);
  }
  await exec('git', ['config', '--global', 'user.name', committerUsername]);
  if (emptyCommit) {
    await exec('git', ['commit', '--allow-empty', '-m', '"dummy commit to keep the repository ' +
    'active, see https://git.io/Jtm4V"']);
  } else {
    await exec('git', ['add', readmeFilePath]);
    await exec('git', ['commit', '-m', commitMessage]);
  }
  await exec('git', ['push']);
  core.info('Readme updated successfully in the upstream repository');
};

/**
 * Compound parameter parser, Updates obj with compound parameters and returns item name
 * @param sourceWithParam filter source with compound param eg: stackoverflow/Comment by $author/
 * @param obj {Object} object to update
 * @return {string} actual source name eg: stackoverflow
 */
const updateAndParseCompoundParams = (sourceWithParam, obj) => {
  const param = sourceWithParam.split('/'); // Reading params ['stackoverflow','Comment by $author', '']
  if (param.length === 3) {
    Object.assign(obj, {[param[0]]: param[1]});
    return param[0];// Returning source name
  } else {
    return sourceWithParam;
  }
};

/**
 * Returns parsed parameterised templates as array or return null
 * @param template
 * @param keyName
 * @return {null|string[]}
 */
const getParameterisedTemplate = (template, keyName) => {
  const key = '$' + keyName + '(';
  if (template.indexOf(key) > -1) {
    const startIndex = template.indexOf(key) + key.length;
    const endIndex = template.indexOf(')', startIndex);
    if (endIndex === -1) {
      return null;
    }
    return template.slice(startIndex, endIndex).split(',').map(item => item.trim());
  } else {
    return null;
  }
};

module.exports = {
  updateAndParseCompoundParams,
  commitReadme,
  truncateString,
  buildReadme,
  exec,
  getParameterisedTemplate
};
