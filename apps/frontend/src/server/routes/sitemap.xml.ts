import type { H3Event } from 'h3';
import { defineEventHandler, setHeader } from 'h3';
import { useRuntimeConfig } from '#imports';
import { fetchTrpcQuery } from '../utils/trpc';
import {
  buildLocalizedPath,
  buildSitemapXml,
  buildAbsoluteUrl,
  type SeoLocale,
  type SeoRouteKey,
  type SitemapEntry,
} from '../../utils/seo';

interface LocalizedEntityState {
  id: number | string;
  updatedAt?: string;
  createdAt?: string;
  type?: string;
  slugs: Partial<Record<SeoLocale, string>>;
}

interface ProductListResponse {
  items: Array<{
    id: number;
    type: string;
    createdAt?: string;
    updatedAt?: string;
    translations?: Array<{ locale: SeoLocale; slug?: string }>;
  }>;
  totalPages: number;
}

interface PostListResponse {
  items: Array<{
    id: number;
    createdAt?: string;
    updatedAt?: string;
    translations?: Array<{ locale: SeoLocale; slug?: string }>;
  }>;
  totalPages: number;
}

interface LocalizedItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  translations?: Array<{ locale: SeoLocale; slug?: string }>;
}

const STATIC_ROUTE_KEYS: SeoRouteKey[] = [
  'home',
  'about',
  'contact',
  'gallery',
  'products',
  'tickets',
  'posts',
  'services',
  'categories',
  'ticket-pricing',
  'menu',
];

const CANONICAL_STATIC_ROUTE_KEYS: SeoRouteKey[] = ['about', 'posts', 'services', 'products'];
const VI_ONLY_STATIC_ROUTE_KEYS = new Set<SeoRouteKey>(['home', 'gallery', 'categories', 'tickets']);

function shouldIncludeStaticLocale(routeKey: SeoRouteKey, locale: SeoLocale): boolean {
  if (CANONICAL_STATIC_ROUTE_KEYS.includes(routeKey)) {
    return locale === 'vi';
  }

  if (VI_ONLY_STATIC_ROUTE_KEYS.has(routeKey)) {
    return locale === 'vi';
  }

  return true;
}

function resolveSitemapDetailPath(
  routeKey: SeoRouteKey,
  slugs: Partial<Record<SeoLocale, string>>,
): string | null {
  const locale: SeoLocale = slugs.vi ? 'vi' : 'en';
  const slug = slugs[locale];

  if (!slug) {
    return null;
  }

  return buildLocalizedPath(routeKey, locale, slug);
}

function getEntityLastModified(item: LocalizedEntityState): string | undefined {
  return item.updatedAt || item.createdAt;
}

function mergeLocalizedItems(
  target: Map<number | string, LocalizedEntityState>,
  locale: SeoLocale,
  items: LocalizedItem[],
  typeResolver?: (item: LocalizedItem) => string | undefined,
) {
  for (const item of items) {
    const existing = target.get(item.id) || {
      id: item.id,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
      slugs: {},
    };

    existing.updatedAt = existing.updatedAt || item.updatedAt;
    existing.createdAt = existing.createdAt || item.createdAt;
    existing.type = existing.type || typeResolver?.(item);

    const directTranslation = item.translations?.find((translation) => translation.locale === locale);
    if (directTranslation?.slug) {
      existing.slugs[locale] = directTranslation.slug;
    }

    for (const translation of item.translations || []) {
      if (translation.slug) {
        existing.slugs[translation.locale] = translation.slug;
      }
    }

    target.set(item.id, existing);
  }
}

async function fetchAllProducts(event: H3Event, locale: SeoLocale) {
  const items: ProductListResponse['items'] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await fetchTrpcQuery<ProductListResponse>(event, 'product.getAll', {
      locale,
      page,
      limit: 50,
    });

    items.push(...(result?.items || []));
    totalPages = result?.totalPages || 1;
    page += 1;
  }

  return items;
}

async function fetchAllPosts(event: H3Event, locale: SeoLocale) {
  const items: PostListResponse['items'] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await fetchTrpcQuery<PostListResponse>(event, 'post.byLocale', {
      locale,
      page,
      limit: 50,
    });

    items.push(...(result?.items || []));
    totalPages = result?.totalPages || 1;
    page += 1;
  }

  return items;
}

