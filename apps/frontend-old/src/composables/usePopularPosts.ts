import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTrpc } from './useTrpc';
import type { Post } from '@ew/shared';

interface PopularPostsParams {
  limit: number;
  excludeId?: number;
  locale: string;
}

export function usePopularPosts() {
  const trpc = useTrpc();
  const { locale } = useI18n();
  const popularPosts = ref<Post[]>([]);
  const loading = ref(true);

  async function fetchPopularPosts(params: Omit<PopularPostsParams, 'locale'>) {
    try {
      loading.value = true;
      const queryParams: PopularPostsParams = {
        ...params,
        locale: locale.value
      };

      const result = await trpc.post.popular.query(queryParams);
      popularPosts.value = result;
    } catch (error) {
      console.error('Failed to fetch popular posts:', error);
      popularPosts.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    popularPosts,
    loading,
    fetchPopularPosts
  };
} 