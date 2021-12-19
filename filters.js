const {updateAndParseCompoundParams} = require('./utils');
const core = require('@actions/core');

const FILTER_PARAMS = {
  stackoverflow: 'Comment by $author',
  stackexchange: 'Comment by $author',
};

const COMMENT_FILTERS = core
  .getInput('filter_comments')
  .trim()
  .split(',')
  .map((item) => {
    item = item.trim();
    if (item.startsWith('stackoverflow') || item.startsWith('stackexchange')) {
      return updateAndParseCompoundParams(item, FILTER_PARAMS);
    } else {
      return item;
    }
  });
// filters out every medium comment (PR #4)
const ignoreMediumComments = (item) => !(COMMENT_FILTERS.indexOf('medium') !== -1 &&
  item.link && item.link.includes('medium.com') &&
  item.categories === undefined);

// filters out stackOverflow comments (#16)
const ignoreStackOverflowComments = (item) => !(COMMENT_FILTERS.indexOf('stackoverflow') !== -1 &&
  item.link && item.link.includes('stackoverflow.com') &&
  item.title.startsWith(FILTER_PARAMS.stackoverflow.replace(/\$author/g, item.author)));

// filters out stackExchange comments (#16)
const ignoreStackExchangeComments = (item) => !(COMMENT_FILTERS.indexOf('stackexchange') !== -1 &&
  item.link && item.link.includes('stackexchange.com') &&
  item.title.startsWith(FILTER_PARAMS.stackexchange.replace(/\$author/g, item.author)));

module.exports = {
  ignoreMediumComments,
  ignoreStackOverflowComments,
  ignoreStackExchangeComments
};
