import type { APIRoute } from 'astro';
import { atomFeed } from '../lib/feed';

export const GET: APIRoute = ({ site }) => atomFeed('feed.xml', site!);
