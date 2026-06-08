// Reverse-proxy ben.balter.com/tweets* to the Cloudflare Pages origin
// (tweets.pages.dev), preserving the public URL byte-for-byte. The Pages
// build is nested under /tweets so the path maps 1:1 with no rewriting.
const ORIGIN = "https://tweets.pages.dev";
const PUBLIC = "https://ben.balter.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const upstream = await fetch(ORIGIN + url.pathname + url.search, {
      headers: request.headers,
      redirect: "manual",
    });

    const resp = new Response(upstream.body, upstream);

    // Pages can 301 (e.g. to add a trailing slash); rewrite the host back so
    // the redirect stays on ben.balter.com rather than leaking the origin.
    const loc = resp.headers.get("Location");
    if (loc) resp.headers.set("Location", loc.replace(ORIGIN, PUBLIC));

    return resp;
  },
};
