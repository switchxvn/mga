<!-- GalleryMasonrySection.vue -->
<template>
  <section :class="[settings.colors.background, settings.padding.top, settings.padding.bottom]">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div v-if="settings.showTitle" :class="[`text-${settings.titleAlignment}`, 'mb-8']">
        <h2 :class="[settings.colors.title, 'text-3xl font-bold mb-4']">{{ section.title }}</h2>
        <p v-if="settings.showDescription" :class="[settings.colors.description]">
          {{ description }}
        </p>
      </div>

      <!-- Masonry Gallery -->
      <div v-if="galleries?.length" class="masonry-grid" :style="gridStyle">
        <div
          v-for="(item, index) in galleries"
          :key="item.id"
          class="masonry-item"
          :style="{ marginBottom: settings.gap }"
          @click="openLightbox(index)"
        >
          <div class="relative overflow-hidden rounded-lg">
            <NuxtImg
              :src="item.image"
              :alt="item.translations?.[0]?.title || ''"
              class="w-full h-auto object-cover transition-transform duration-300"
              :class="{ 'hover:scale-110': settings.imageHoverEffect === 'zoom' }"
              loading="lazy"
            />
            <div
              v-if="settings.showTitle && item.translations?.[0]?.title"
              class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
            >
              <h3 class="text-white text-lg font-semibold">{{ item.translations[0].title }}</h3>
              <p v-if="settings.showDescription && item.translations?.[0]?.description" class="text-white/80 text-sm mt-1">
                {{ item.translations[0].description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="settings.loadMoreButton.show && hasMoreItems" class="text-center mt-8">
        <UButton
          :color="settings.loadMoreButton.style"
          :label="settings.loadMoreButton.text"
          @click="loadMore"
          :loading="isLoading"
        />
      </div>

      <!-- Lightbox -->
      <UModal v-model="isLightboxOpen" :ui="{ width: 'max-w-7xl' }">
        <div class="relative">
          <button
            class="absolute top-2 right-2 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            @click="closeLightbox"
          >
            <UIcon name="i-heroicons-x-mark" />
          </button>
          <UCarousel
            v-if="settings.lightbox.enabled"
            v-model="currentSlide"
            :items="galleries.map(g => ({
              url: g.image,
              alt: g.translations?.[0]?.title
            }))"
          >
            <template #item="{ item }">
              <img :src="item.url" :alt="item.alt" class="w-full h-auto object-contain" />
            </template>
          </UCarousel>
          <div
            v-if="settings.lightbox.showCaption && galleries[currentSlide]?.translations?.[0]"
            class="text-center mt-4"
          >
            <h3 class="text-lg font-semibold">{{ galleries[currentSlide].translations[0].title }}</h3>
            <p v-if="galleries[currentSlide].translations[0].description" class="text-sm mt-1 text-gray-600">
              {{ galleries[currentSlide].translations[0].description }}
            </p>
          </div>
        </div>
      </UModal>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ThemeSection } from '@ew/shared';
import { ref, computed } from 'vue';

const props = defineProps<{
  section: ThemeSection;
}>();

const settings = computed(() => props.section.settings);
const description = ref('Khám phá bộ sưu tập hình ảnh đa dạng của chúng tôi');

// tRPC client
const { $client } = useNuxtApp();

// State
const galleries = ref([]);
const isLoading = ref(false);
const currentPage = ref(1);
const isLightboxOpen = ref(false);
const currentSlide = ref(0);

// Computed
const hasMoreItems = computed(() => galleries.value.length < totalItems.value);
const totalItems = ref(0);

const gridStyle = computed(() => {
  const columns = settings.value.columns;
  return {
    display: 'grid',
    gap: settings.value.gap,
    gridTemplateColumns: `repeat(${columns.sm}, 1fr)`,
    '@media (min-width: 768px)': {
      gridTemplateColumns: `repeat(${columns.md}, 1fr)`,
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: `repeat(${columns.lg}, 1fr)`,
    },
    '@media (min-width: 1280px)': {
      gridTemplateColumns: `repeat(${columns.xl}, 1fr)`,
    },
  };
});

// Methods
const fetchGalleries = async () => {
  try {
    isLoading.value = true;
    const { locale } = useI18n();
    const result = await $client.gallery.active.query({ locale: locale.value });
    galleries.value = result;
    totalItems.value = result.length;
  } catch (error) {
    console.error('Error fetching galleries:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = async () => {
  if (isLoading.value || !hasMoreItems.value) return;
  currentPage.value++;
  await fetchGalleries();
};

const openLightbox = (index: number) => {
  if (!settings.value.lightbox.enabled) return;
  currentSlide.value = index;
  isLightboxOpen.value = true;
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
};

// Initial fetch
onMounted(() => {
  fetchGalleries();
});
</script>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: v-bind('settings.gap');
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: v-bind('settings.gap');
}

@media (min-width: 768px) {
  .masonry-grid {
    grid-template-columns: repeat(v-bind('settings.columns.md'), 1fr);
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    grid-template-columns: repeat(v-bind('settings.columns.lg'), 1fr);
  }
}

@media (min-width: 1280px) {
  .masonry-grid {
    grid-template-columns: repeat(v-bind('settings.columns.xl'), 1fr);
  }
}
</style> 