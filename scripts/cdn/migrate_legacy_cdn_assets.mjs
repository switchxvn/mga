import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config({ path: path.resolve('.env') });

const LEGACY_BASE_URL = 'https://cdn.captreonuisam.com';
const DEFAULT_PUBLIC_URL = 'https://cdn.mgavietnam.com';
const SUPPORTED_TYPES = new Set(['text', 'character varying', 'json', 'jsonb']);

function parseArgs(argv) {
  const args = {
    mode: 'audit',
    limit: null,
    input: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--mode') {
      args.mode = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === '--limit') {
      args.limit = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (token === '--input') {
      args.input = argv[index + 1];
      index += 1;
      continue;
    }
  }

  if (!['audit', 'probe', 'mirror', 'replace-db', 'replace-db-live-only', 'verify-migrated', 'replace-db-from-file'].includes(args.mode)) {
    throw new Error(`Unsupported mode: ${args.mode}`);
  }

  if (args.limit !== null && (!Number.isFinite(args.limit) || args.limit <= 0)) {
    throw new Error(`Invalid --limit value: ${args.limit}`);
  }

  return args;
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function escapeLike(value) {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function extractLegacyUrls(rawValue) {
  if (!rawValue) {
    return [];
  }

  const value = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue);
  return Array.from(
    new Set(value.match(/https:\/\/cdn\.captreonuisam\.com\/[^"'\s)\],}]+/g) || []),
  );
}

async function getClient() {
  const { Client } = pg;
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || process.env.DB_NAME,
  });

  await client.connect();
  return client;
}

async function getActiveUploadConfig(client) {
  const result = await client.query(`
    select endpoint, region, bucket, access_key, secret_key, public_url
    from upload_config
    where is_active = true
    order by id asc
    limit 1
  `);

  if (result.rows.length === 0) {
    throw new Error('No active upload_config found');
  }

  return result.rows[0];
}

async function getSearchableColumns(client) {
  const result = await client.query(`
    select table_schema, table_name, column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position
  `);

  return result.rows.filter((row) => SUPPORTED_TYPES.has(row.data_type));
}

async function getPrimaryKeyColumn(client, tableSchema, tableName) {
  const result = await client.query(
    `
      select kcu.column_name
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name
       and tc.table_schema = kcu.table_schema
      where tc.constraint_type = 'PRIMARY KEY'
        and tc.table_schema = $1
        and tc.table_name = $2
      order by kcu.ordinal_position asc
      limit 1
    `,
    [tableSchema, tableName],
  );

  return result.rows[0]?.column_name ?? null;
}

async function auditDatabase(client, options = {}) {
  const likeNeedle = `%${escapeLike(LEGACY_BASE_URL)}%`;
  const columns = await getSearchableColumns(client);
  const findings = [];
  const urls = new Set();

  for (const column of columns) {
    const pkColumn = await getPrimaryKeyColumn(client, column.table_schema, column.table_name);
    const selectPk = pkColumn ? `${quoteIdentifier(pkColumn)} as row_id, ` : '';
    const query = `
      select ${selectPk}cast(${quoteIdentifier(column.column_name)} as text) as value
      from ${quoteIdentifier(column.table_schema)}.${quoteIdentifier(column.table_name)}
      where cast(${quoteIdentifier(column.column_name)} as text) like $1 escape '\\'
    `;

    const result = await client.query(query, [likeNeedle]);
    if (result.rows.length === 0) {
      continue;
    }

    const samples = [];

    for (const row of result.rows) {
      const rowUrls = extractLegacyUrls(row.value);
      for (const url of rowUrls) {
        urls.add(url);
      }

      if (samples.length < 5) {
        samples.push({
          rowId: row.row_id ?? null,
          urls: rowUrls,
        });
      }
    }

    findings.push({
      table: column.table_name,
      column: column.column_name,
      count: result.rows.length,
      samples,
    });
  }

  const urlList = Array.from(urls).sort();
  return {
    tables: findings,
    urls: options.limit ? urlList.slice(0, options.limit) : urlList,
    totalUrls: urlList.length,
  };
}

function buildS3Client(config) {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.access_key,
      secretAccessKey: config.secret_key,
    },
    forcePathStyle: true,
  });
}

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
    default:
      return 'application/octet-stream';
  }
}

async function mirrorAssets(urls, uploadConfig) {
  const s3 = buildS3Client(uploadConfig);
  const migrated = [];
  const failed = [];

  for (const url of urls) {
    try {
      const parsed = new URL(url);
      const key = parsed.pathname.replace(/^\/+/, '');
      if (!key) {
        throw new Error(`Cannot derive object key from URL: ${url}`);
      }

      const response = await fetch(url);
      if (!response.ok) {
        failed.push({
          sourceUrl: url,
          status: response.status,
          statusText: response.statusText,
        });
        continue;
      }

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
        key,
        targetUrl: `${uploadConfig.public_url || DEFAULT_PUBLIC_URL}/${key}`,
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

  return { migrated, failed };
}

async function probeAssets(urls) {
  const reachable = [];
  const unreachable = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const entry = {
        sourceUrl: url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
      };

      if (response.ok) {
        reachable.push(entry);
      } else {
        unreachable.push(entry);
      }
    } catch (error) {
      unreachable.push({
        sourceUrl: url,
        status: 'ERROR',
        statusText: error.message,
        contentType: null,
        contentLength: null,
      });
    }
  }

  return { reachable, unreachable };
}

