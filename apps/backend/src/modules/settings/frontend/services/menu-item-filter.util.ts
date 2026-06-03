export function sanitizeMenuItemFilters(
  filters: { locale?: string; [key: string]: unknown } = {},
) {
  const { locale: _locale, ...menuItemFilters } = filters;
  return menuItemFilters;
}
