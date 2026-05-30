import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const servicesPageSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/pages/services/index.vue',
  'utf8',
);

describe('services index sort toolbar', () => {
  it('keeps visible fallback copy for sort labels and select text', () => {
    expect(servicesPageSource).toContain(`label: t('sort.newest') || 'Mới nhất'`);
    expect(servicesPageSource).toContain(`label: t('sort.oldest') || 'Cũ nhất'`);
    expect(servicesPageSource).toContain(`label: t('sort.title_asc') || 'Tiêu đề: A-Z'`);
    expect(servicesPageSource).toContain(`label: t('sort.title_desc') || 'Tiêu đề: Z-A'`);
    expect(servicesPageSource).toContain(`{{ t("services.sortBy") || "Sắp xếp theo" }}:`);
    expect(servicesPageSource).toContain('min-w-[11rem]');
    expect(servicesPageSource).toContain('text-gray-700');
  });
});