function toTargetUrl(sourceUrl, publicUrl) {
  const key = new URL(sourceUrl).pathname.replace(/^\/+/, '');
  return `${publicUrl || DEFAULT_PUBLIC_URL}/${key}`;
}

async function replaceDatabaseUrls(client, uploadConfig) {
  const fromBase = LEGACY_BASE_URL;
  const toBase = uploadConfig.public_url || DEFAULT_PUBLIC_URL;
  const likeNeedle = `%${escapeLike(fromBase)}%`;
  const columns = await getSearchableColumns(client);
  const updates = [];

  await client.query('begin');
  try {
    for (const column of columns) {
      const query = `
        update ${quoteIdentifier(column.table_schema)}.${quoteIdentifier(column.table_name)}
        set ${quoteIdentifier(column.column_name)} =
          replace(cast(${quoteIdentifier(column.column_name)} as text), $1, $2)::${column.data_type}
        where cast(${quoteIdentifier(column.column_name)} as text) like $3 escape '\\'
      `;

      const result = await client.query(query, [fromBase, toBase, likeNeedle]);
      if (result.rowCount > 0) {
        updates.push({
          table: column.table_name,
          column: column.column_name,
          updatedRows: result.rowCount,
        });
      }
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  return updates;
}

async function replaceSpecificUrls(client, replacements) {
  const columns = await getSearchableColumns(client);
  const updates = [];

  await client.query('begin');
  try {
    for (const column of columns) {
      let columnUpdates = 0;

      for (const replacement of replacements) {
        const query = `
          update ${quoteIdentifier(column.table_schema)}.${quoteIdentifier(column.table_name)}
          set ${quoteIdentifier(column.column_name)} =
            replace(cast(${quoteIdentifier(column.column_name)} as text), $1, $2)::${column.data_type}
          where cast(${quoteIdentifier(column.column_name)} as text) like $3 escape '\\'
        `;

        const result = await client.query(query, [
          replacement.from,
          replacement.to,
          `%${escapeLike(replacement.from)}%`,
        ]);

        columnUpdates += result.rowCount;
      }

      if (columnUpdates > 0) {
        updates.push({
          table: column.table_name,
          column: column.column_name,
          updatedRows: columnUpdates,
        });
      }
    }

    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }

  return updates;
}

async function loadReplacementsFromFile(inputPath) {
  if (!inputPath) {
    throw new Error('--input is required for replace-db-from-file');
  }

  const raw = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8'));
  if (!Array.isArray(raw)) {
    throw new Error('Replacement file must be a JSON array');
  }

  return raw.map((item) => {
    if (!item.from || !item.to) {
      throw new Error(`Invalid replacement entry: ${JSON.stringify(item)}`);
    }

    return {
      from: item.from,
      to: item.to,
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = await getClient();

  try {
    const uploadConfig = await getActiveUploadConfig(client);

    if (args.mode === 'audit') {
      const report = await auditDatabase(client, { limit: args.limit });
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    }

    if (args.mode === 'mirror') {
      const report = await auditDatabase(client, { limit: args.limit });
      const result = await mirrorAssets(report.urls, uploadConfig);
      process.stdout.write(
        `${JSON.stringify(
          {
            totalUrls: report.totalUrls,
            processedUrls: report.urls.length,
            migratedCount: result.migrated.length,
            failedCount: result.failed.length,
            migrated: result.migrated,
            failed: result.failed,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }

    if (args.mode === 'probe') {
      const report = await auditDatabase(client, { limit: args.limit });
      const result = await probeAssets(report.urls);
      process.stdout.write(
        `${JSON.stringify(
          {
            totalUrls: report.totalUrls,
            processedUrls: report.urls.length,
            reachableCount: result.reachable.length,
            unreachableCount: result.unreachable.length,
            reachable: result.reachable,
            unreachable: result.unreachable,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }

    if (args.mode === 'replace-db') {
      const updates = await replaceDatabaseUrls(client, uploadConfig);
      process.stdout.write(`${JSON.stringify({ updates }, null, 2)}\n`);
      return;
    }

    if (args.mode === 'replace-db-live-only') {
      const report = await auditDatabase(client, { limit: args.limit });
      const probe = await probeAssets(report.urls);
      const replacements = probe.reachable.map((entry) => {
        return {
          from: entry.sourceUrl,
          to: toTargetUrl(entry.sourceUrl, uploadConfig.public_url),
        };
      });
      const updates = await replaceSpecificUrls(client, replacements);
      process.stdout.write(
        `${JSON.stringify(
          {
            replacementCount: replacements.length,
            updates,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }

    if (args.mode === 'verify-migrated') {
      const report = await auditDatabase(client, { limit: args.limit });
      const sourceProbe = await probeAssets(report.urls);
      const targetUrls = sourceProbe.reachable.map((entry) => toTargetUrl(entry.sourceUrl, uploadConfig.public_url));
      const targetProbe = await probeAssets(targetUrls);
      process.stdout.write(
        `${JSON.stringify(
          {
            expectedMigratedCount: sourceProbe.reachable.length,
            targetReachableCount: targetProbe.reachable.length,
            targetUnreachableCount: targetProbe.unreachable.length,
            targetReachable: targetProbe.reachable,
            targetUnreachable: targetProbe.unreachable,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }

    if (args.mode === 'replace-db-from-file') {
      const replacements = await loadReplacementsFromFile(args.input);
      const updates = await replaceSpecificUrls(client, replacements);
      process.stdout.write(
        `${JSON.stringify(
          {
            replacementCount: replacements.length,
            updates,
          },
          null,
          2,
        )}\n`,
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
