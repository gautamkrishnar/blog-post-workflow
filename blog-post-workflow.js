const process = require('process');
let Parser = require('rss-parser');
const core = require('@actions/core');
const _ = require('lodash');
const fs = require('fs');
const { spawn } = require('child_process');

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
        return previousContent
    }
    return [
        previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
        '\n',
        newContent,
        '\n',
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
        const app = spawn(cmd, args, {stdio: 'inherit'});
        app.on('close', (code) => {
            if (code !== 0) {
                err = new Error(`Invalid status code: ${code}`);
                err.code = code;
                return reject(err);
            }
            return resolve(code);
        });
        app.on('error', reject);
    });

    // Doing commit and push
    await exec('git', [
        'config',
        '--global',
        'user.email',
        'blog-post-bot@example.com',
    ]);
    if (GITHUB_TOKEN) {
        // git remote set-url origin
        await exec('git', ['remote', 'set-url', 'origin', `https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`]);
    }
    await exec('git', ['config', '--global', 'user.name', 'blog-post-bot']);
    await exec('git', ['add', README_FILE_PATH]);
    await exec('git', ['commit', '-m', 'Updated with latest blog posts']);
    await exec('git', ['push']);
    core.info("Readme updated successfully in the upstream repository");
    // Making job fail if one of the source fails
    jobFailFlag ? process.exit(1) : process.exit(0);
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
let feedList = feedObjString.split(',');
if (feedList.length === 0) {
    core.error("Please double check the value of feed_list");
    process.exit(1);
}

feedList.forEach((siteUrl) => {
    runnerNameArray.push(siteUrl);
    promiseArray.push(new Promise((resolve, reject) => {
        parser.parseURL(siteUrl).then((data) => {
            const responsePosts = _.get(data, 'items');
            if (responsePosts === undefined) {
                reject("Cannot read response->item");
            } else {
                const posts = responsePosts.map((item) => {
                    // Validating keys to avoid errors
                    if (item['pubDate'] === undefined) {
                        reject("Cannot read response->item->pubDate");
                    }
                    if (item['title'] === undefined) {
                        reject("Cannot read response->item->title");
                    }
                    if (item['link'] === undefined) {
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
    postsArray.sort(function (a, b) {
        return b.date - a.date;
    });
    // Slicing with the max count
    postsArray = postsArray.slice(0, TOTAL_POST_COUNT);
    if (postsArray.length > 0) {
        try {
            const readmeData = fs.readFileSync(README_FILE_PATH, "utf8");

            const postListMarkdown = postsArray.reduce((acc, cur, index) => {
                return acc + `- [${cur.title}](${cur.url})` + ((index === (postsArray.length - 1)) ? '' : '\n');
            }, '');
            const newReadme = buildReadme(readmeData, postListMarkdown);
            // if there's change in readme file update it
            if (newReadme !== readmeData) {
                core.info('Writing to ' + README_FILE_PATH);
                fs.writeFileSync(README_FILE_PATH, newReadme);
                if (!process.env.TEST_MODE) {
                    commitReadme();
                }
            } else {
                core.info('No change detected, skipping');
                process.exit(0)
            }
        } catch (e) {
            core.error(e);
            process.exit(1);
        }
    }
});
