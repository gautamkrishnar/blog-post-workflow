const process = require('process');
let Parser = require('rss-parser');
const core = require('@actions/core');
const fs = require('fs');
const dateFormat = require('dateformat');
const rand = require('random-seed');
const promiseRetry = require('promise-retry');
const keepaliveWorkflow = require('keepalive-workflow');
const {
  updateAndParseCompoundParams,
  commitReadme,
  truncateString,
  buildReadme,
  exec,
  getParameterisedTemplate,
  escapeHTML,
  categoriesToArray
} = require('./utils');
const {
  ignoreStackExchangeComments,
  ignoreMediumComments,
  ignoreStackOverflowComments,
  dateFilter
} = require('./filters');
const path = require('path');

// Blog workflow code
const userAgent = core.getInput('user_agent');
const acceptHeader = core.getInput('accept_header');

// Total no of posts to display on readme, all sources combined, default: 5
const TOTAL_POST_COUNT = Number.parseInt(core.getInput('max_post_count'));

// Disables sort
const ENABLE_SORT = core.getInput('disable_sort') === 'false';

// Disables validation checks
const ENABLE_VALIDATION = core.getInput('disable_item_validation') === 'false';

// Title trimming parameter, default: ""
const TITLE_MAX_LENGTH = core.getInput('title_max_length') ?
  Number.parseInt(core.getInput('title_max_length')) : null;

// Description trimming parameter, default: ""
const DESCRIPTION_MAX_LENGTH = core.getInput('description_max_length') ?
  Number.parseInt(core.getInput('description_max_length')) : null;

// Advanced content modification parameter, default: ""
const ITEM_EXEC = core.getInput('item_exec');

// Readme path, default: ./README.md
const README_FILE_PATH_LIST = core.getInput('readme_path')
  .split(',')
  .map(item => item.trim());
const GITHUB_TOKEN = core.getInput('gh_token');

// Custom tags
const CUSTOM_TAGS = {};

// Keepalive flag
const ENABLE_KEEPALIVE = core.getInput('enable_keepalive') === 'true';

// Skip commit flag
const SKIP_COMMITS = core.getInput('skip_commit') === 'true';

// Retry configuration
const retryConfig = {
  retries: Number.parseInt(core.getInput('retry_count')),
  factor: 1,
  minTimeout: Number.parseInt(core.getInput('retry_wait_time')) * 1000
};

core.setSecret(GITHUB_TOKEN);

core.getInput('custom_tags')
  .trim()
  .split(',')
  .forEach((item) => {
    item = item.trim();
    updateAndParseCompoundParams(item, CUSTOM_TAGS); // Creates custom tag object
  });

const promiseArray = []; // Runner
const runnerNameArray = []; // To show the error/success message
let postsArray = []; // Array to store posts
let jobFailFlag = false; // Job status flag

const feedObjString = core.getInput('feed_list').trim();

// Reading feed list from the workflow input
let feedList = feedObjString.split(',').map(item => item.trim());
if (feedList.length === 0) {
  core.error('Please double check the value of feed_list');
  process.exit(1);
}

// Grabbing feed names and converting it into array
const feedNames = core.getInput('feed_names').trim();
const feedNamesList = feedNames.split(',').map(item => item.trim());

const customTagArgs = Object.keys(CUSTOM_TAGS).map(
  item => [CUSTOM_TAGS[item], item]);

let parser = new Parser({
  'headers': {
    'User-Agent': userAgent,
    'Accept': acceptHeader
  },
  customFields: {
    item: [...customTagArgs]
  }
});

