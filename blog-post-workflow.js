const process = require('process');
let Parser = require('rss-parser');
const core = require('@actions/core');
const fs = require('fs');
const dateFormat = require('dateformat');
const exec = require('./exec');
const rand = require('random-seed');

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
 * Code to do git commit
 * @param emptyCommit: sets whether to do an empty commit or not
 * @return {Promise<void>}
 */
const commitReadme = async (emptyCommit = false) => {
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
  if (emptyCommit) {
    await exec('git',['commit', '--allow-empty', '-m', '"dummy commit to keep the repository ' +
    'active, see https://git.io/Jtm4V"']);
  } else {
    await exec('git', ['add', README_FILE_PATH]);
    await exec('git', ['commit', '-m', commitMessage]);
  }
  await exec('git', ['push']);
  core.info('Readme updated successfully in the upstream repository');
  // Making job fail if one of the source fails
  process.exit(jobFailFlag ? 1 : 0);
};

// Blog workflow code
const userAgent = core.getInput('user_agent');
const acceptHeader = core.getInput('accept_header');

// Total no of posts to display on readme, all sources combined, default: 5
const TOTAL_POST_COUNT = Number.parseInt(core.getInput('max_post_count'));

// Disables sort
const ENABLE_SORT = core.getInput('disable_sort') === 'false';

// Title trimming parameter, default: ""
const TITLE_MAX_LENGTH = core.getInput('title_max_length') ?
  Number.parseInt(core.getInput('title_max_length')) : null;

// Description trimming parameter, default: ""
const DESCRIPTION_MAX_LENGTH = core.getInput('description_max_length') ?
  Number.parseInt(core.getInput('description_max_length')) : null;

// Advanced content modification parameter, default: ""
const ITEM_EXEC = core.getInput('item_exec');

// Readme path, default: ./README.md
const README_FILE_PATH = core.getInput('readme_path');
const GITHUB_TOKEN = core.getInput('gh_token');

// Filter parameters
const FILTER_PARAMS = {
  stackoverflow: 'Comment by $author',
  stackexchange: 'Comment by $author',
};
// Custom tags
const CUSTOM_TAGS = {};

// Keepalive flag
const ENABLE_KEEPALIVE = core.getInput('enable_keepalive') === 'true';

