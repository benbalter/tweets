# @benbalter's Twitter archive

Archive's historical Tweets as a Jekyll site on GitHub Pages

## How to archive your own tweets

1. Download the archive of your data from Twitter
2. Clone this repository
3. Copy the `tweets.json` file into the root directory
4. Run `node parse.js`. This will convert all the Tweets into individual Markdown files in the `_statuses` folder
5. `bundle` to install Jekyll
6. `jekyll serve` to preview locally

## Related Tweets

Run `script/build-related-statuses` and wait a while. It will create a `_data/related_statuses.yml` file.