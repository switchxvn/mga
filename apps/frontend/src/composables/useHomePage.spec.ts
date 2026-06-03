import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/composables/useHomePage.ts',
  'utf8',
);

describe('useHomePage locale priority', () => {
  it('awaits the homepage SSR payload before rendering the page', () => {
    expect(source).toContain('export async function useHomePage() {');
    expect(source).toContain("const { data: pageData } = await useAsyncData('home-theme', async () => {");
  });

  it('uses the current normalized locale directly during SSR homepage resolution', () => {
    expect(source).toContain("const resolvedLocale = computed(() => normalizeLocaleCode(locale.value, 'vi'));");
    expect(source).toContain('const currentLocale = resolvedLocale.value;');
    expect(source).not.toContain("const defaultLocale = ref('vi');");
    expect(source).not.toContain('trpc.language.getDefaultLanguage.query()');
  });

  it('serializes homepage sections into the async payload so hydration matches SSR', () => {
    expect(source).toContain('return {');
    expect(source).toContain('themeId: activeTheme?.id ?? null,');
    expect(source).toContain('themeSections: fetchedSections,');
    expect(source).toContain('theme.value = (pageData.value?.theme ?? null) as Theme | null;');
    expect(source).toContain('themeSections.value = pageData.value?.themeSections ?? [];');
  });

  it('keeps the SSR payload lightweight instead of serializing the full active theme graph', () => {
    expect(source).not.toContain('return { theme: activeTheme };');
  });
});