/**
 * Compound parameter parser, Updates obj with compound parameters and returns item name
 * @param sourceWithParam filter source with compound param eg: stackoverflow/Comment by $author/
 * @param obj object to update
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
    return template.slice(startIndex, endIndex).split(',').map(item=>item.trim());
  } else {
    return null;
  }
};

core.setSecret(GITHUB_TOKEN);
const COMMENT_FILTERS = core
  .getInput('filter_comments')
  .trim()
  .split(',')
  .map((item)=>{
    item = item.trim();
    if (item.startsWith('stackoverflow') || item.startsWith('stackexchange')) {
      return updateAndParseCompoundParams(item, FILTER_PARAMS);
    } else {
      return item;
    }
  });

core.getInput('custom_tags')
  .trim()
  .split(',')
  .forEach((item)=> {
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

// filters out every medium comment (PR #4)
const ignoreMediumComments = (item) => !(COMMENT_FILTERS.indexOf('medium') !== -1 &&
  item.link && item.link.includes('medium.com') &&
  item.categories === undefined);

// filters out stackOverflow comments (#16)
const ignoreStackOverflowComments = (item) => !(COMMENT_FILTERS.indexOf('stackoverflow') !== -1 &&
  item.link && item.link.includes('stackoverflow.com') &&
  item.title.startsWith(FILTER_PARAMS.stackoverflow.replace(/\$author/g, item.author)));

// filters out stackOverflow comments (#16)
const ignoreStackExchangeComments = (item) => !(COMMENT_FILTERS.indexOf('stackexchange') !== -1 &&
  item.link && item.link.includes('stackexchange.com') &&
  item.title.startsWith(FILTER_PARAMS.stackexchange.replace(/\$author/g, item.author)));

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

feedList.forEach((siteUrl) => {
  runnerNameArray.push(siteUrl);
  promiseArray.push(new Promise((resolve, reject) => {
    parser.parseURL(siteUrl).then((data) => {
      if (!data.items) {
        reject('Cannot read response->item');
      } else {
        const responsePosts = data.items;
        const posts = responsePosts
          .filter(ignoreMediumComments)
          .filter(ignoreStackOverflowComments)
          .filter(ignoreStackExchangeComments)
          .map((item) => {
            // Validating keys to avoid errors
            if (ENABLE_SORT && !item.pubDate) {
              reject('Cannot read response->item->pubDate');
            }
            if (!item.title) {
              reject('Cannot read response->item->title');
            }
            if (!item.link) {
              reject('Cannot read response->item->link');
            }
            // Custom tags
            let customTags = {};
            Object.keys(CUSTOM_TAGS).forEach((tag)=> {
              if (item[tag]) {
                Object.assign(customTags, {[tag]: item[tag]});
              }
            });
            let post = {
              title: item.title.trim(),
              url: item.link.trim(),
              description: item.content ? item.content : '',
              ...customTags
            };

            if (ENABLE_SORT) {
              post.date = new Date(item.pubDate.trim());
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

            if (TITLE_MAX_LENGTH && post && post.title) {
              // Trimming the title
              post.title = post.title.trim().slice(0, TITLE_MAX_LENGTH) === post.title.trim() ?
                post.title.trim() : post.title.trim().slice(0, TITLE_MAX_LENGTH).trim() + '...';
            }

            if (DESCRIPTION_MAX_LENGTH && post && post.description) {
              // Trimming the description
              post.description = post.description.trim().slice(0, DESCRIPTION_MAX_LENGTH) === post.description.trim() ?
                post.description.trim() : post.description.trim().slice(0, DESCRIPTION_MAX_LENGTH).trim() + '...';
            }

            return post;
          });
        resolve(posts);
      }
    }).catch(reject);
  }));
});

// Processing the generated promises
Promise.allSettled(promiseArray).then((results) => {
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
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
        await exec('git', ['config','pull.rebase', 'true'], {stdio: ['pipe', 'pipe', 'pipe']});
        // Pulling the latest changes from upstream
        await exec('git',['pull'], {stdio: ['pipe', 'pipe', 'pipe']});
      }
      const readmeData = fs.readFileSync(README_FILE_PATH, 'utf8');
      const template = core.getInput('template');
      const randEmojiArr = getParameterisedTemplate(template, 'randomEmoji');
      const constEmojiArr = getParameterisedTemplate(template, 'emojiKey');
      const postListMarkdown = postsArray.reduce((acc, cur, index) => {
        if (template === 'default') {
          // Default template: - [$title]($url)
          return acc + `\n- [${cur.title}](${cur.url})` + (((index + 1) === postsArray.length) ? '\n' : '');
        } else {
          // Building with custom template
          const date = dateFormat(cur.date, core.getInput('date_format')); // Formatting date
          let content = template
            .replace(/\$title\b/g, cur.title)
            .replace(/\$url\b/g, cur.url)
            .replace(/\$description\b/g, cur.description)
            .replace(/\$date\b/g, date)
            .replace(/\$newline/g, '\n');

          // Setting Custom tags to the template
          Object.keys(CUSTOM_TAGS).forEach((tag)=> {
            const replaceValue = cur[tag] ? cur[tag] : '';
            content = content.replace(new  RegExp('\\$' + tag + '\\b', 'g'), replaceValue);
          });

          // Emoji implementation: Random
          if (randEmojiArr) {
            // For making randomness unique for each repos
            const seed = (process.env.GITHUB_REPOSITORY && !process.env.TEST_MODE ?
              process.env.GITHUB_REPOSITORY : 'example') + index;
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

      const outputOnly = core.getInput('output_only') !== 'false';
      const newReadme = !outputOnly ? buildReadme(readmeData, postListMarkdown) : null;
      // if there's change in readme file update it
      if (newReadme !== readmeData) {
        core.info('Writing to ' + README_FILE_PATH);
        fs.writeFileSync(README_FILE_PATH, newReadme);

        if (!process.env.TEST_MODE) {
          if (!outputOnly) {
            // Commit to readme
            await commitReadme();
          } else {
            // Sets output as output as `results` variable in github action
            core.info('outputOnly mode: set `results` variable. Readme not committed.');
            core.setOutput('results', postsArray);
          }
        }
      } else {
        // Calculating last commit date, please see https://git.io/Jtm4V
        const {outputData} = await exec('git',['--no-pager', 'log', '-1', '--format=%ct'],
          { encoding : 'utf8', stdio: ['pipe', 'pipe', 'pipe']});

        const commitDate = new Date(parseInt(outputData, 10) * 1000);
        const diffInDays = Math.round((new Date() - commitDate)/(1000*60*60*24));

        if (diffInDays > 50 && !process.env.TEST_MODE && ENABLE_KEEPALIVE) {
          // Do dummy commit if elapsed time is greater than 50 days
          core.info('Doing dummy commit to keep workflow active, see: https://git.io/Jtm4V');
          await commitReadme(true);
          process.exit(0);
        } else {
          core.info('No change detected, skipping');
          process.exit(0);
        }
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