async function buildDynamicEntries(event: H3Event, siteUrl: string): Promise<SitemapEntry[]> {
  const [viProducts, enProducts, viPosts, enPosts, viCategories, enCategories, viServices, enServices] = await Promise.all([
    fetchAllProducts(event, 'vi'),
    fetchAllProducts(event, 'en'),
    fetchAllPosts(event, 'vi'),
    fetchAllPosts(event, 'en'),
    fetchTrpcQuery<LocalizedItem[]>(event, 'category.all', { locale: 'vi' }),
    fetchTrpcQuery<LocalizedItem[]>(event, 'category.all', { locale: 'en' }),
    fetchTrpcQuery<LocalizedItem[]>(event, 'service.all', { locale: 'vi' }),
    fetchTrpcQuery<LocalizedItem[]>(event, 'service.all', { locale: 'en' }),
  ]);

  const productMap = new Map<number | string, LocalizedEntityState>();
  const postMap = new Map<number | string, LocalizedEntityState>();
  const categoryMap = new Map<number | string, LocalizedEntityState>();
  const serviceMap = new Map<number | string, LocalizedEntityState>();

  mergeLocalizedItems(productMap, 'vi', viProducts, (item) => (item as ProductListResponse['items'][number]).type);
  mergeLocalizedItems(productMap, 'en', enProducts, (item) => (item as ProductListResponse['items'][number]).type);
  mergeLocalizedItems(postMap, 'vi', viPosts);
  mergeLocalizedItems(postMap, 'en', enPosts);
  mergeLocalizedItems(categoryMap, 'vi', viCategories);
  mergeLocalizedItems(categoryMap, 'en', enCategories);
  mergeLocalizedItems(serviceMap, 'vi', viServices);
  mergeLocalizedItems(serviceMap, 'en', enServices);

  const entries: SitemapEntry[] = [];

  for (const product of productMap.values()) {
    const routeKey: SeoRouteKey = product.type === 'TICKET' ? 'ticket-detail' : 'product-detail';
    const path = resolveSitemapDetailPath(routeKey, product.slugs);
    if (path) {
      entries.push({
        loc: buildAbsoluteUrl(siteUrl, path),
        lastmod: getEntityLastModified(product),
      });
    }
  }

  for (const post of postMap.values()) {
    const path = resolveSitemapDetailPath('post-detail', post.slugs);
    if (path) {
      entries.push({
        loc: buildAbsoluteUrl(siteUrl, path),
        lastmod: getEntityLastModified(post),
      });
    }
  }

  for (const category of categoryMap.values()) {
    const path = resolveSitemapDetailPath('category-detail', category.slugs);
    if (path) {
      entries.push({
        loc: buildAbsoluteUrl(siteUrl, path),
        lastmod: getEntityLastModified(category),
      });
    }
  }

  for (const service of serviceMap.values()) {
    const path = resolveSitemapDetailPath('service-detail', service.slugs);
    if (path) {
      entries.push({
        loc: buildAbsoluteUrl(siteUrl, path),
        lastmod: getEntityLastModified(service),
      });
    }
  }

  return entries;
}

function buildStaticEntries(siteUrl: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  entries.push({ loc: buildAbsoluteUrl(siteUrl, '/llms.txt') });

  for (const routeKey of STATIC_ROUTE_KEYS) {
    const viPath = buildLocalizedPath(routeKey, 'vi');
    const enPath = buildLocalizedPath(routeKey, 'en');

    if (viPath && shouldIncludeStaticLocale(routeKey, 'vi')) {
      entries.push({ loc: buildAbsoluteUrl(siteUrl, viPath) });
    }

    if (enPath && shouldIncludeStaticLocale(routeKey, 'en')) {
      entries.push({ loc: buildAbsoluteUrl(siteUrl, enPath) });
    }
  }

  return entries;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = config.public.siteUrl;
  const dynamicEntries = await buildDynamicEntries(event, siteUrl);
  const staticEntries = buildStaticEntries(siteUrl);
  const xml = buildSitemapXml([...staticEntries, ...dynamicEntries]);

  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  return xml;
});
