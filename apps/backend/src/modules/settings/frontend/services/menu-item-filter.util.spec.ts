import { describe, expect, it } from 'vitest';

import { sanitizeMenuItemFilters } from './menu-item-filter.util';

describe('sanitizeMenuItemFilters', () => {
  it('removes locale before menu item repository queries', () => {
    expect(sanitizeMenuItemFilters({ locale: 'vi', parentId: 12 })).toEqual({
      parentId: 12,
    });
  });
});
