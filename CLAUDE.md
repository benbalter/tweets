# CLAUDE.md

Jekyll site archiving @benbalter's tweets, served at [ben.balter.com/tweets](https://ben.balter.com/tweets/). One Markdown file per tweet in [`_statuses/`](_statuses/).

## Deploying

Pushing to `main` ships, so push or merge there only when the owner asks. Cloudflare Workers Builds runs `bundle exec jekyll build` and deploys `_site` as Workers static assets, per [`wrangler.jsonc`](wrangler.jsonc). PRs get no build or preview, so preview locally with `bundle exec jekyll serve`. The README's GitHub Pages and `worker/` instructions are stale.

## Generated files

- [`_statuses/`](_statuses/) comes from `node parse.js`, which deletes the folder and rewrites it from a Twitter export (`tweets.json`, not committed). Fix rendering in [`parse.js`](parse.js) or the layouts, not by hand-editing statuses.
- [`_data/related_posts.yml`](_data/related_posts.yml) comes from [`script/build-related-statuses`](script/build-related-statuses) (slow).
- [`_data/bluesky.yml`](_data/bluesky.yml) comes from `node script/build-bluesky-map.js --write`. Without `--write` it only prints a match report.

## Gotchas

- [`_config.yml`](_config.yml) builds into `_site/tweets` with `baseurl: /tweets`, and `wrangler.jsonc` serves the parent `_site`. Change one and every link breaks.
- The public route lives in the Cloudflare dashboard, not `wrangler.jsonc`, because the build token can't create routes.
- Jekyll publishes any root file it doesn't exclude (`README.md` is live). Add new non-site files to `exclude:` in `_config.yml`.
