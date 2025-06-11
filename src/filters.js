const { updateAndParseCompoundParams } = require('./utils');
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
		if (item.trim().startsWith('stackoverflow') || item.startsWith('stackexchange')) {
			return updateAndParseCompoundParams(item, FILTER_PARAMS);
		}
		return item.trim();
	});

const parseUrlAndCheckItem = (item, domain) => {
	try {
		return new URL(item.link).host === domain;
	} catch (e) {
		return false;
	}
};

// filters out stackOverflow comments (#16)
const ignoreStackOverflowComments = (item) =>
	!(
		COMMENT_FILTERS.indexOf('stackoverflow') !== -1 &&
		item.link &&
		parseUrlAndCheckItem(item, 'stackoverflow.com') &&
		item.title.startsWith(FILTER_PARAMS.stackoverflow.replace(/\$author/g, item.author))
	);

// filters out stackExchange comments (#16)
const ignoreStackExchangeComments = (item) =>
	!(
		COMMENT_FILTERS.indexOf('stackexchange') !== -1 &&
		item.link &&
		parseUrlAndCheckItem(item, 'stackexchange.com') &&
		item.title.startsWith(FILTER_PARAMS.stackexchange.replace(/\$author/g, item.author))
	);

const dateFilter = (item) => {
	if (!item.pubDate) {
		return true;
	}
	const today = new Date();
	const itemDate = new Date(item.pubDate.trim());
	const dateFilter = core.getInput('filter_dates').trim();

	if (dateFilter.indexOf('daysAgo') !== -1) {
		// Filters out posts that are older than n days
		const filterParam = {
			daysAgo: '',
		};
		updateAndParseCompoundParams(dateFilter, filterParam);
		const dayInMilliSeconds = 24 * 60 * 60 * 1000;
		const daysAgo = Number(filterParam.daysAgo);
		const dateObj = new Date(Date.now() - dayInMilliSeconds * daysAgo);
		return itemDate >= dateObj;
	}
	if (dateFilter.indexOf('currentMonth') !== -1) {
		// Filters out current month's posts
		return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
	}
	if (dateFilter.indexOf('currentYear') !== -1) {
		// Filters out current year's posts
		return itemDate.getFullYear() === today.getFullYear();
	}
	return true;
};
module.exports = {
	ignoreStackOverflowComments,
	ignoreStackExchangeComments,
	dateFilter,
};
