import { computed } from 'vue';
import { refreshNuxtData, useAsyncData } from 'nuxt/app';
import { useTrpc } from './useTrpc';
import { useTheme } from './useTheme';
import type { RouterOutput } from '../types/trpc';

type LogoData = NonNullable<RouterOutput['logo']['getActiveLogo']>;

const unwrapIpxUrl = (value?: string | null): string | null => {
  if (!value) return null;

  try {
    const parsed = new URL(value, 'http://localhost');
    if (!parsed.pathname.startsWith('/_ipx/')) {
      return value;
    }

    const queryTarget = parsed.searchParams.get('url');
    if (queryTarget) {
      return decodeURIComponent(queryTarget);
    }

    const pathMatch = parsed.pathname.match(/^\/_ipx\/[^/]+\/(.+)$/);
    const sourcePath = pathMatch?.[1];
    if (!sourcePath) {
      return value;
    }

    const decodedSourcePath = decodeURIComponent(sourcePath);
    if (/^https?:\/\//i.test(decodedSourcePath)) {
      return decodedSourcePath;
    }

    return decodedSourcePath.startsWith('/')
      ? decodedSourcePath
      : `/${decodedSourcePath}`;
  } catch {
    return value;
  }
};

export const useLogo = async (type = 'main') => {
  const trpc = useTrpc();
  const { isDark } = useTheme();

  const { data: logo, pending: isLoading, error } = await useAsyncData(
    `logo-${type}`,
    async () => {
      const result = await trpc.logo.getActiveLogo.query({ type });
      return (result ?? null) as LogoData | null;
    },
    {
      default: () => null,
    }
  );

  const { data: homeSeoTitle } = await useAsyncData(
    'logo-home-seo-title',
    async () => {
      const seo = await trpc.seo.getSeoByPath.query('/');
      return seo?.title?.trim() || null;
    },
    {
      default: () => null,
    }
  );

  const currentLogoUrl = computed(() => {
    if (!logo.value) return null;
    const rawUrl = isDark.value ? logo.value.darkModeUrl : logo.value.lightModeUrl;
    return unwrapIpxUrl(rawUrl);
  });

  const currentLogoAlt = computed(() => {
    return homeSeoTitle.value || logo.value?.altText || 'Logo';
  });

  const fetchLogo = async () => {
    await refreshNuxtData(`logo-${type}`);
  };

  return {
    logo,
    currentLogoUrl,
    currentLogoAlt,
    isLoading,
    error,
    fetchLogo,
  };
};
