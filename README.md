# Blog post workflow  [![Build and test](https://github.com/gautamkrishnar/blog-post-workflow/workflows/Build%20and%20test/badge.svg?branch=master)](https://github.com/gautamkrishnar/blog-post-workflow/actions?query=workflow%3A%22Build+and+test%22)

![preview](https://user-images.githubusercontent.com/8397274/88047382-29b8b280-cb6f-11ea-9efb-2af2b10f3e0c.png)


### How to use
- Star this repo 😉 
- Go to your repository
- Add the following section to your **README.md** file, you can give whatever title you want. Just make sure that you use `<!-- BLOG-POST-LIST:START --><!-- BLOG-POST-LIST:END -->` in your readme. The workflow will replace this comment with the actual blog post list: 
```markdown
# Blog posts
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->
```
- Create a folder named `.github` and create a `workflows` folder inside it if it doesn't exist.
- Create a new file named `blog-post-workflow.yml` with the following contents inside the workflows folder:
```yaml
name: Latest blog post workflow
on:
  schedule: # Run workflow automatically
    - cron: '0 * * * *' # Runs every hour, on the hour
  workflow_dispatch: # Run workflow manually (without waiting for the cron to be called), through the Github Actions Workflow page directly
jobs:
  update-readme-with-blog:
    name: Update this repo's README with latest blog posts
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: gautamkrishnar/blog-post-workflow@master
        with:
          feed_list: "https://dev.to/feed/gautamkrishnar,https://www.gautamkrishnar.com/feed/"
```
- Replace the above url list with your own rss feed urls. See [popular-sources](#popular-sources) for a list of common RSS feed urls.
- Commit and wait for it to run automatically or you can also trigger it manually to see the result instantly. To trigger the workflow manually, please follow the steps in the [video](https://www.youtube.com/watch?v=ECuqb5Tv9qI&t=272s).

### Options
This workflow has additional options that you can use to customize it for your use case. The following are the list of options available:

| Option | Default Value | Description | Required |
|--------|--------|--------|--------|
| `feed_list` | `""` | Comma-separated list of RSS feed urls, eg: `https://example1.com,https://example2.com` | Yes |
| `max_post_count` | `5` | Maximum number of posts you want to show on your readme, all feeds combined | No  |
| `readme_path` | `./README.md` | Path of the readme file you want to update | No |
| `gh_token` | your GitHub token with repo scope | Use this to configure the token of the user that commits the workflow result to GitHub | No |
| `comment_tag_name` | `BLOG-POST-LIST` | Allows you to override the default comment tag name (`<!-- BLOG-POST-LIST:START --><!-- BLOG-POST-LIST:END -->`), if you want to show multiple instances of the action on the same repo, see advanced usage for more info | No | 
| `disable_sort` | `false` | Disables the sorting of the list based on publish date | No |
| `template` | `default` | Allows you to change the structure of the posts list by using different variables. By default this workflow uses markdown list format to render the posts, you can override this behavior using this option. Eg: `[$title]($url) ` will give you a space-separated list of posts.<br/><br/>**Supported variables** <ul><li>`$title`: Title of the post</li><li>`$url`: URL of the post</li><li>`$description`: Description of the post</li><li>`$newline`: Inserts a newline</li><li>`$date`: Inserts the post date based on the `date_format` specified</li><li>`$randomEmoji`: Allow you to use random emojis in the post, pass emojis as the parameter to chose one of it randomly in each post item. Eg: `$randomEmoji(💯,🔥,💫,🚀,🌮)`. See the [issue comment](https://github.com/gautamkrishnar/blog-post-workflow/issues/29#issuecomment-699622596) for more details</li><li>`$emojiKey`: You can use this argument to show emojis on each of your post item sequentially in the order you specify. Example: `$emojiKey(💯,🔥,💫)`. See the [issue comment](https://github.com/gautamkrishnar/blog-post-workflow/issues/29#issuecomment-699622596) for more details</li></ul> | No |
| `date_format` | `UTC:ddd mmm dd yyyy h:MM TT` | Allows you to change the format of the date or time displayed when using the $date in the template option. This uses NPM dateformat library, please read the library [documentation](https://www.npmjs.com/package/dateformat#named-formats) for the supported formats | No |
| `user_agent` | `rss-parser` | Allows you to customize the user agent used by the RSS feed crawler | No |
| `accept_header` | `application/rss+xml` | Allows you to customize the accept header of the http requests | No |
| `tag_post_pre_newline` | `true` if you are not using **template** option | Allows you to insert a newline before the closing tag and after the opening tag when using the template option if needed, for better formatting | No |
| `filter_comments` | `medium,stackoverflow/Comment by $author/,stackexchange/Comment by $author/` | Comma separated list of platforms you want to enable the comment filter.<br/><br/>**Available filters**<ul><li>`medium`: Allows you to filter out the Medium comments. Known issue: [#37](https://github.com/gautamkrishnar/blog-post-workflow/issues/37)</li><li>`stackoverflow/Comment by $author/`: Allows you to filter out the StackOverflow comments. Argument to this filter is optional, it defaults to 'Comment by $author'. If you use any language other than English on StackOverflow, you can use this argument to customize it. See [#16](https://github.com/gautamkrishnar/blog-post-workflow/issues/16) for more info.</li><li>`stackexchange/Comment by $author/`: Allows you to filter out the StackExchange comments. Argument to this filter follows the same format as `stackoverflow` filter's argument.</li></ul> | No |
| `custom_tags` | `""` | Allows you to use the custom tags from your feed items in your template. Format: `variableName/tagName/,variableName/tagName/`. Please see the [issue comment](https://github.com/gautamkrishnar/blog-post-workflow/issues/28#issuecomment-696024087) for more details | No |
| `title_max_length` | `""` | Allows you to trim the title in the posts list, excess text will be appended with an ellipsis `...` | No |
| `description_max_length` | `""` | Allows you to trim the description in the posts list, excess text will be appended with an ellipsis `...` | No |
| `item_exec` | `""` | Allows you to execute custom JavaScript code on each post item fetched from the xml to do advanced text manipulation. Please see the [issue comment](https://github.com/gautamkrishnar/blog-post-workflow/issues/34#issuecomment-706582788) as an example | No |
| `commit_message` | `Updated with the latest blog posts` | Allows you to customize the commit message | No |
| `committer_username` | `blog-post-bot` | Allows you to customize the committer username | No |
| `committer_email` | `blog-post-bot@example.com` | Allows you to customize the committer email | No |
| `output_only` | `false` | Sets the generated array as `results` [output variable](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions#jobsjob_idoutputs) so that it can be consumed in other actions and parsed via utilities like [jq](https://stedolan.github.io/jq/). This will also prevent committing to readme. See [#51](https://github.com/gautamkrishnar/blog-post-workflow/issues/51#issuecomment-758570235) for more details about the output format and how to use it. | No |
| `enable_keepalive` | `true` | Workflow will automatically do a dummy commit to keep the repository active if there is no commit activity for the last 50 days. GitHub will stop running all cron based triggers if the repository is not active for more than 60 days. This flag allows you to disable this feature. See [#53](https://git.io/Jtm4V) for more details.  | No |
| `retry_count` | `0` | Maximum number of times to retry the fetch operation if it fails, See [#66](https://github.com/gautamkrishnar/blog-post-workflow/issues/66) for more details. | No |
| `retry_wait_time` | `1` | Time to wait before each retry operation in seconds.  | No |

### Advanced usage examples
#### StackOverflow example
The following configuration allows you to show your latest StackOverflow activity along with your latest blog posts in the Github profile or project readme:
- Follow the steps mentioned in the [how to use](#how-to-use) section
- Add the following section to your **README.md** file, you can give whatever title you want. Just make sure that you use `<!-- STACKOVERFLOW:START --><!-- STACKOVERFLOW:END -->` in your readme. The workflow will replace this comment with the actual StackOverflow activity: 
```markdown
# StackOverflow Activity
<!-- STACKOVERFLOW:START -->
<!-- STACKOVERFLOW:END -->
```
- Create `stack-overflow-workflow.yml` in your `workflows` folder with the following contents, replace **4214976** with your StackOverflow [user id](https://meta.stackexchange.com/questions/98771/what-is-my-user-id/111130#111130):
```yaml
name: Latest stack overflow activity
on:
  schedule:
    # Runs every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch:
jobs:
  update-readme-with-stack-overflow:
    name: Update this repo's README with latest activity from StackOverflow
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: gautamkrishnar/blog-post-workflow@master
        with:
          comment_tag_name: "STACKOVERFLOW"
          commit_message: "Updated readme with the latest stackOverflow data"
          feed_list: "https://stackoverflow.com/feeds/user/4214976"
```
<details>
  <summary>See the result!</summary>

  ![advanced](https://user-images.githubusercontent.com/8397274/88197889-b727ff80-cc60-11ea-8e4a-b1fbd8dd9d06.png)
</details>

### Popular Sources 
Following are the list of some popular blogging platforms and their RSS feed urls:

| Name | Feed URL | Comments | Example |
|--------|--------|--------|--------|
| [Dev.to](https://dev.to/) | `https://dev.to/feed/username` | Replace username with your own username | https://dev.to/feed/gautamkrishnar |
| [Wordpress](https://wordpress.org/) | `https://www.example.com/feed/` | Replace with your own blog url | https://www.gautamkrishnar.com/feed/ |
| [Medium](https://medium.com/) | `https://medium.com/feed/@username` | Replace @username with your Medium username | https://medium.com/feed/@khaosdoctor |
| [Medium (Sub Domain)](https://medium.com/) | `https://username.medium.com/feed` | Replace username with your Medium username | https://timsneath.medium.com/feed |
| [Stackoverflow](https://stackoverflow.com/) | `https://stackoverflow.com/feeds/user/userid` | Replace with your StackOverflow [UserId](https://meta.stackexchange.com/questions/98771/what-is-my-user-id/111130#111130) | https://stackoverflow.com/feeds/user/5283532 |
| [StackExchange](https://stackexchange.com/) | `https://subdomain.stackexchange.com/feeds/user/userid` | Replace with your StackExchange [UserId](https://meta.stackexchange.com/questions/98771/what-is-my-user-id/111130#111130) and sub-domain | https://devops.stackexchange.com/feeds/user/15 |
| [Ghost](https://ghost.org/) | `https://www.example.com/rss/` | Replace with your own blog url | https://blog.codinghorror.com/rss/ |
| [Drupal](https://www.drupal.org/) | `https://www.example.com/rss.xml` | Replace with your own blog url | https://www.arsenal.com/rss.xml |
| [Youtube Playlists](https://www.youtube.com) | `https://www.youtube.com/feeds/videos.xml?playlist_id=playlistId` | Replace `playlistId` with your own Youtube playlist id | https://www.youtube.com/feeds/videos.xml?playlist_id=PLJNqgDLpd5E69Kc664st4j7727sbzyx0X |
| [Youtube Channel Video list](https://www.youtube.com) |  `https://www.youtube.com/feeds/videos.xml?channel_id=channelId` | Replace `channelId` with your own Youtube channel id | https://www.youtube.com/feeds/videos.xml?channel_id=UCDCHcqyeQgJ-jVSd6VJkbCw |
| [Anchor.fm Podcasts](https://anchor.fm/) | `https://anchor.fm/s/podcastId/podcast/rss` | You can get the rss feed url of a podcast by following [these](https://help.anchor.fm/hc/en-us/articles/360027712351-Locating-your-Anchor-RSS-feed) instructions | https://anchor.fm/s/1e784a38/podcast/rss |
| [Hashnode](https://hashnode.com/) | `https://@username.hashnode.dev/rss.xml` | Replace @username with your Hashnode username | https://polilluminato.hashnode.dev/rss.xml |
| [Google Podcasts](https://podcasts.google.com/) | `https://podcasts.google.com/feed/channelId` | Replace `channelId` with your Google podcast channel Id | https://podcasts.google.com/feed/aHR0cHM6Ly9mZWVkcy5zb3VuZGNsb3VkLmNvbS91c2Vycy9zb3VuZGNsb3VkOnVzZXJzOjYyOTIxMTkwL3NvdW5kcy5yc3M= |
| [Reddit](https://www.reddit.com/) | `http://www.reddit.com/r/topic/.rss` | You can create an RSS feed by adding '.rss' to the end of an existing Reddit URL. Replace `topic` with SubReddit topic that interest you or localized to you.| http://www.reddit.com/r/news/.rss |
| [Analytics India Magazine](https://analyticsindiamag.com/) | `https://analyticsindiamag.com/author/author_name/feed/` | Replace `author_name` with your name | https://analyticsindiamag.com/author/kaustubhgupta1828gmail-com/feed/ |
| [Feedburner](https://feedburner.com/) | `https://feeds.feedburner.com/feed_address` | Replace `feed_address` with your Feedburner feed address | https://feeds.feedburner.com/darkwood-fr/blog |
| [Tumblr](https://www.tumblr.com)|`https://blog_name.tumblr.com/rss` or `https://example.com/rss`|You can create an RSS feed by adding '/rss' to your main blog page or to your own domain if it is configured. Replace `blog_name` with your blog name | https://goggledoddle.tumblr.com/rss|

### Examples 
* [My own GitHub profile readme](https://github.com/gautamkrishnar) - [YML File](https://github.com/gautamkrishnar/gautamkrishnar/blob/master/.github/workflows/blog-post-workflow.yml)
* [Lucas Santos' GitHub profile readme](https://github.com/khaosdoctor) - [YML File](https://github.com/khaosdoctor/khaosdoctor/blob/main/.github/workflows/update-blog-posts.yml)
* [Blog post table](https://github.com/gkr-bot/gkr-bot#latest-stackoveflow-activity-of-gautamkrishnar) - [YML File](https://github.com/gkr-bot/gkr-bot/blob/master/.github/workflows/stack-oveflow-workflow.yml)

### Demo video
Please see the [video](https://www.youtube.com/watch?v=ECuqb5Tv9qI) by [@codeSTACKr](https://github.com/codeSTACKr).

### Contributing
Please see [CONTRIBUTING.md](CONTRIBUTING.md) for getting started with the contribution. Make sure that you follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) while contributing and engaging in the discussions. **When contributing, please first discuss the change you wish to make via an issue on this repository before making the actual change**.

#### ToDo
- [ ] Add more sources
- [ ] Fix bugs if any

### Bugs
If you are experiencing any bugs, don’t forget to open a [new issue](https://github.com/gautamkrishnar/blog-post-workflow/issues/new).

### Thanks to
- All the **3K+✨** [users](https://github.com/search?l=YAML&o=desc&q=gautamkrishnar%2Fblog-post-workflow&s=indexed&type=Code) of this workflow
- Everyone for making this project the top 20 most installed / starred action in the [GitHub Marketplace](https://github.com/marketplace?category=&query=sort%3Apopularity-desc&type=actions&verification=) 
- All the [contributors](https://github.com/gautamkrishnar/blog-post-workflow/graphs/contributors)
- [@codeSTACKr](https://github.com/codeSTACKr) for [this](https://www.youtube.com/watch?v=ECuqb5Tv9qI) amazing video
- [CodeCov](https://about.codecov.io/) for this blog: [Discovering the Most Popular and Most Used Github Actions](https://about.codecov.io/blog/discovering-the-most-popular-and-most-used-github-actions/)
- [the byte podcast](https://podcast.thebyte.io/episodes/learn-how-to-pimp-out-your-github-profile)

### Liked it?
Hope you liked this project, don't forget to give it a star ⭐

<a href="https://starchart.cc/gautamkrishnar/blog-post-workflow"><img src="https://starchart.cc/gautamkrishnar/blog-post-workflow.svg" width="600px"></a>
