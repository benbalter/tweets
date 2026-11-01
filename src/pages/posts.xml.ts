import type { APIRoute } from 'astro';
import { atomFeed } from '../lib/feed';

// jekyll-feed's posts feed, which the old <head> advertised. The site never had
// posts, so it was always empty. Keep it empty: filling it would drop every
// tweet into the reader of anyone subscribed. feed.xml has the statuses.
export const GET: APIRoute = ({ site }) => atomFeed('posts.xml', site!, { empty: true });
