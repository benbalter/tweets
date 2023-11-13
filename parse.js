const fs = require('fs');
const yaml = require('js-yaml');
const truncate = require('truncate');
const emojiRegex = require('emoji-regex');

const fields = [
  "id", "retweet_count", "favorite_count",
  "retweeted", "entities"
]

const dir = "_statuses"

fs.rmSync(dir, { recursive: true });
fs.mkdirSync(dir);

json = fs.readFileSync('tweets.json', 'utf8');
tweets = JSON.parse(json);
console.log(`Found ${tweets.length} tweets`);

for (const tweet of tweets) {
  const filtered = {};
  for (const field of fields) {
    filtered[field] = tweet.tweet[field];
  }
  filtered.original_url = `https://twitter.com/benbalter/status/${filtered.id}`
  const createdAt = new Date(tweet.tweet.created_at);
  filtered.date = createdAt.toISOString();
  
  let body = tweet.tweet.full_text;
  body = body.replaceAll("{%", "{% raw %}{%{% endraw %}");
  body = body.replaceAll("{{", "{% raw %}{{{% endraw %}");

  // Replace URLs
  if (filtered.entities.urls) {
    for (const url of filtered.entities.urls) {
      body = body.replace(url.url, url.expanded_url);
    }
  }

  if (filtered.entities.media) {
    filtered.images = [];
    for (const media of filtered.entities.media) {
      mediaID = filtered.entities.media[0].media_url_https.split('/').pop();
      const mediaPath = `../../media/${filtered.id}-${mediaID}`;
      filtered.images.push(mediaPath);
      body.replace(media.url, "");
    }
    filtered.image = filtered.images[0];
  }
  
  // Don't index retweets and replies
  if (filtered.retweeted === true|| body.substr(0,2) == "RT") {
    filtered.sitemap = false;
    filtered.robots = "noindex";
    filtered.retweeted = true;
  }

  if (body.substr(0,1) == "@") {
    filtered.sitemap = false;
    filtered.robots = "noindex";
    filtered.reply = true;
  }

  const bodyWithoutEmoji = body.replaceAll(emojiRegex(), '');
  filtered.title = truncate(bodyWithoutEmoji, 100);

  const frontMatter = "---\n" + yaml.dump(filtered) + "---\n";
  const path = `${dir}/${filtered.id}.md`;
  const output = `${frontMatter}\n${body}`;
  fs.writeFileSync(path, output);
}

