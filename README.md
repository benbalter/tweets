# @benbalter's Twitter archive

Archive's historical Tweets as a Jekyll site on GitHub Pages

## How to archive your own tweets

1. [Download the archive of your data](https://twitter.com/settings/download_your_data) from Twitter (note: this can take 24 hours)
2. Clone this repository
3. Copy the `tweets.js` file into the root directory as `tweets.json`
4. Edit `tweets.json` to remove the `window.YTD.tweets.part0 = ` from the start of the file
5. Run `node parse.js`. This will convert all the Tweets into individual Markdown files in the `_statuses` folder
6. `bundle` to install Jekyll
7. `jekyll serve` to preview locally
8. Push to GitHub. The `build-and-deploy` workflow builds the site and deploys it to Cloudflare Pages (`tweets.pages.dev`); a Cloudflare Worker (`worker/`) reverse-proxies it to `ben.balter.com/tweets`. See `worker/wrangler.toml` for the route.

## Related Tweets

Run `script/build-related-statuses` and wait a while. It will create a `_data/related_statuses.yml` file.

## Bluesky links

If you've imported your tweets into Bluesky (which preserves each tweet's original timestamp), run `node script/build-bluesky-map.js` to print a coverage report (matched / missed / same-second ties), then `node script/build-bluesky-map.js --write` to generate `_data/bluesky.yml`. It fetches every public Bluesky post via the AT Protocol (no auth) and matches each archived tweet to its Bluesky post by timestamp. Statuses with a match render a "View on Bluesky" link; retweets and replies (not imported) simply get none.