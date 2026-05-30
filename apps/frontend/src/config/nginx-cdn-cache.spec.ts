import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const nginxConfig = readFileSync(resolve(__dirname, '../../../../nginx/default.conf'), 'utf8');

function getServerBlocks(serverName: string) {
  const blocks: string[] = [];
  const marker = `server_name ${serverName};`;
  let searchFrom = 0;

  while (true) {
    const serverIndex = nginxConfig.indexOf(marker, searchFrom);
    if (serverIndex === -1) {
      break;
    }

    const serverStart = nginxConfig.lastIndexOf('server {', serverIndex);
    expect(serverStart).toBeGreaterThanOrEqual(0);

    const nextServerStart = nginxConfig.indexOf('\nserver {', serverIndex);
    blocks.push(
      nextServerStart === -1
        ? nginxConfig.slice(serverStart)
        : nginxConfig.slice(serverStart, nextServerStart),
    );

    searchFrom = serverIndex + marker.length;
  }

  expect(blocks.length).toBeGreaterThan(0);
  return blocks;
}

describe('nginx CDN cache config', () => {
  it('overrides upstream cache headers for both CDN hosts before setting the long-lived browser TTL', () => {
    for (const serverName of ['cdn.captreonuisam.com', 'cdn.mgavietnam.com']) {
      const serverBlock = getServerBlocks(serverName).find((block) => block.includes('proxy_pass https://'));

      expect(serverBlock).toBeDefined();

      expect(serverBlock).toContain('proxy_hide_header Cache-Control;');
      expect(serverBlock).toContain('expires 30d;');
      expect(serverBlock).toContain('add_header Cache-Control "public, max-age=2592000"');
    }
  });
});
