import { ref, onMounted, computed } from 'vue';
import { useTrpc } from './useTrpc';
import { useTheme } from './useTheme';
import type { RouterOutput } from '../types/trpc';

type LogoData = NonNullable<RouterOutput['logo']['getActiveLogo']>;

const unwrapIpxUrl = (value?: string | null): string | null => {
  if (!value) return null;

  try {
    const parsed = new URL(value, window.location.origin);
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
      ? `${parsed.origin}${decodedSourcePath}`
      : `${parsed.origin}/${decodedSourcePath}`;
  } catch {
    return value;
  }
};

export const useLogo = () => {
  const trpc = useTrpc();
  const { isDark } = useTheme();
  const logo = ref<LogoData | null>(null);
  const homeSeoTitle = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchLogo = async (type = 'main') => {
    try {
      isLoading.value = true;
      error.value = null;
      logo.value = await trpc.logo.getActiveLogo.query({ type });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching logo';
      console.error('Error fetching logo:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const currentLogoUrl = computed(() => {
    if (!logo.value) return null;
    const rawUrl = isDark.value ? logo.value.darkModeUrl : logo.value.lightModeUrl;
    return unwrapIpxUrl(rawUrl);
  });

  const currentLogoAlt = computed(() => {
    return homeSeoTitle.value || logo.value?.altText || 'Logo';
  });

  const fetchHomeSeoTitle = async () => {
    try {
      const seo = await trpc.seo.getSeoByPath.query('/');
      homeSeoTitle.value = seo?.title?.trim() || null;
    } catch (err) {
      homeSeoTitle.value = null;
      console.error('Error fetching home SEO title:', err);
    }
  };

  onMounted(() => {
    fetchLogo();
    fetchHomeSeoTitle();
  });

  return {
    logo,
    currentLogoUrl,
    currentLogoAlt,
    isLoading,
    error,
    fetchLogo
  };
};
