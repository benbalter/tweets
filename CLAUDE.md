# CLAUDE.md

[Astro](https://astro.build) static site archiving @benbalter's tweets, served at [ben.balter.com/tweets](https://ben.balter.com/tweets/). One Markdown file per tweet in [`_statuses/`](_statuses/). The [README](README.md) covers commands and layout.

## Deploying

Pushing to `main` ships, so push or merge there only when the owner asks. Cloudflare Workers Builds (trigger "Deploy default branch", no build command of its own) installs npm dependencies and runs `npx wrangler deploy`, which runs `build.command` from [`wrangler.jsonc`](wrangler.jsonc) (`npm run build`) and uploads `dist` as Workers static assets. PRs get no build or preview, so preview locally with `npm run preview`, which builds (wrangler runs `build.command`) and serves the result through the real Worker config at `http://localhost:8787/tweets/`.

## The archive is frozen

- `tweets.json` (the Twitter export) isn't in the repository, so [`parse.cjs`](parse.cjs) can't regenerate [`_statuses/`](_statuses/). Treat the committed statuses as the source of truth. Fix rendering in [`src/`](src/), not by hand-editing statuses, unless the fix can only live in the data.
- [`_data/related_posts.yml`](_data/related_posts.yml) is frozen too. Its generator was a Jekyll LSI script, removed in the Astro conversion. Keys and values are Jekyll-style paths (`_statuses/<id>.md`); [`src/lib/statuses.ts`](src/lib/statuses.ts) maps them to ids.
- [`_data/bluesky.yml`](_data/bluesky.yml) comes from `npm run bluesky -- --write`. Without `--write` it only prints a match report.

## Gotchas

- [`astro.config.mjs`](astro.config.mjs) builds into `dist/tweets` with `base: '/tweets'`, and `wrangler.jsonc` serves the parent `dist`. Change one and every link breaks.
- The public route `ben.balter.com/tweets*` lives in OpenTofu in [benbalter/dns](https://github.com/benbalter/dns) (`zone.balter.com.tf`), not `wrangler.jsonc`, because the build token can't create routes.
- Markdown runs through `@astrojs/markdown-remark`'s unified pipeline, not Astro 7's default Sätteri, because [`src/lib/remark-mentions.ts`](src/lib/remark-mentions.ts) (the jekyll-mentions replacement) is a remark plugin. Smartypants stays off so tweets show the quotes they were typed with.
- Dates display in America/New_York (see `displayDate` in `src/lib/statuses.ts`); builds run in UTC.
- Astro caches rendered Markdown in `node_modules/.astro`. After changing the remark plugin, delete it so every status re-renders.
- `package.json` is `"type": "module"`, so the CommonJS scripts use `.cjs`.
