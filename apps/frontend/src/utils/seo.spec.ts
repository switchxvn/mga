import {
  buildAlternateLinks,
  buildRobotsTxt,
  buildSitemapXml,
  getRouteIndexPolicy,
  inferSeoRoute,
  sanitizeCanonicalUrl,
} from './seo';

describe('seo utils', () => {
  const siteUrl = 'https://example.test';

  it('sanitizes canonical urls and strips tracking params', () => {
    expect(
      sanitizeCanonicalUrl(
        'https://example.test/san-pham/xe-nang?utm_source=google&utm_medium=cpc&page=2',
        siteUrl,
      ),
    ).toBe('https://example.test/san-pham/xe-nang?page=2');
  });

  it('rejects foreign canonical urls', () => {
    expect(
      sanitizeCanonicalUrl('https://example.com/san-pham/xe-nang', siteUrl),
    ).toBeNull();
  });

  it('marks only seo pages as indexable', () => {
    expect(getRouteIndexPolicy('/san-pham').robots).toBe('index,follow');
    expect(getRouteIndexPolicy('/checkout').robots).toBe('noindex,nofollow');
    expect(getRouteIndexPolicy('/order-refund').indexable).toBe(false);
  });

  it('infers localized routes for detail pages', () => {
    expect(inferSeoRoute('/en/products/forklift-3t')).toEqual({
      key: 'product-detail',
      locale: 'en',
      slug: 'forklift-3t',
      path: '/en/products/forklift-3t',
    });

    expect(inferSeoRoute('/bai-viet/xe-nang-dien')).toEqual({
      key: 'post-detail',
      locale: 'vi',
      slug: 'xe-nang-dien',
      path: '/bai-viet/xe-nang-dien',
    });
  });

  it('builds alternate links for localized detail pages', () => {
    expect(
      buildAlternateLinks(siteUrl, 'product-detail', {
        currentLocale: 'vi',
        slugByLocale: {
          vi: 'xe-nang-dau',
          en: 'diesel-forklift',
        },
      }),
    ).toEqual([
      { hreflang: 'vi', href: 'https://example.test/san-pham/xe-nang-dau' },
      { hreflang: 'en', href: 'https://example.test/en/products/diesel-forklift' },
      { hreflang: 'x-default', href: 'https://example.test/san-pham/xe-nang-dau' },
    ]);
  });

  it('builds robots.txt content with sitemap and disallow rules', () => {
    const robots = buildRobotsTxt(siteUrl);

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Disallow: /checkout');
    expect(robots).toContain('Disallow: /en/checkout');
    expect(robots).toContain('Sitemap: https://example.test/sitemap.xml');
  });

  it('builds a deduplicated sitemap xml document', () => {
    const xml = buildSitemapXml([
      { loc: 'https://example.test/san-pham', lastmod: '2026-05-15T00:00:00.000Z' },
      { loc: 'https://example.test/san-pham', lastmod: '2026-05-15T00:00:00.000Z' },
      { loc: 'https://example.test/en/products' },
    ]);

    expect(xml).toContain('<loc>https://example.test/san-pham</loc>');
    expect(xml).toContain('<loc>https://example.test/en/products</loc>');
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });
});
