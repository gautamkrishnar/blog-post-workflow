const DEFAULT_TEST_ENV = {
  INPUT_MAX_POST_COUNT: '10',
  INPUT_FEED_LIST: 'http://localhost:8080',
  INPUT_DISABLE_SORT: 'false',
  INPUT_TEMPLATE: 'default',
  INPUT_FILTER_COMMENTS: 'medium,stackoverflow/Comment by $author/,stackexchange/Comment by $author/',
  INPUT_USER_AGENT: 'rss-parser',
  INPUT_ACCEPT_HEADER: 'application/rss+xml',
  INPUT_GH_TOKEN: 'secret-test',
  INPUT_DATE_FORMAT: 'UTC:ddd mmm dd yyyy h:MM TT',
  INPUT_CUSTOM_TAGS: '',
  INPUT_TITLE_MAX_LENGTH: '',
  INPUT_DESCRIPTION_MAX_LENGTH: '',
  INPUT_ITEM_EXEC: '',
  INPUT_OUTPUT_ONLY: 'false',
  INPUT_ENABLE_KEEPALIVE: 'true',
  INPUT_TAG_POST_PRE_NEWLINE: 'false',
  INPUT_RETRY_COUNT: '0',
  INPUT_RETRY_WAIT_TIME: '1',
  INPUT_FEED_NAMES: '',
  INPUT_DISABLE_HTML_ENCODING: 'false',
  TEST_MODE: 'true',
  INPUT_CATEGORIES_TEMPLATE: 'default',
  INPUT_DISABLE_ITEM_VALIDATION: 'false',
  INPUT_FILTER_DATES: '',
  INPUT_RAND_SEED: '',
  INPUT_REMOVE_DUPLICATES: 'false',
  INPUT_SKIP_COMMIT: 'false'
};


module.exports = {
  DEFAULT_TEST_ENV
};
