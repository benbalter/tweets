# @benbalter's Twitter archive

Every tweet from my Twitter data export, as a static [Astro](https://astro.build) site at [ben.balter.com/tweets](https://ben.balter.com/tweets/). Each tweet gets its own page and permalink, so old links keep working even though the tweets on Twitter itself may not.

## Running it locally

You'll need Node 22 or later.

```sh
npm install
npm run dev       # dev server at http://localhost:4321/tweets/
npm run build     # static build into dist/tweets
npm run preview   # serve the build through the production Worker (wrangler dev)
npm run check     # type-check
```

## How it's put together

- [`_statuses/`](_statuses/) holds one Markdown file per tweet, with the tweet's metadata in front matter. [`src/content.config.ts`](src/content.config.ts) loads them as an Astro content collection.
- [`public/media/`](public/media/) holds the images attached to tweets.
- [`_data/bluesky.yml`](_data/bluesky.yml) maps tweet ids to the copies I imported into Bluesky, and [`_data/related_posts.yml`](_data/related_posts.yml) lists related tweets for each one.
- [`src/pages/`](src/pages/) has the homepage (most-liked and most-retweeted tweets), one page per tweet, and Atom feeds at `feed.xml` and `posts.xml`.

## Archiving your own tweets

1. [Download your data](https://twitter.com/settings/download_your_data) from Twitter. It can take a day to arrive.
2. Copy `data/tweets.js` from the export into this directory as `tweets.json`, and delete the `window.YTD.tweets.part0 = ` prefix so it parses as JSON.
3. Run `npm run parse`. [`parse.cjs`](parse.cjs) deletes `_statuses/` and rewrites it from `tweets.json`.
4. Change the names and URLs in [`src/lib/statuses.ts`](src/lib/statuses.ts), [`src/layouts/Base.astro`](src/layouts/Base.astro), and [`astro.config.mjs`](astro.config.mjs) to your own.

## Bluesky links

If you imported your tweets into Bluesky (the importer keeps each tweet's original timestamp), run `npm run bluesky` for a dry-run match report, then `npm run bluesky -- --write` to regenerate `_data/bluesky.yml`. [`script/build-bluesky-map.cjs`](script/build-bluesky-map.cjs) reads every public post through the AT Protocol (no auth) and matches tweets to posts by timestamp. Tweets with a match get a "Bluesky" link. Replies and retweets weren't imported, so they don't.
