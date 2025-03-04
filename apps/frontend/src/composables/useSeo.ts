import { ref } from 'vue';
import { useTrpc } from './useTrpc';
import { TRPCClientError } from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/modules/trpc/trpc.router';

type RouterOutput = inferRouterOutputs<AppRouter>;
type SeoOutput = RouterOutput['seo']['getSeoByPath'];

export function useSeo() {
  const trpc = useTrpc();
  const seoData = ref<SeoOutput | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getSeoByPath = async (path: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      const seo = await trpc.seo.getSeoByPath.query(path);
      seoData.value = seo;
      return seo;
    } catch (err) {
      if (err instanceof TRPCClientError) {
        error.value = err.message;
      } else {
        error.value = 'Đã xảy ra lỗi khi tải thông tin SEO';
      }
      console.error('Error fetching SEO:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    seoData,
    isLoading,
    error,
    getSeoByPath,
  };
} 