// Generating promise array
feedList.forEach((siteUrl) => {
  runnerNameArray.push(siteUrl);
  promiseArray.push(new Promise((resolve, reject) => {
    promiseRetry((retry, tryNumber) => {
      // Retry block
      if (tryNumber > 1) {
        core.info(`Previous try for ${siteUrl} failed, retrying: ${tryNumber - 1}`);
      }
      return parser.parseURL(siteUrl)
        .catch(retry);
    }, retryConfig)
      .then((data) => {
        if (!data.items) {
          reject('Cannot read response->item');
        } else {
          const responsePosts = data.items;
          // To handle duplicate filter
          const appendedPostTitles = [];
          const appendedPostDesc = [];
          const posts = responsePosts
            .filter(ignoreMediumComments)
            .filter(ignoreStackOverflowComments)
            .filter(ignoreStackExchangeComments)
            .filter(dateFilter)
            .map((item) => {
              // Validating keys to avoid errors
              if (ENABLE_SORT && ENABLE_VALIDATION && !item.pubDate) {
                reject('Cannot read response->item->pubDate');
              }
              if (ENABLE_VALIDATION && !item.title) {
                reject('Cannot read response->item->title');
              }
              if (ENABLE_VALIDATION && !item.link) {
                reject('Cannot read response->item->link');
              }
              // Custom tags
              let customTags = {};
              Object.keys(CUSTOM_TAGS).forEach((tag) => {
                if (item[tag]) {
                  Object.assign(customTags, {[tag]: item[tag]});
                }
              });
              const categories = item.categories ?  categoriesToArray(item.categories) : [];
              let post = {
                title: item.title.trim(),
                url: item.link.trim(),
                description: item.content ? item.content : '',
                ...customTags,
                categories
              };

              if (ENABLE_SORT) {
                post.date = new Date(item.pubDate.trim());
              }

              if (TITLE_MAX_LENGTH && post && post.title) {
                // Trimming the title
                post.title = truncateString(post.title, TITLE_MAX_LENGTH);
              }

              if (DESCRIPTION_MAX_LENGTH && post && post.description) {
                const trimmedDescription = post.description.trim();
                // Trimming the description
                post.description = truncateString(trimmedDescription, DESCRIPTION_MAX_LENGTH);
              }

              // Advanced content manipulation using javascript code
              if (ITEM_EXEC) {
                try {
                  eval(ITEM_EXEC);
                } catch (e) {
                  core.error('Failure in executing `item_exec` parameter');
                  core.error(e);
                  process.exit(1);
                }
              }
              if (post && core.getInput('remove_duplicates') === 'true') {
                if (
                  appendedPostTitles.indexOf(post.title.trim()) !== -1 ||
                  appendedPostDesc.indexOf(post.description.trim()) !== -1
                ) {
                  post = null;
                } else {
                  if (post.title) {
                    appendedPostTitles.push(post.title.trim());
                  }
                  if (post.description) {
                    appendedPostDesc.push(post.description.trim());
                  }
                }
              }

              // Doing HTML encoding at last ref: #117
              const disableHtmlEncoding = core.getInput('disable_html_encoding') !== 'false';
              if (!disableHtmlEncoding && post) {
                Object.keys(post).forEach((key)=> {
                  if (typeof post[key] === 'string' && key !== 'url') {
                    post[key] = escapeHTML(post[key]);
                  }
                });
              }
              return post;
            });
          resolve(posts);
        }
      }, (err) => {
        reject(err);
      });
  }));
});

