import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const serviceDetailSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/services/[slug].vue',
  'utf8',
);

describe('service detail source', () => {
  it('passes translation address into local business schema generation', () => {
    expect(serviceDetailSource).toContain("address: currentTranslation.value?.address");
  });
});
