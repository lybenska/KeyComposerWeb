// Post-processes `dist` for the GitHub Pages review build (never for production):
//  1. rewrites root-relative URLs (/styles.css, /assets/…, /fonts/…) to relative ones, so the
//     build works from the Pages sub-path (https://<user>.github.io/KeyComposerWeb/);
//  2. marks the page noindex/nofollow and adds a robots.txt that disallows crawling, so the
//     review site never shows up in search engines. The production build keeps indexing on.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const html = join(dist, 'index.html');
const css = join(dist, 'styles.css');

let h = await readFile(html, 'utf8');
const refs = (h.match(/(?:href|src)="\/(?!\/)/g) ?? []).length;
h = h.replace(/(href|src)="\/(?!\/)/g, '$1="');
if (!/name="robots"/.test(h)) {
  h = h.replace('</head>', '<meta name="robots" content="noindex, nofollow" />\n</head>');
}
await writeFile(html, h);

let c = await readFile(css, 'utf8');
const urls = (c.match(/url\('\/(?!\/)/g) ?? []).length;
c = c.replace(/url\('\/(?!\/)/g, "url('");
await writeFile(css, c);

await writeFile(join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

console.log(`review-build: ${refs} html refs and ${urls} css urls relativized; noindex meta and robots.txt added`);
