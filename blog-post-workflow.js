const process = require('process');
let Parser = require('rss-parser');
const core = require('@actions/core');
const fs = require('fs');
const {spawn} = require('child_process');

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
    newContent,
    previousContent.slice(startOfClosingTagIndex),
  ].join('');
};

/**
 * Code to do git commit
 * @return {Promise<void>}
 */
const commitReadme = async () => {
  const exec = (cmd, args = []) => new Promise((resolve, reject) => {
    console.log(`Started: ${cmd} ${args.join(' ')}`);
    const app = spawn(cmd, args, {stdio: ['inherit', 'inherit', 'inherit']});
    app.on('close', (code) => {
      if (code !== 0) {
        const err = new Error(`Invalid status code: ${code}`);
        err.code = code;
        return reject(err);
      }
      return resolve(code);
    });
    app.on('error', reject);
  });
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

let parser = new Parser();
// Total no of posts to display on readme, all sources combined, default: 5
const TOTAL_POST_COUNT = Number.parseInt(core.getInput('max_post_count'));
// Readme path, default: ./README.md
const README_FILE_PATH = core.getInput('readme_path');
const GITHUB_TOKEN = core.getInput('gh_token');
core.setSecret(GITHUB_TOKEN);

const promiseArray = []; // Runner
const runnerNameArray = []; // To show the error/success message
let postsArray = []; // Array to store posts
let jobFailFlag = false; // Job status flag

const feedObjString = core.getInput('feed_list').trim();

// Reading feed list from the workflow input
let feedList = feedObjString.split(',').map(item=>item.trim());
if (feedList.length === 0) {
  core.error("Please double check the value of feed_list");
  process.exit(1);
}

// filters out every medium comment (PR #4)
const ignoreMediumComments = (item) => !(item.link.includes('medium.com') && item.categories === undefined);

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
  }
});
