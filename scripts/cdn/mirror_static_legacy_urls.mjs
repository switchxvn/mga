import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import pg from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config({ path: path.resolve('.env') });

function inferContentType(assetUrl, response) {
  const headerType = response.headers.get('content-type');
  if (headerType) {
    return headerType.split(';')[0].trim();
  }

  const ext = path.extname(new URL(assetUrl).pathname).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.gif':
      return 'image/gif';
    case '.avif':
      return 'image/avif';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}

async function getUploadConfig() {
  const { Client } = pg;
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || process.env.DB_NAME,
  });

  await client.connect();
  const result = await client.query(`
    select endpoint, region, bucket, access_key, secret_key, public_url
    from upload_config
    where is_active = true
    order by id asc
    limit 1
  `);
  await client.end();

  if (result.rows.length === 0) {
    throw new Error('No active upload_config found');
  }

  return result.rows[0];
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error('Usage: node scripts/cdn/mirror_static_legacy_urls.mjs <urls.json>');
  }

  const urls = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8'));
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('Input must be a non-empty JSON array');
  }

  const uploadConfig = await getUploadConfig();
  const s3 = new S3Client({
    endpoint: uploadConfig.endpoint,
    region: uploadConfig.region,
    credentials: {
      accessKeyId: uploadConfig.access_key,
      secretAccessKey: uploadConfig.secret_key,
    },
    forcePathStyle: true,
  });

  const migrated = [];
  const failed = [];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        failed.push({
          sourceUrl: url,
          status: response.status,
          statusText: response.statusText,
        });
        continue;
      }

      const key = new URL(url).pathname.replace(/^\/+/, '');
      const body = Buffer.from(await response.arrayBuffer());
      const contentType = inferContentType(url, response);

      await s3.send(
        new PutObjectCommand({
          Bucket: uploadConfig.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          ACL: 'public-read',
        }),
      );

      migrated.push({
        sourceUrl: url,
        targetUrl: `${uploadConfig.public_url}/${key}`,
        key,
        bytes: body.length,
        contentType,
      });
    } catch (error) {
      failed.push({
        sourceUrl: url,
        status: 'ERROR',
        statusText: error.message,
      });
    }
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        totalUrls: urls.length,
        migratedCount: migrated.length,
        failedCount: failed.length,
        migrated,
        failed,
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
