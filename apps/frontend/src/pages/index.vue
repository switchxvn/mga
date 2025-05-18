<script setup lang="ts">
import { useHomePage } from '../composables/useHomePage';
import { onBeforeUnmount } from 'vue';
import type { Seo } from '@ew/shared';
import { useHead } from '@unhead/vue';
import { useAsyncData } from 'nuxt/app';
import { computed, ref } from 'vue';
import { useTrpc } from '../composables/useTrpc';

const { 
  themeSections, 
  isLoading, 
  error, 
  pageIsMounted,
  resolveComponent,
  cleanup,
  getSectionConfig
} = useHomePage();

const trpc = useTrpc();

// Cleanup khi unmount
onBeforeUnmount(() => {
  cleanup();
});

const seoData = ref<Seo | null>(null);

useAsyncData('home-seo', () => 
  trpc.seo.getSeoByPath.query('/'),
  {
    server: true,
    lazy: false,
    transform: (data) => {
      seoData.value = data as Seo;
      return data;
    }
  }
);

useHead({
  title: computed(() => seoData.value?.title || 'Trang Chủ'),
  meta: computed(() => [
    { name: 'title', content: seoData.value?.title || 'Trang Chủ' },
    { property: 'og:title', content: seoData.value?.ogTitle || seoData.value?.title || 'Trang Chủ' },
    { name: 'description', content: seoData.value?.description },
    { property: 'og:description', content: seoData.value?.ogDescription || seoData.value?.description },
    { property: 'og:image', content: seoData.value?.ogImage },
    { name: 'keywords', content: seoData.value?.keywords }
  ])
});
</script>

<template>
  <div class="bg-gray-50 dark:bg-gray-900" v-if="pageIsMounted">
    <template v-if="isLoading">
      <div class="flex justify-center items-center min-h-screen">
        <ULoader size="lg" />
      </div>
    </template>
    <template v-else-if="error">
      <div class="container mx-auto px-4 py-12 text-center">
        {{ error }}
      </div>
    </template>
    <template v-else>
      <template v-if="themeSections && themeSections.length > 0">
        <template v-for="(section, index) in themeSections" :key="`section-${section.id}-${index}`">
          <ClientOnly>
            <component
              v-if="section.isActive"
              :is="resolveComponent(section)"
              :section="section"
              :config="getSectionConfig(section)"
            />
            <template #fallback>
              <div class="p-4 text-center">
                <ULoader />
              </div>
            </template>
          </ClientOnly>
        </template>
      </template>
    </template>
  </div>
</template>

<style lang="scss">
@import "@/assets/styles/components/HomePage.scss";
</style> 