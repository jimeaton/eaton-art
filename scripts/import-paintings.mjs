/**
 * import-paintings.mjs
 * Reads scripts/paintings.csv and imports every row into Sanity.
 * Uploads image files from /images/, creates painting documents.
 *
 * Usage:
 *   SANITY_TOKEN=<your-write-token> node scripts/import-paintings.mjs
 *
 * Dry run (no writes):
 *   SANITY_TOKEN=<token> node scripts/import-paintings.mjs --dry-run
 */

import fs   from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH  = path.join(__dirname, 'paintings.csv');
const IMG_DIR   = path.join(__dirname, '../images');
const DRY_RUN   = process.argv.includes('--dry-run');

// ─── Sanity client ───────────────────────────────────────────────────────────

const token = process.env.SANITY_TOKEN;
if (!token) {
  console.error('Error: SANITY_TOKEN environment variable is required.');
  console.error('Set it with: SANITY_TOKEN=your_token node scripts/import-paintings.mjs');
  process.exit(1);
}

const client = createClient({
  projectId: 'olr9n4p3',
  dataset:   'production',
  apiVersion: '2026-03-15',
  token,
  useCdn:    false,
});

// ─── CSV parser ──────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && !inQuotes)       { inQuotes = true; }
      else if (ch === '"' && inQuotes) {
        if (line[i + 1] === '"')         { cur += '"'; i++; }
        else                             { inQuotes = false; }
      } else if (ch === ',' && !inQuotes){ values.push(cur); cur = ''; }
      else                               { cur += ch; }
    }
    values.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] || '').trim()]));
  });
}

// ─── MIME type helper ────────────────────────────────────────────────────────

function mimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext] || 'image/jpeg';
}

// ─── Sleep helper (rate limiting) ────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const csv  = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCSV(csv);

  console.log(`Found ${rows.length} paintings in CSV`);
  if (DRY_RUN) console.log('DRY RUN — no data will be written\n');

  let imported = 0;
  let skipped  = 0;
  let errors   = 0;

  for (const [i, row] of rows.entries()) {
    const imgPath = path.join(IMG_DIR, row.filename);

    if (!row.filename || !fs.existsSync(imgPath)) {
      console.warn(`[${i + 1}/${rows.length}] SKIP (no file): "${row.title}" — ${row.filename}`);
      skipped++;
      continue;
    }

    console.log(`[${i + 1}/${rows.length}] Importing: "${row.title}"`);

    if (DRY_RUN) { imported++; continue; }

    try {
      // 1. Upload image asset
      const imageAsset = await client.assets.upload(
        'image',
        fs.createReadStream(imgPath),
        { filename: row.filename, contentType: mimeType(row.filename) }
      );

      // 2. Build document
      const doc = {
        _type: 'painting',
        title: row.title,
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAsset._id },
        },
        altText:     row.altText     || undefined,
        medium:      row.medium      || undefined,
        dimensions:  row.dimensions  || undefined,
        price:       row.price       ? Number(row.price) : undefined,
        category:    row.category    || undefined,
        publishedAt: row.publishedAt || undefined,
      };

      // Remove undefined fields
      Object.keys(doc).forEach(k => doc[k] === undefined && delete doc[k]);

      // 3. Create document
      await client.create(doc);
      imported++;

      // Rate limit: 2 paintings/second
      await sleep(500);

    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      errors++;
    }
  }

  console.log('\n─────────────────────────────────');
  console.log(`✓ Imported: ${imported}`);
  if (skipped) console.log(`⚠ Skipped:  ${skipped} (missing image files)`);
  if (errors)  console.log(`✗ Errors:   ${errors}`);
}

main();
