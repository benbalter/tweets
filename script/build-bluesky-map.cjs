// Builds _data/bluesky.yml, mapping each archived tweet id to the URL of its
// imported Bluesky post.
//
// The Twitter -> Bluesky importer preserved each tweet's original timestamp (to
// the second) as the Bluesky post's createdAt, so we join on the timestamp.
// Bluesky posts are publicly readable without auth via com.atproto.repo.listRecords.
//
// Run: node script/build-bluesky-map.js [--write]
// Without --write it only reports match/collision/miss counts (dry run).

const fs = require('fs');

const DID = 'did:plc:dw6j5wx7vyzjxxoauzdbim6w';
const HANDLE = 'ben.balter.com';
const STATUSES_DIR = '_statuses';
const OUTPUT = '_data/bluesky.yml';
const WRITE = process.argv.includes('--write');

// Floor an ISO timestamp to whole-second precision. Archived tweets are ".000Z"
// but native Bluesky posts carry milliseconds, so never compare raw strings.
function secondKey(iso) {
  return Math.floor(new Date(iso).getTime() / 1000);
}

// Normalize text for the rare same-second collision tiebreaker only. Strip URLs
// (parse.js expands t.co; Bluesky keeps its own form), lowercase, collapse space.
function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolvePds(did) {
  const res = await fetch(`https://plc.directory/${did}`);
  const doc = await res.json();
  const svc = (doc.service || []).find((s) => s.id === '#atproto_pds');
  return svc ? svc.serviceEndpoint : 'https://oyster.us-east.host.bsky.network';
}

async function fetchAllPosts(pds, did) {
  const posts = [];
  let cursor;
  do {
    const url = new URL(`${pds}/xrpc/com.atproto.repo.listRecords`);
    url.searchParams.set('repo', did);
    url.searchParams.set('collection', 'app.bsky.feed.post');
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`listRecords ${res.status}: ${await res.text()}`);
    const data = await res.json();
    for (const rec of data.records) {
      posts.push({
        rkey: rec.uri.split('/').pop(),
        createdAt: rec.value.createdAt,
        text: rec.value.text,
      });
    }
    cursor = data.cursor;
  } while (cursor);
  return posts;
}

function readStatuses(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const content = fs.readFileSync(`${dir}/${f}`, 'utf8');
      const id = (content.match(/^id:\s*'?(\d+)'?/m) || [])[1];
      const date = (content.match(/^date:\s*'?([^'\n]+)'?/m) || [])[1];
      // Body is everything after the closing frontmatter delimiter.
      const body = content.split(/^---\s*$/m).slice(2).join('---').trim();
      return { id, date, body, file: f };
    })
    .filter((s) => s.id && s.date);
}

(async () => {
  const pds = await resolvePds(DID);
  console.log(`PDS: ${pds}`);

  const posts = await fetchAllPosts(pds, DID);
  console.log(`Fetched ${posts.length} Bluesky posts`);

  // Index posts by floored-second timestamp.
  const index = new Map();
  for (const post of posts) {
    const key = secondKey(post.createdAt);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(post);
  }

  const statuses = readStatuses(STATUSES_DIR);
  console.log(`Read ${statuses.length} archived statuses`);

  const map = {};
  let collisions = 0;
  const misses = [];

  for (const status of statuses) {
    const candidates = index.get(secondKey(status.date));
    if (!candidates) {
      misses.push(status);
      continue;
    }

    let match;
    if (candidates.length === 1) {
      match = candidates[0];
    } else {
      // Same-second collision: disambiguate by normalized text prefix.
      collisions++;
      const want = normalize(status.body);
      match =
        candidates.find((c) => {
          const have = normalize(c.text);
          return have.startsWith(want.slice(0, 30)) || want.startsWith(have.slice(0, 30));
        }) || candidates[0];
    }

    map[status.id] = `https://bsky.app/profile/${HANDLE}/post/${match.rkey}`;
  }

  const matched = Object.keys(map).length;
  console.log('');
  console.log(`Matched:           ${matched}`);
  console.log(`Misses (no link):  ${misses.length}`);
  console.log(`Same-second ties:  ${collisions}`);
  console.log('');
  console.log('Sample misses (expect retweets / un-imported tweets):');
  for (const m of misses.slice(0, 10)) {
    console.log(`  ${m.id}  ${m.date}  ${m.body.slice(0, 60).replace(/\n/g, ' ')}`);
  }

  if (!WRITE) {
    console.log('\nDry run. Re-run with --write to emit ' + OUTPUT);
    return;
  }

  // Sort keys for a stable, diff-friendly file. Values are plain URLs, so emit
  // YAML by hand (no js-yaml dependency needed).
  const lines = Object.keys(map)
    .sort()
    .map((id) => `'${id}': ${map[id]}`);
  fs.writeFileSync(OUTPUT, '---\n' + lines.join('\n') + '\n');
  console.log(`\nWrote ${matched} mappings to ${OUTPUT}`);
})();
