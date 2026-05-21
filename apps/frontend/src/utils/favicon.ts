type FaviconLike = {
  lightModeUrl?: string | null;
  darkModeUrl?: string | null;
} | null;

export function getFaviconMimeType(faviconUrl: string): string {
  if (faviconUrl.endsWith('.svg')) return 'image/svg+xml';
  if (faviconUrl.endsWith('.png')) return 'image/png';
  if (faviconUrl.endsWith('.gif')) return 'image/gif';
  return 'image/x-icon';
}

export function buildFaviconLinks(url: string) {
  const mimeType = getFaviconMimeType(url);

  return [
    {
      rel: 'icon',
      type: mimeType,
      href: url,
    },
    {
      rel: 'shortcut icon',
      type: mimeType,
      href: url,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: url,
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: url,
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: url,
    },
  ];
}

export function resolveCurrentFaviconUrl(
  favicon: FaviconLike,
  defaultFavicon = '/favicon.ico',
): string {
  if (!favicon) return defaultFavicon;

  return favicon.lightModeUrl || favicon.darkModeUrl || defaultFavicon;
}
