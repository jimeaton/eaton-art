/**
 * generate-csv.mjs
 * Parses the WordPress XML export and writes scripts/paintings.csv
 * Run: node scripts/generate-csv.mjs
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const XML_PATH  = path.join(__dirname, '../eatonstudios.WordPress.2026-03-15.xml');
const CSV_PATH  = path.join(__dirname, 'paintings.csv');
const IMG_DIR   = path.join(__dirname, '../images');

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractTag(xml, tag) {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const plainRe = new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i');
  const m = xml.match(cdataRe) || xml.match(plainRe);
  return m ? m[1].trim() : '';
}

function extractAllTags(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'gi');
  return [...xml.matchAll(re)].map(m => m[1].trim());
}

function parseTitle(altText, filename) {
  if (altText) {
    return altText
      .replace(/\s*[-–—]\s*(oil on canvas|edition of \d+|by kathleen eaton|painted & silkscreened.*)/gi, '')
      .trim();
  }
  return path.basename(filename, path.extname(filename))
    .replace(/[-_.]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMedium(desc) {
  if (!desc) return '';
  const d = desc.trim();
  if (/edition of \d+/i.test(d)) {
    const m = d.match(/^(edition of \d+\s*[-–—]\s*[^,\d"]+)/i);
    if (m) return m[1].replace(/\s+/g, ' ').trim();
    return d.split(/[,\-–—]/)[0].trim();
  }
  if (/commission/i.test(d) && /oil on canvas/i.test(d)) return 'Oil on Canvas';
  if (/silkscreened and painted/i.test(d)) return 'Silkscreened & Painted Oil on Hardboard Panel';
  if (/oil (on|paint on) canvas/i.test(d) || /oli on canvas/i.test(d)) return 'Oil on Canvas';
  return '';
}

function parseDimensions(desc) {
  if (!desc) return '';
  const m = desc.match(/(\d+["']?\s*[Hh][\s"]*\s*[x×X]\s*\d+["']?\s*[Ww]|[\d.]+"\s*[HhWw]\s*[x×X]\s*[\d.]+"\s*[HhWw]|\d+"\s*x\s*\d+"|\d+\s*x\s*\d+")/i);
  if (!m) return '';
  return m[0]
    .replace(/\s*[xX×]\s*/g, '" x ')
    .replace(/([0-9])\s*["]/g, '$1"')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePrice(desc) {
  if (!desc) return '';
  const m = desc.match(/\$\s*([\d,]+)/);
  if (!m) return '';
  return m[1].replace(/,/g, '');
}

function parseCategory(cats) {
  const c = cats.toLowerCase();
  if (c.includes('poster'))          return 'posters';
  if (c.includes('suburban'))        return 'suburbia';
  if (c.includes('urban'))           return 'urban-landscapes';
  if (c.includes('sold'))            return 'sold';
  if (c.includes('painted-edition')) return 'painted-editions';
  if (c.includes('paintings'))       return 'urban-landscapes'; // fallback
  return '';
}

function localFilename(xmlFilename) {
  const base = path.basename(xmlFilename);
  // Exact match
  if (fs.existsSync(path.join(IMG_DIR, base))) return base;
  // Case-insensitive match
  const files = fs.readdirSync(IMG_DIR);
  const lower = base.toLowerCase();
  const found = files.find(f => f.toLowerCase() === lower);
  if (found) return found;
  // Strip extension and try again
  const stem = path.basename(base, path.extname(base)).toLowerCase();
  const found2 = files.find(f => path.basename(f, path.extname(f)).toLowerCase() === stem);
  if (found2) return found2;
  return '';
}

// ─── Skip list ───────────────────────────────────────────────────────────────
const SKIP_FILENAMES = new Set([
  'ke-slide-1.jpg', 'ke-slide-2.jpg', 'ke-slide-3.jpg', 'ke-slide-4.jpg',
  'ke-slide-1.webp', 'ke-slide-2.webp', 'ke-slide-3.webp',
  'logo.png', 'mountains.jpg', 'yellow_noise.jpg', 'hard_graft_1.jpg',
  'hard_graft_2.jpg', 'cartographer.png', 'art-fair-history.jpg',
  'Ill.-Artists-list.sm_.jpg',
]);

// ─── Parse XML ───────────────────────────────────────────────────────────────

const xml   = fs.readFileSync(XML_PATH, 'utf8');
const items = xml.split('<item>').slice(1);
const rows  = [];

for (const item of items) {
  const postType = extractTag(item, 'wp:post_type');
  if (postType !== 'attachment') continue;

  const attachUrl = extractTag(item, 'wp:attachment_url');
  const ext = path.extname(attachUrl).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) continue;

  const xmlFilename = path.basename(attachUrl);
  if (SKIP_FILENAMES.has(xmlFilename)) continue;

  const cats = extractAllTags(item, 'category')
    .filter(c => !c.includes('Uncategorized'))
    .join(', ');

  const cat = parseCategory(cats);
  if (!cat) continue; // skip non-painting attachments

  const postDate  = extractTag(item, 'wp:post_date');
  const desc      = extractTag(item, 'content:encoded').replace(/<[^>]+>/g, '').trim();

  // Alt text from postmeta
  const altMetaMatch = item.match(/<wp:meta_key><!\[CDATA\[_wp_attachment_image_alt\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/s);
  const altText   = altMetaMatch ? altMetaMatch[1].trim() : extractTag(item, 'title');

  const title     = parseTitle(altText, xmlFilename);
  const medium    = parseMedium(desc);
  const dims      = parseDimensions(desc);
  const price     = parsePrice(desc);
  const localFile = localFilename(xmlFilename);
  const publishedAt = postDate ? new Date(postDate).toISOString() : '';

  rows.push({ title, filename: localFile || xmlFilename, medium, dimensions: dims, price, category: cat, publishedAt, altText });
}

// ─── Write CSV ───────────────────────────────────────────────────────────────

function csvEscape(val) {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

const header = 'title,filename,medium,dimensions,price,category,publishedAt,altText';
const lines  = rows.map(r =>
  [r.title, r.filename, r.medium, r.dimensions, r.price, r.category, r.publishedAt, r.altText]
    .map(csvEscape).join(',')
);

fs.writeFileSync(CSV_PATH, [header, ...lines].join('\n'), 'utf8');

console.log(`✓ Written ${rows.length} paintings to scripts/paintings.csv`);
const missing = rows.filter(r => !fs.existsSync(path.join(IMG_DIR, r.filename)));
if (missing.length) {
  console.log(`\n⚠ ${missing.length} paintings have no matching local image file:`);
  missing.forEach(r => console.log(`  ${r.filename}  →  "${r.title}"`));
}
