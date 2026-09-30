// Rewrites root-relative URLs (/styles.css, /assets/…, /fonts/…) in the built site to relative ones,
// so the same build works from a sub-path such as https://macpaw.github.io/KeyComposerWeb/.
// The source keeps root-relative paths for the real domain; this only touches the build output.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const html = join(dist, 'index.html');
const css = join(dist, 'styles.css');

let h = await readFile(html, 'utf8');
const before = (h.match(/(?:href|src)="\/(?!\/)/g) ?? []).length;
h = h.replace(/(href|src)="\/(?!\/)/g, '$1="');
await writeFile(html, h);

let c = await readFile(css, 'utf8');
const beforeCss = (c.match(/url\('\/(?!\/)/g) ?? []).length;
c = c.replace(/url\('\/(?!\/)/g, "url('");
await writeFile(css, c);

console.log(`relativize: ${before} html refs, ${beforeCss} css urls`);
