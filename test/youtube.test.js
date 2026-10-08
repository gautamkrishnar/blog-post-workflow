import assert from 'node:assert';
import { fetchYoutubeFeed, getYoutubePlaylistId } from '../src/youtube.js';

const apiItem = (videoId, videoPublishedAt) => ({
	snippet: {
		title: `Video ${videoId}`,
		description: `About ${videoId}`,
		videoOwnerChannelId: 'UCtvnB6R__6vdyjUEbDgAWHw',
		videoOwnerChannelTitle: 'Channel',
	},
	contentDetails: { videoId, videoPublishedAt },
});

// Replaces fetch with a stub that returns the given pages in order and records each request
const stubFetch = (pages) => {
	const requests = [];
	globalThis.fetch = async (url, options) => {
		requests.push({ url: new URL(url), headers: options.headers });
		const page = pages[requests.length - 1];
		return {
			ok: page.status === undefined,
			status: page.status,
			json: async () => page,
		};
	};
	return requests;
};

// Skip on dist tests because the bundle does not export this function
if (process.env.DIST !== 'true') {
	describe('getYoutubePlaylistId', () => {
		it('should map a channel feed to the channel uploads playlist', () => {
			assert.strictEqual(
				getYoutubePlaylistId(
					'https://www.youtube.com/feeds/videos.xml?channel_id=UCtvnB6R__6vdyjUEbDgAWHw',
				),
				'UUtvnB6R__6vdyjUEbDgAWHw',
			);
		});

		it('should return the playlist id of a playlist feed', () => {
			assert.strictEqual(
				getYoutubePlaylistId(
					'https://www.youtube.com/feeds/videos.xml?playlist_id=PLJNqgDLpd5E69Kc664st4j7727sbzyx0X',
				),
				'PLJNqgDLpd5E69Kc664st4j7727sbzyx0X',
			);
		});

		it('should return null for feeds that are not YouTube feeds', () => {
			assert.strictEqual(getYoutubePlaylistId('http://localhost:8080'), null);
			assert.strictEqual(
				getYoutubePlaylistId('https://dev.to/feed/gautamkrishnar'),
				null,
			);
			assert.strictEqual(
				getYoutubePlaylistId(
					'https://notyoutube.com/feeds/videos.xml?channel_id=UC1',
				),
				null,
			);
		});

		it('should return null for user feeds and malformed urls', () => {
			assert.strictEqual(
				getYoutubePlaylistId(
					'https://www.youtube.com/feeds/videos.xml?user=someone',
				),
				null,
			);
			assert.strictEqual(getYoutubePlaylistId('not a url'), null);
		});
	});

	describe('fetchYoutubeFeed', () => {
		const realFetch = globalThis.fetch;
		afterEach(() => {
			globalThis.fetch = realFetch;
		});

		it('should map items like rss-parser and skip private videos', async () => {
			const requests = stubFetch([
				{
					items: [
						apiItem('abc', '2026-10-01T10:00:00Z'),
						apiItem('private', undefined),
					],
				},
			]);
			const feed = await fetchYoutubeFeed(
				'UUx',
				'KEY',
				{ videoId: 'yt:videoId' },
				5,
			);
			assert.deepStrictEqual(feed.items, [
				{
					title: 'Video abc',
					link: 'https://www.youtube.com/watch?v=abc',
					pubDate: '2026-10-01T10:00:00Z',
					isoDate: '2026-10-01T10:00:00Z',
					content: 'About abc',
					contentSnippet: 'About abc',
					author: 'Channel',
					videoId: 'abc',
				},
			]);
			assert.strictEqual(requests[0].headers['X-Goog-Api-Key'], 'KEY');
			assert.strictEqual(requests[0].url.searchParams.get('key'), null);
		});

		it('should request more pages until there are enough items', async () => {
			const page = (prefix, nextPageToken) => ({
				items: Array.from({ length: 50 }, (_, i) =>
					apiItem(`${prefix}${i}`, '2026-10-01T10:00:00Z'),
				),
				nextPageToken,
			});
			const requests = stubFetch([page('a', 'P2'), page('b', 'P3'), page('c')]);
			const feed = await fetchYoutubeFeed('UUx', 'KEY', {}, 60);
			assert.strictEqual(feed.items.length, 100);
			assert.strictEqual(requests.length, 2);
			assert.strictEqual(requests[1].url.searchParams.get('pageToken'), 'P2');
		});

		it('should stop when the playlist has no more pages', async () => {
			const requests = stubFetch([
				{ items: [apiItem('only', '2026-10-01T10:00:00Z')] },
			]);
			const feed = await fetchYoutubeFeed('UUx', 'KEY', {}, 60);
			assert.strictEqual(feed.items.length, 1);
			assert.strictEqual(requests.length, 1);
		});

		it('should reject when the API returns an error', async () => {
			stubFetch([{ status: 403 }]);
			await assert.rejects(
				fetchYoutubeFeed('UUx', 'KEY', {}, 5),
				/YouTube Data API returned 403 for playlist UUx/,
			);
		});
	});
}
