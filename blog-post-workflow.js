const process = require('process');
let Parser = require('rss-parser');
const core = require('@actions/core');
const _ = require('lodash');
let parser = new Parser();

// Total no of posts to display on readme, all sources combined, default: 5
const TOTAL_POST_COUNT = Number.parseInt(core.getInput('MAX_POST_COUNT'));
// Readme path, default: ./README.md
const README_FILE_PATH = core.getInput('README_PATH');

let POST_COUNT = 0; // Post counter
const promiseArray = []; // Runner
const runnerNameArray = []; // To show the error/success message
let postsArray = []; // Array to store posts

if(process.env.TEST) {
    const data = [
        {'url': 'https://gautamkrishnar.com/feed', 'itemsObj': 'items', 'dateObj': 'isoDate'},
        {'url': 'https://dev.to/feed/gautamkrishnar', 'itemsObj': 'items', 'dateObj': 'isoDate'}
    ];
    process.env.INPUT_MAX_POST_COUNT="5";
    process.env.INPUT_FEED_OBJECT=JSON.stringify(data);
    process.env.INPUT_README_PATH="./tests/README.md";
}

const feedObjString = core.getInput('FEED_OBJECT').trim();
let feedList = [];

// Reading feed list from the workflow input
if (!feedObjString || feedObjString === '[]') {
    core.setFailed('FEED_OBJECT key not set correctly');
    process.exit(1);
} else {
    try {
        feedList = JSON.parse(feedObjString);
    } catch (e) {
        core.setFailed('Unable to parse FEED_OBJECT key. Please double check its value. Value:' + feedObjString);
        process.exit(1);
    }
}

feedList.forEach((feedMeta)=> {
    const siteUrl = _.get(feedMeta,'url');
    if (siteUrl) {
        promiseArray.push(new Promise((resolve, reject) => {
            parser.parseURL(siteUrl).then((data) => {
                const itemsKey = feedMeta.itemsObj ? feedMeta.itemsObj : 'items';
                const dateKey = feedMeta.dateObj ? feedMeta.dateObj : 'isoDate';
                const responsePosts = _.get(data, itemsKey);
                if (responsePosts === undefined) {
                    reject("Cannot read response->" + itemsKey);
                } else {
                    const posts = responsePosts.map((item) => {
                        if (item[dateKey] === undefined) {
                            reject("Cannot read response->" + itemsKey + "->" + dateKey)
                        }
                        return {
                            title: item.title,
                            url: item.link,
                            date: new Date(item[dateKey])
                        };
                    });
                    resolve(posts);
                }
            }).catch((e) => {
                reject(e);
            });
        }));
        runnerNameArray.push(siteUrl);
    }
});

Promise.allSettled(promiseArray).then((results) => {
    let jobFailFlag = false;
    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            // Succeeded
            core.info(runnerNameArray[index] + ' runner succeeded. Post count: ' + result.value.length);
            postsArray = [...postsArray, ...result.value]
        } else {
            jobFailFlag = true;
            // Rejected
            core.error(runnerNameArray[index] + ' runner failed, please verify the configuration. Error:');
            core.error(result.reason);
        }
    });
    // Sorting posts based on date
    postsArray.sort(function(a,b){
        return b.date - a.date;
    });

    // Slicing with the max count
    postsArray = postsArray.slice(0, TOTAL_POST_COUNT);
    if (postsArray.length > 0) {
        console.log('Writing data to: ' + README_FILE_PATH);

    }
    // Making job fail if one of the source fails
    jobFailFlag ? process.exit(1) : process.exit(0);
});
