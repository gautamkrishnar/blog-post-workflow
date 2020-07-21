# Blog post workflow
List your latest blog posts from different sources on your Github profile/project readme automatically using this github action:

![preview](https://user-images.githubusercontent.com/8397274/88047382-29b8b280-cb6f-11ea-9efb-2af2b10f3e0c.png)


### How to use
- Go to your repository
- Add the following section to your **README.md** file, you can give whatever title you want. Just make sure that you use `<!-- BLOG-POST-LIST:START --><!-- BLOG-POST-LIST:END -->` in your readme. The workflow will replace this comment with the actual blog post list: 
```markdown
# Blog posts
<!-- BLOG-POST-LIST:START -->
<!-- BLOG-POST-LIST:END -->
```
- Create a folder named `.github` and create `workflows` folder inside it if it doesn't exist.
- Create a new file named `blog-post-workflow.yml` with the following contents inside the workflows folder:
```yaml
name: Latest blog post workflow
on:
  push:
    branches:
      - master
  workflow_dispatch:
  schedule:
    # Runs every hour
    - cron: '0 * * * *'

jobs:
  update-readme:
    name: Update this repo's README with latest blog posts
    runs-on: ubuntu-latest
    steps:
      - uses: gautamkrishnar/blog-post-workflow@master
        with:
          feed_list: "['https://dev.to/feed/gautamkrishnar', 'https://www.gautamkrishnar.com/feed/']"
```
- Replace the above url list with your own rss feed urls. See [popular-sources](#popular-sources) for a list of common RSS feed urls.
- Commit and wait for it to run

### Options
This workflow has additional options that you can use to customize it for your use case, following are the list of options available:

| Option | Default Value | Description | Required |
|--------|--------|--------|--------|
| `feed_list` | `[]` | List of feed urls formatted as javascript array, eg: `['https://example1.com', 'https://example2.com'`]` | Yes |
| `max_post_count` | `5` | Maximum number of posts you want to show on your readme, all feeds combined | No  |
| `readme_path` | `./README.md` | Path of the readme file you want to update | No |
| `gh_token` | your github token with repo scope | Use this to configure the token of the user that commits the workflow result to GitHub | No |  

### Popular Sources 
Following are the list of some popular blogging platforms and their RSS feed urls:

| Name | Feed URL | Comments | Example |
|--------|--------|--------|--------|
| [Dev.to](https://dev.to/) | `https://dev.to/feed/username` | Replace username wih your own username | https://dev.to/feed/gautamkrishnar |
| [Wordpress](https://wordpress.org/) | `https://www.gautamkrishnar.com/feed/` | Replace wih your own blog url | n/a |

### Bugs
If you are experiencing any bugs, don’t forget to open a [new issue](https://github.com/gautamkrishnar/blog-post-workflow/issues/new).

### Liked it?
Hope you liked this project, don't forget to give it a star ⭐