const runWorkflow = async () => {
  // Processing the generated promises
  await Promise.allSettled(promiseArray).then((results) => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        // Succeeded
        core.info(runnerNameArray[index] + ' runner succeeded. Post count: ' + result.value.length);
        // Adds feed name to the items
        if (typeof feedNamesList[index] !== undefined && feedNamesList[index]) {
          result.value = result.value.map((item) => {
            item.feedName = feedNamesList[index];
            return item;
          });
        }
        postsArray.push(...result.value);
      } else {
        jobFailFlag = true;
        // Rejected
        core.error(runnerNameArray[index] + ' runner failed, please verify the configuration. Error:');
        if (result.reason && result.reason.message && result.reason.message.startsWith('Status code')) {
          const code = result.reason.message.replace('Status code ', '');
          core.error(`Looks like your website returned ${code}, There is nothing blog post workflow` +
            ` can do to fix it. Please check your website's RSS feed generation source code. Also double check
            the URL.`);
          if (code === `503`) {
            core.error(`If you are using Cloudflare or Akamai,  make sure that you have the user agent ` +
              ` ${userAgent} or GitHub actions IP ranges whitelisted in your firewall.`);
          }
        } else {
          core.error(result.reason || result.reason.message);
        }
      }
    });
  }).finally(async () => {
    // Ignore null items, allows you to ignore items by setting null in post via `item_exec`
    postsArray = postsArray.filter(item => item !== null);

    // Sorting posts based on date
    if (ENABLE_SORT) {
      postsArray.sort(function (a, b) {
        return b.date - a.date;
      });
    }
    // Slicing with the max count
    postsArray = postsArray.slice(0, TOTAL_POST_COUNT);
    if (postsArray.length > 0) {
      try {
        if (!process.env.TEST_MODE) {
          await exec('git', ['config', 'pull.rebase', 'true'], {stdio: ['pipe', 'pipe', 'pipe']});
          // Pulling the latest changes from upstream
          await exec('git', ['pull'], {stdio: ['pipe', 'pipe', 'pipe']});
        }
        const template = core.getInput('template');
        const randEmojiArr = getParameterisedTemplate(template, 'randomEmoji');
        const constEmojiArr = getParameterisedTemplate(template, 'emojiKey');
        const postListMarkdown = postsArray.reduce((acc, cur, index) => {
          if (template === 'default') {
            // Default template: - [$title]($url)
            return acc + `\n- [${cur.title}](${cur.url})` + (((index + 1) === postsArray.length) ? '\n' : '');
          } else {
            // Building categories listing
            const categoryTemplate = core.getInput('categories_template');
            const categoryList = categoryTemplate === 'default' ?
              cur.categories.join(', ') : cur.categories.reduce((prev, current) =>
                prev + categoryTemplate.replace(/\$category\b/g, current.toString()), '');
            // Building with custom template
            const date = dateFormat(cur.date, core.getInput('date_format')); // Formatting date
            let content = template
              .replace(/\$title\b/g, cur.title)
              .replace(/\$url\b/g, cur.url)
              .replace(/\$description\b/g, cur.description)
              .replace(/\$date\b/g, date)
              .replace(/\$counter\b/g, (index + 1).toString())
              .replace(/\$feedName\b/g, cur.feedName ? cur.feedName : '')
              .replace(/\$categories\b/g, categoryList.toString())
              .replace(/\$newline/g, '\n');

            // Setting Custom tags to the template
            Object.keys(CUSTOM_TAGS).forEach((tag) => {
              const replaceValue = cur[tag] ? cur[tag] : '';
              content = content.replace(new RegExp('\\$' + tag + '\\b', 'g'), replaceValue);
            });

            // Emoji implementation: Random
            if (randEmojiArr) {
              // For making randomness unique for each repos
              let seed = (process.env.GITHUB_REPOSITORY && !process.env.TEST_MODE ?
                process.env.GITHUB_REPOSITORY : 'example') + index;
              if (core.getInput('rand_seed')) {
                // If manual seed is provided, use it
                seed = core.getInput('rand_seed') + index;
              }
              const emoji = randEmojiArr[rand.create(seed).range(randEmojiArr.length)];
              content = content.replace(/\$randomEmoji\((\S)*\)/g, emoji);
            }

            // Emoji implementation: Static
            if (constEmojiArr) {
              // using modulus
              content = content.replace(/\$emojiKey\((\S)*\)/g, constEmojiArr[index % constEmojiArr.length]);
            }

            return acc + content;
          }
        }, '');

        // Output only mode
        const outputOnly = core.getInput('output_only') !== 'false';
        if (outputOnly) {
          // Sets output as output as `results` variable in github action
          core.info('outputOnly mode: set `results` variable. Readme not committed.');
          core.setOutput('results', postsArray);
          const outputFilePath = path.join('/','tmp', 'blog_post_workflow_output.json');
          if(fs.existsSync(outputFilePath)) {
            fs.rmSync(outputFilePath);
          }
          fs.writeFileSync(outputFilePath, JSON.stringify(postsArray), { encoding: 'utf-8'});
          process.exit(jobFailFlag ? 1 : 0);
        }

        // Writing to each readme file
        let changedReadmeCount = 0;
        README_FILE_PATH_LIST.forEach((README_FILE_PATH) => {
          const readmeData = fs.readFileSync(README_FILE_PATH, 'utf8');
          const newReadme = buildReadme(readmeData, postListMarkdown);
          // if there's change in readme file update it
          if (newReadme !== readmeData) {
            core.info('Writing to ' + README_FILE_PATH);
            fs.writeFileSync(README_FILE_PATH, newReadme);
            changedReadmeCount = changedReadmeCount + 1;
          }
        });

        if (changedReadmeCount > 0 && !SKIP_COMMITS) {
          if (!process.env.TEST_MODE) {
            // Commit to readme
            await commitReadme(GITHUB_TOKEN, README_FILE_PATH_LIST).then(() => {
              // Making job fail if one of the source fails
              process.exit(jobFailFlag ? 1 : 0);
            });
          }
        } else {
          // Calculating last commit date, please see https://git.io/Jtm4V
          if (!process.env.TEST_MODE && ENABLE_KEEPALIVE) {
            // Do dummy commit if elapsed time is greater than 50 days
            const committerUsername = core.getInput('committer_username');
            const committerEmail = core.getInput('committer_email');
            const message = await keepaliveWorkflow.KeepAliveWorkflow(GITHUB_TOKEN, committerUsername, committerEmail,
              'dummy commit to keep the repository active, see https://git.io/Jtm4V', 50, true);
            core.info(message);
          } else {
            core.info('No change detected, skipping');
          }
          process.exit(jobFailFlag ? 1 : 0);
        }
      } catch (e) {
        core.error(e);
        process.exit(1);
      }
    } else {
      core.info('0 blog posts fetched');
      process.exit(jobFailFlag ? 1 : 0);
    }
  });
};

module.exports = {
  runWorkflow
};

if (!module.parent) {
  runWorkflow().then();
}
