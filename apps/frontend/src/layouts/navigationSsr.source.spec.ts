import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const defaultLayoutSource = readFileSync(
  resolve(__dirname, './default.vue'),
  'utf8',
);

const combinedNavbarSource = readFileSync(
  resolve(__dirname, '../components/ui/CombinedNavbar.vue'),
  'utf8',
);

const simpleNavbarSource = readFileSync(
  resolve(__dirname, '../components/ui/SimpleNavbar.vue'),
  'utf8',
);

describe('navigation SSR source', () => {
  it('preloads menu items from the default layout before render', () => {
    expect(defaultLayoutSource).toContain('const { menuItems, fetchMenuItems } = useMenuItems();');
    expect(defaultLayoutSource).toContain('!menuItems.value.length ? fetchMenuItems() : Promise.resolve()');
  });

  it('does not wait until navbar mount to load the navigation menu', () => {
    expect(combinedNavbarSource).not.toContain('await fetchMenuItems()');
    expect(simpleNavbarSource).not.toContain('await fetchMenuItems()');
  });
});
