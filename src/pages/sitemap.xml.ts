import type { APIRoute } from 'astro';

// Every page here is noindex, so there's nothing to list. Keep a valid, empty
// sitemap so anything that already points at this URL doesn't start 404ing.
export const GET: APIRoute = () =>
  new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
