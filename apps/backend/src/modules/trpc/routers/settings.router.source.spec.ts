import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const routerSource = readFileSync(
  '/Users/abc/project/mga/apps/backend/src/modules/trpc/routers/settings.router.ts',
  'utf8',
);

const serviceSource = readFileSync(
  '/Users/abc/project/mga/apps/backend/src/modules/settings/frontend/services/settings-frontend.service.ts',
  'utf8',
);

describe('settings router menu payload source', () => {
  it('loads only flat menu rows from the database and leaves tree assembly to the router', () => {
    const findActiveMenuItemsBody = serviceSource.match(/async findActiveMenuItems[\s\S]*?}\n\n  async findActiveMenuItemById/)?.[0] ?? '';
    expect(findActiveMenuItemsBody).toContain("relations: ['translations']");
    expect(findActiveMenuItemsBody).not.toContain("relations: ['parent', 'children', 'translations']");
  });

  it('filters menu translations by requested locale and omits timestamp fields from the public payload', () => {
    expect(routerSource).toContain('const requestedLocale = input?.locale;');
    expect(routerSource).toContain('translations: requestedLocale');
    expect(routerSource).toContain('item.translations.filter((translation) => translation.locale === requestedLocale)');
    expect(routerSource).not.toContain('createdAt: item.createdAt');
    expect(routerSource).not.toContain('updatedAt: item.updatedAt');
  });
});
