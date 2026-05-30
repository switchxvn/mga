import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: path.resolve('.env') });

function replaceAllWithMap(value, replacements) {
  let nextValue = value;

  for (const { from, to } of replacements) {
    if (nextValue.includes(from)) {
      nextValue = nextValue.split(from).join(to);
    }
  }

  return nextValue;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error('Usage: node scripts/cdn/update_legacy_cdn_db_fast.mjs <replacements.json>');
  }

  const replacements = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8'));
  if (!Array.isArray(replacements) || replacements.length === 0) {
    throw new Error('Replacement file must be a non-empty JSON array');
  }

  const { Client } = pg;
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || process.env.DB_NAME,
  });

  await client.connect();

  const summary = {
    uploads: 0,
    productThumbnails: 0,
    productGalleries: 0,
    themeSectionTranslations: 0,
  };

  try {
    await client.query('begin');

    for (const { from, to } of replacements) {
      const uploadResult = await client.query(
        'update uploads set url = $2 where url = $1',
        [from, to],
      );
      summary.uploads += uploadResult.rowCount;

      const thumbnailResult = await client.query(
        'update products set thumbnail = $2 where thumbnail = $1',
        [from, to],
      );
      summary.productThumbnails += thumbnailResult.rowCount;
    }

    const galleryRows = await client.query(
      "select id, gallery::text as gallery_text from products where gallery::text like '%cdn.captreonuisam.com%'",
    );

    for (const row of galleryRows.rows) {
      const updatedText = replaceAllWithMap(row.gallery_text, replacements);
      if (updatedText === row.gallery_text) {
        continue;
      }

      await client.query(
        'update products set gallery = $2::json where id = $1',
        [row.id, updatedText],
      );
      summary.productGalleries += 1;
    }

    const settingsRows = await client.query(
      "select id, settings::text as settings_text from theme_section_translations where settings::text like '%cdn.captreonuisam.com%'",
    );

    for (const row of settingsRows.rows) {
      const updatedText = replaceAllWithMap(row.settings_text, replacements);
      if (updatedText === row.settings_text) {
        continue;
      }

      await client.query(
        'update theme_section_translations set settings = $2::jsonb where id = $1',
        [row.id, updatedText],
      );
      summary.themeSectionTranslations += 1;
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
