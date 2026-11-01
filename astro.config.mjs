// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkMentions from './src/lib/remark-mentions.ts';

const BEN = 'https://ben.balter.com';

export default defineConfig({
  site: BEN,
  base: '/tweets',
  trailingSlash: 'always',
  // Build into dist/tweets so the files land at the same paths they're served
  // from. wrangler.jsonc serves the PARENT (dist), which puts them at
  // ben.balter.com/tweets/*. Change one without the other and every link breaks.
  outDir: './dist/tweets',
  build: { format: 'directory' },
  // Pages the Jekyll site kept as redirect_to stubs. Inbound links still exist.
  redirects: {
    '/posts/': BEN,
    '/about/': `${BEN}/about/`,
    '/contact/': `${BEN}/contact/`,
    '/fine-print/': `${BEN}/fine-print/`,
    '/source/': 'https://github.com/benbalter/tweets',
  },
  // The unified (remark) pipeline rather than Astro 7's default Sätteri, which
  // can't run remark plugins. gfm autolinks bare URLs, like the old CommonMark
  // "autolink" extension; remarkMentions replaces jekyll-mentions. No
  // smartypants: tweets are verbatim text, and the Jekyll site's "smart"
  // option never took effect, so they've always shown straight quotes.
  markdown: {
    processor: unified({
      gfm: true,
      smartypants: false,
      remarkPlugins: [remarkMentions],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
