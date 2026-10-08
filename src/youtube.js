// YouTube's public feeds (https://www.youtube.com/feeds/videos.xml) can return 404 for every
// channel and playlist. With a YouTube Data API key, the same videos are read through
// playlistItems.list instead (1 quota unit per feed per run).

const API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

/**
 * Returns the playlist ID a YouTube feed URL points to, or null if it isn't one
 * @param siteUrl {string}
 * @return {string|null}
 */
const getYoutubePlaylistId = (siteUrl) => {
	let url;
	try {
		url = new URL(siteUrl);
	} catch {
		return null;
	}
	const isYoutubeFeed =
		/(^|\.)youtube\.com$/.test(url.hostname) &&
		url.pathname === '/feeds/videos.xml';
	if (!isYoutubeFeed) {
		return null;
	}
	const playlistId = url.searchParams.get('playlist_id');
	if (playlistId) {
		return playlistId;
	}
	const channelId = url.searchParams.get('channel_id');
	if (channelId?.startsWith('UC')) {
		// A channel's uploads playlist is its ID with UC replaced by UU
		return `UU${channelId.slice(2)}`;
	}
	return null;
};

/**
 * Converts a playlistItems.list item to the item shape rss-parser returns
 * @param item {Object}
 * @param customTags {Object} custom tag name -> feed element, e.g. { videoId: 'yt:videoId' }
 * @return {Object}
 */
const toFeedItem = (item, customTags) => {
	const { videoId, videoPublishedAt } = item.contentDetails;
	const feedFields = {
		'yt:videoId': videoId,
		'yt:channelId': item.snippet.videoOwnerChannelId,
	};
	const post = {
		title: item.snippet.title,
		link: `https://www.youtube.com/watch?v=${videoId}`,
		pubDate: videoPublishedAt,
		isoDate: videoPublishedAt,
		content: item.snippet.description,
		contentSnippet: item.snippet.description,
		author: item.snippet.videoOwnerChannelTitle,
	};
	for (const [name, element] of Object.entries(customTags)) {
		if (element in feedFields) {
			post[name] = feedFields[element];
		}
	}
	return post;
};

/**
 * Fetches a YouTube feed through the Data API, in the same shape rss-parser returns.
 * Pages are requested until there are maxItems items or the playlist ends.
 * @param playlistId {string}
 * @param apiKey {string}
 * @param customTags {Object} custom tag name -> feed element, e.g. { videoId: 'yt:videoId' }
 * @param maxItems {number}
 * @return {Promise<{items: Object[]}>}
 */
const fetchYoutubeFeed = async (playlistId, apiKey, customTags, maxItems) => {
	const items = [];
	let pageToken;
	do {
		const query = new URLSearchParams({
			part: 'snippet,contentDetails',
			maxResults: '50',
			playlistId,
		});
		if (pageToken) {
			query.set('pageToken', pageToken);
		}
		// The key goes in a header so it never shows up in logged URLs
		const response = await fetch(`${API_URL}?${query}`, {
			headers: { 'X-Goog-Api-Key': apiKey },
		});
		if (!response.ok) {
			throw new Error(
				`YouTube Data API returned ${response.status} for playlist ${playlistId}`,
			);
		}
		const data = await response.json();
		items.push(
			...(data.items || [])
				// Private and deleted videos stay in playlists without a publish date
				.filter((item) => item.contentDetails?.videoPublishedAt)
				.map((item) => toFeedItem(item, customTags)),
		);
		pageToken = data.nextPageToken;
	} while (pageToken && items.length < maxItems);
	return { items };
};

export { fetchYoutubeFeed, getYoutubePlaylistId };
