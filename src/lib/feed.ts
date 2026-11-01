import { SITE_DESCRIPTION, SITE_TITLE, decodeEntities, isoDate, loadStatuses, statusUrl } from './statuses';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

/**
 * Atom feed of every status, newest first. jekyll-feed served Atom, so keep
 * the format (and entry ids) subscribers already have. `empty` serves the
 * header alone.
 */
export async function atomFeed(path: string, site: URL, { empty = false } = {}): Promise<Response> {
  const { all } = await loadStatuses();
  const self = new URL(`${import.meta.env.BASE_URL}${path}`, site).href;
  const home = new URL(import.meta.env.BASE_URL, site).href;
  const newest = all.at(-1);

  const entries = (empty ? [] : [...all].reverse()).map((s) => {
    const url = statusUrl(s.id, site);
    const title = escape(decodeEntities(s.data.title));
    const date = isoDate(s.data.date);
    return `<entry><title type="html">${title}</title><link href="${url}" rel="alternate" type="text/html" title="${title}" /><published>${date}</published><updated>${date}</updated><id>${url.replace(/\/$/, '')}</id><content type="html" xml:base="${url}">${cdata(s.rendered?.html ?? '')}</content><author><name>Ben Balter</name></author></entry>`;
  });

  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-US"><link href="${self}" rel="self" type="application/atom+xml" /><link href="${home}" rel="alternate" type="text/html" hreflang="en-US" /><updated>${newest ? isoDate(newest.data.date) : ''}</updated><id>${self}</id><title type="html">${escape(SITE_TITLE)}</title><subtitle>${escape(SITE_DESCRIPTION)}</subtitle><author><name>Ben Balter</name></author>${entries.join('')}</feed>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}
