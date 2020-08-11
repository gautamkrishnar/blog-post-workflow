const process = require('process');
let Parser = require('rss-parser');
const core = require('@actions/core');
const fs = require('fs');
const exec = require('./exec');

/**
 * Builds the new readme by replacing the readme's <!-- BLOG-POST-LIST:START --><!-- BLOG-POST-LIST:END --> tags
 * @param previousContent {string}: actual readme content
 * @param newContent {string}: content to add
 * @return {string}: content after combining previousContent and newContent
 */
const buildReadme = (previousContent, newContent) => {
  const tagNameInput = core.getInput('comment_tag_name');
  const tagToLookFor = tagNameInput ? `<!-- ${tagNameInput}:` : `<!-- BLOG-POST-LIST:`;
  const closingTag = '-->';
  const tagNewlineFlag = core.getInput('tag_post_pre_newline');
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
      `Cannot find the comment tag on the readme:\n<!-- ${tagToLookFor}:START -->\n<!-- ${tagToLookFor}:END -->`
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
 * Code to do git commit
 * @return {Promise<void>}
 */
const commitReadme = async () => {
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
  if (GITHUB_TOKEN) {
    // git remote set-url origin
    await exec('git', ['remote', 'set-url', 'origin',
      `https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`]);
  }
  await exec('git', ['config', '--global', 'user.name', committerUsername]);
  await exec('git', ['add', README_FILE_PATH]);
  await exec('git', ['commit', '-m', commitMessage]);
  await exec('git', ['push']);
  core.info("Readme updated successfully in the upstream repository");
  // Making job fail if one of the source fails
  process.exit(jobFailFlag ? 1 : 0);
};

// Blog workflow code
const userAgent = core.getInput('user_agent');
const acceptHeader = core.getInput('accept_header');

let parser = new Parser({headers: {'User-Agent': userAgent, "Accept": acceptHeader}});

// Total no of posts to display on readme, all sources combined, default: 5
const TOTAL_POST_COUNT = Number.parseInt(core.getInput('max_post_count'));
// Readme path, default: ./README.md
const README_FILE_PATH = core.getInput('readme_path');
const GITHUB_TOKEN = core.getInput('gh_token');
const FILTER_PARAMS = {
  stackoverflow: "Comment by $author",
  stackexchange: "Comment by $author",
};

/**
 * Updates FILTER_PARAMS object with filter parameters
 * @param sourceWithParam filter source with param eg: stackoverflow/Comment by $author/
 * @return {string} actual source name eg: stackoverflow
 */
const updateAndParseParams = (sourceWithParam) => {
  const param = sourceWithParam.split('/'); // Reading params
  if (param.length === 3) {
    Object.assign(FILTER_PARAMS, {[param[0]]: param[1]});
    return param[0];// Returning source name
  } else {
    return sourceWithParam;
  }
};

core.setSecret(GITHUB_TOKEN);
const COMMENT_FILTERS = core
  .getInput('filter_comments')
  .trim()
  .split(',')
  .map((item)=>{
    const str = item.trim();
    if (str.startsWith('stackoverflow') || str.startsWith('stackexchange')) {
      return updateAndParseParams(item);
    } else {
      return str;
    }
  });

const promiseArray = []; // Runner
const runnerNameArray = []; // To show the error/success message
let postsArray = []; // Array to store posts
let jobFailFlag = false; // Job status flag

const feedObjString = core.getInput('feed_list').trim();

// Reading feed list from the workflow input
let feedList = feedObjString.split(',').map(item => item.trim());
if (feedList.length === 0) {
  core.error("Please double check the value of feed_list");
  process.exit(1);
}

// filters out every medium comment (PR #4)
const ignoreMediumComments = (item) => !(COMMENT_FILTERS.indexOf('medium') !== -1 &&
  item.link.includes('medium.com') &&
  item.categories === undefined);

// filters out stackOverflow comments (#16)
const ignoreStackOverflowComments = (item) => !(COMMENT_FILTERS.indexOf('stackoverflow') !== -1 &&
  item.link.includes('stackoverflow.com') &&
  item.title.startsWith(FILTER_PARAMS.stackoverflow.replace(/\$author/g, item.author)));

// filters out stackOverflow comments (#16)
const ignoreStackExchangeComments = (item) => !(COMMENT_FILTERS.indexOf('stackexchange') !== -1 &&
  item.link.includes('stackexchange.com') &&
  item.title.startsWith(FILTER_PARAMS.stackexchange.replace(/\$author/g, item.author)));

feedList.forEach((siteUrl) => {
  runnerNameArray.push(siteUrl);
  promiseArray.push(new Promise((resolve, reject) => {
    parser.parseURL(siteUrl).then((data) => {
      if (!data.items) {
        reject("Cannot read response->item");
      } else {
        const responsePosts = data.items;
        const posts = responsePosts
          .filter(ignoreMediumComments)
          .filter(ignoreStackOverflowComments)
          .filter(ignoreStackExchangeComments)
          .map((item) => {
            // Validating keys to avoid errors
            if (!item.pubDate) {
              reject("Cannot read response->item->pubDate");
            }
            if (!item.title) {
              reject("Cannot read response->item->title");
            }
            if (!item.link) {
              reject("Cannot read response->item->link");
            }
            return {
              title: item.title,
              url: item.link,
              date: new Date(item.pubDate)
            };
          });
        resolve(posts);
      }
    }).catch(reject);
  }));
});

// Processing the generated promises
Promise.allSettled(promiseArray).then((results) => {
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      // Succeeded
      core.info(runnerNameArray[index] + ' runner succeeded. Post count: ' + result.value.length);
      postsArray.push(...result.value);
    } else {
      jobFailFlag = true;
      // Rejected
      core.error(runnerNameArray[index] + ' runner failed, please verify the configuration. Error:');
      core.error(result.reason);
    }
  });
}).finally(() => {
  // Sorting posts based on date
  if (core.getInput('disable_sort') === "false") {
    postsArray.sort(function (a, b) {
      return b.date - a.date;
    });
  }
  // Slicing with the max count
  postsArray = postsArray.slice(0, TOTAL_POST_COUNT);
  if (postsArray.length > 0) {
    try {
      const readmeData = fs.readFileSync(README_FILE_PATH, "utf8");
      const template = core.getInput('template');
      const postListMarkdown = postsArray.reduce((acc, cur, index) => {
        if (template === "default") {
          // Default template: - [$title]($url)
          return acc + `\n- [${cur.title}](${cur.url})` + (((index + 1) === postsArray.length) ? '\n' : '');
        } else {
          // Building with custom template
          return acc + template
            .replace(/\$title/g, cur.title)
            .replace(/\$url/g, cur.url)
            .replace(/\$newline/g, "\n");
        }
      }, '');
      const newReadme = buildReadme(readmeData, postListMarkdown);
      // if there's change in readme file update it
      if (newReadme !== readmeData) {
        core.info('Writing to ' + README_FILE_PATH);
        fs.writeFileSync(README_FILE_PATH, newReadme);
        if (!process.env.TEST_MODE) {
          // noinspection JSIgnoredPromiseFromCall
          commitReadme();
        }
      } else {
        core.info('No change detected, skipping');
        process.exit(0);
      }
    } catch (e) {
      core.error(e);
      process.exit(1);
    }
  } else {
    core.info("0 blog posts fetched");
    process.exit(jobFailFlag ? 1 : 0);
  }
});
