import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per tweet, written by parse.js. Entry ids come from the
// filename, which is the tweet id.
const statuses = defineCollection({
  loader: glob({ pattern: '*.md', base: './_statuses' }),
  schema: z.object({
    id_str: z.string(),
    title: z.string(),
    date: z.coerce.date(),
    original_url: z.url(),
    // The export stores counts as strings. Coerce so sorting is numeric.
    favorite_count: z.coerce.number(),
    retweet_count: z.coerce.number(),
    retweeted: z.boolean().optional(),
    reply: z.boolean().optional(),
    robots: z.string().optional(),
    in_reply_to_status_id_str: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const collections = { statuses };
