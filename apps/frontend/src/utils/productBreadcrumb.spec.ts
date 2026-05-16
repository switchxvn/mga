import { describe, expect, it } from 'vitest';

import { resolveProductBreadcrumbCategory } from './productBreadcrumb';

describe('resolveProductBreadcrumbCategory', () => {
  it('prefers the first category parent when the parent has a slug', () => {
    const result = resolveProductBreadcrumbCategory(
      [
        {
          id: 10,
          translations: [
            { locale: 'vi', name: 'Xe nang dien', slug: 'xe-nang-dien' },
          ],
          parent: {
            id: 5,
            translations: [
              { locale: 'vi', name: 'Xe nang', slug: 'xe-nang' },
            ],
          },
        },
      ],
      'vi',
    );

    expect(result).toEqual({
      label: 'Xe nang',
      to: '/categories/xe-nang',
    });
  });

  it('falls back to the first category when there is no parent slug', () => {
    const result = resolveProductBreadcrumbCategory(
      [
        {
          id: 10,
          translations: [
            { locale: 'en', name: 'Electric Forklift', slug: 'electric-forklift' },
          ],
          parent: null,
        },
      ],
      'en',
    );

    expect(result).toEqual({
      label: 'Electric Forklift',
      to: '/categories/electric-forklift',
    });
  });

  it('skips categories without usable slugs and keeps searching', () => {
    const result = resolveProductBreadcrumbCategory(
      [
        {
          id: 10,
          translations: [
            { locale: 'vi', name: 'Khong hop le', slug: '' },
          ],
          parent: null,
        },
        {
          id: 11,
          translations: [
            { locale: 'vi', name: 'Xe dien', slug: 'xe-dien' },
          ],
          parent: null,
        },
      ],
      'vi',
    );

    expect(result).toEqual({
      label: 'Xe dien',
      to: '/categories/xe-dien',
    });
  });
});
