import fs from 'node:fs';
import yaml from 'js-yaml';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Status = CollectionEntry<'statuses'>;

export const SITE_TITLE = "@benbalter's Twitter Archive";
export const SITE_DESCRIPTION = 'Historic archive of Tweets from @benbalter';
// Tweets were written, and the Jekyll site was built, in Eastern time. Builds
// now run in UTC, so pin it or late-evening tweets slip to the next day.
const TIME_ZONE = 'America/New_York';

function loadYaml<T>(file: string): T {
  return yaml.load(fs.readFileSync(file, 'utf8')) as T;
}

// Tweet id -> imported Bluesky post URL, from script/build-bluesky-map.js.
const bluesky = loadYaml<Record<string, string>>('_data/bluesky.yml');

// Related tweets, keyed and valued by Jekyll's relative paths
// (`_statuses/<id>.md`). Frozen: the LSI generator needed Jekyll.
const relatedPaths = loadYaml<Record<string, string[]>>('_data/related_posts.yml');
const idFromPath = (p: string) => p.replace(/^_statuses\//, '').replace(/\.md$/, '');

let cache: Promise<{
  all: Status[];
  byId: Map<string, Status>;
  firstReply: Map<string, Status>;
}> | undefined;

/** Every status, sorted oldest first, plus lookups built once per build. */
export function loadStatuses() {
  cache ??= getCollection('statuses').then((entries) => {
    const all = entries.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
    const byId = new Map(all.map((s) => [s.id, s]));
    const firstReply = new Map<string, Status>();
    for (const s of all) {
      const parent = s.data.in_reply_to_status_id_str;
      if (parent && !firstReply.has(parent)) firstReply.set(parent, s);
    }
    return { all, byId, firstReply };
  });
  return cache;
}

export const statusPath = (id: string) => `${import.meta.env.BASE_URL}status/${id}/`;
export const statusUrl = (id: string, site: URL) => new URL(statusPath(id), site).href;

export const blueskyUrl = (id: string): string | undefined => bluesky[id];

export async function relatedStatuses(id: string): Promise<Status[]> {
  const { byId } = await loadStatuses();
  return (relatedPaths[`_statuses/${id}.md`] ?? [])
    .map((p) => byId.get(idFromPath(p)))
    .filter((s): s is Status => s !== undefined);
}

/** parse.js wrote image paths relative to /status/<id>/; resolve them. */
export const imageSrc = (path: string) =>
  `${import.meta.env.BASE_URL}media/${path.split('/').pop()}`;

/** Twitter's export HTML-escapes &, <, and > in tweet text. */
export const decodeEntities = (text: string) =>
  text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

export const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;

/** YYYY-MM-DD in Eastern time, as the Jekyll site showed it. */
export function displayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);
}

/** ISO 8601 with the Eastern offset, e.g. 2011-08-10T15:06:16-04:00. */
export function isoDate(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZoneName: 'longOffset',
    }).formatToParts(date).map((p) => [p.type, p.value]),
  );
  const offset = parts.timeZoneName.replace('GMT', '') || '+00:00';
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

/** Replies and retweets stay out of listings, as in the Jekyll site. */
export const isOriginal = (s: Status) => !s.data.reply && !s.data.retweeted;
