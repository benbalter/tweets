import { findAndReplace } from 'mdast-util-find-and-replace';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Link @handles to their Twitter profiles, as jekyll-mentions did. The pattern
// follows its html-pipeline MentionPattern (any non-word character before the
// @, no trailing slash, and a handle followed by `.word` such as
// `[user]@twitter.com` is skipped), except it allows underscores, which
// html-pipeline never linked although Twitter handles can contain them.
const MENTION = /(?<!\w)@(\w+)(?!\/)(?=\.+[ \t\W]|\.+$|[^\w.]|$)/g;
// html-pipeline's default ignored username, plus its plurals: Jekyll never
// linked these, and they're words, not handles.
const IGNORED = new Set(['mention', 'mentions', 'mentioned']);

export default function remarkMentions() {
  return (tree: Root) => {
    // GFM autolinks a bare "www." ("fail without www.") as http://www. Put
    // those back as plain text.
    visit(tree, 'link', (node, index, parent) => {
      if (node.url === 'http://www' && parent && index !== undefined) {
        parent.children.splice(index, 1, ...node.children);
      }
    });
    findAndReplace(
      tree,
      [
        MENTION,
        (match: string, handle: string) =>
          IGNORED.has(handle.toLowerCase())
            ? false
            : {
              type: 'link',
              url: `https://twitter.com/${handle}`,
              data: { hProperties: { className: ['user-mention'] } },
              children: [{ type: 'text', value: match }],
            },
      ],
      { ignore: ['link', 'linkReference', 'inlineCode', 'code'] },
    );
  };
}
