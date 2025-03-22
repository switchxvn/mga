<!-- VideoIntroSection.vue -->
<template>
  <section 
    ref="sectionRef"
    class="video-intro-section py-8"
  >
    <div class="container mx-auto px-4">
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <ULoader size="lg" />
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error.message }}
      </div>

      <div v-else>
        <!-- Grid Layout -->
        <div v-if="currentLayout === 'grid'" class="grid gap-6" :class="gridColumns">
          <div
            v-for="video in videoData"
            :key="video.id"
            class="video-card group relative h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div class="relative h-[240px] overflow-hidden">
              <!-- YouTube iframe -->
              <iframe
                v-if="getVideoId(video.videoUrl)"
                :src="getEmbedUrl(video.videoUrl)"
                class="w-full h-full"
                :title="video.title"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              <!-- Fallback for non-YouTube videos or invalid URLs -->
              <img
                v-else
                :src="video.thumbnailUrl"
                :alt="video.title"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>
            <!-- Video Info Section -->
            <div class="p-4">
              <div class="flex gap-3">
                <div class="flex-1 min-w-0">
                  <!-- Title -->
                  <h3
                    v-if="props.config?.showTitle"
                    :class="titleClasses"
                    :style="{
                      fontSize: props.config?.titleStyle?.fontSize || '1.125rem',
                      fontWeight: props.config?.titleStyle?.fontWeight || '600'
                    }"
                  >
                    <a
                      v-if="props.config?.linkEnabled"
                      :href="video.videoUrl"
                      :target="props.config?.linkTarget || '_blank'"
                      rel="noopener noreferrer"
                      :class="linkClasses"
                      :style="{
                        textDecoration: props.config?.titleStyle?.textDecoration || 'none'
                      }"
                    >
                      {{ video.title }}
                    </a>
                    <span v-else :class="titleClasses">{{ video.title }}</span>
                  </h3>
                  
                  <!-- Description -->
                  <p
                    v-if="props.config?.showDescription"
                    :class="descriptionClasses"
                  >
                    {{ video.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider Layout -->
        <div v-else class="max-w-5xl mx-auto">
          <Swiper
            :modules="[SwiperAutoplay, SwiperPagination, SwiperNavigation]"
            :slides-per-view="1"
            :space-between="30"
            :autoplay="
              props.config?.sliderSettings?.autoplay
                ? {
                    delay: props.config.sliderSettings.autoplaySpeed || 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: props.config.sliderSettings.pauseOnHover,
                  }
                : false
            "
            :pagination="
              props.config?.sliderSettings?.dots ? { clickable: true } : false
            "
            :navigation="props.config?.sliderSettings?.arrows"
            class="w-full rounded-lg overflow-hidden"
          >
            <SwiperSlide v-for="video in videoData" :key="video.id" class="group">
              <div class="relative aspect-video">
                <!-- YouTube iframe for slider -->
                <iframe
                  v-if="getVideoId(video.videoUrl)"
                  :src="getEmbedUrl(video.videoUrl)"
                  class="w-full h-full"
                  :title="video.title"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
                <!-- Fallback for non-YouTube videos -->
                <img
                  v-else
                  :src="video.thumbnailUrl"
                  :alt="video.title"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                
                <div
                  v-if="props.config?.showTitle"
                  class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
                >
                  <div class="flex gap-4 items-start">
                    <div class="flex-1">
                      <h3 class="text-xl font-roboto font-medium text-white mb-2">
                        {{ video.title }}
                      </h3>
                      <p
                        v-if="props.config?.showDescription"
                        class="text-gray-200 text-sm line-clamp-2 max-w-3xl"
                      >
                        {{ video.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import {
  Autoplay as SwiperAutoplay,
  Pagination as SwiperPagination,
  Navigation as SwiperNavigation,
} from "swiper/modules";
import { useTrpc } from "~/composables/useTrpc";
import { useDarkMode } from "~/composables/useDarkMode";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { PlayCircle } from "lucide-vue-next";

interface VideoIntro {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  order: number;
}

interface Props {
  config?: {
    layout?: 'grid' | 'slider';
    columns?: number;
    maxItems?: number;
    showTitle?: boolean;
    showDescription?: boolean;
    themeId?: number;
    sliderSettings?: {
      autoplay?: boolean;
      autoplaySpeed?: number;
      pauseOnHover?: boolean;
      arrows?: boolean;
      dots?: boolean;
    };
    titleStyle?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      hoverColor?: string;
      textDecoration?: string;
      hoverTextDecoration?: string;
    };
    darkMode?: {
      titleColor?: string;
      titleHoverColor?: string;
    };
    linkTarget?: string;
    linkEnabled?: boolean;
  };
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    layout: 'grid',
    columns: 3,
    maxItems: 3,
    showTitle: true,
    showDescription: true
  })
});

const videoData = ref<VideoIntro[]>([]);
const isLoading = ref(true);
const error = ref<Error | null>(null);
const trpc = useTrpc();

const { isDark } = useDarkMode();
const sectionRef = ref<HTMLElement | null>(null);

const titleClasses = computed(() => {
  const baseClasses = ['font-roboto', 'mb-1', 'transition-colors', 'duration-300'];
  baseClasses.push('text-gray-900', 'dark:text-gray-100');
  return baseClasses.join(' ');
});

const linkClasses = computed(() => {
  const baseClasses = ['transition-colors', 'duration-300'];
  baseClasses.push('text-gray-900', 'dark:text-gray-100', 'hover:text-primary-600', 'dark:hover:text-primary-400');
  return baseClasses.join(' ');
});

const descriptionClasses = computed(() => {
  return ['mt-2', 'text-sm', 'text-gray-600', 'dark:text-gray-400', 'transition-colors', 'duration-300'].join(' ');
});

// Update CSS variables when theme changes
const updateThemeColors = () => {
  if (!sectionRef.value) return;
  
  const section = sectionRef.value;
  
  section.style.setProperty('--title-color', isDark.value ? '#ffffff' : '#1a1a1a');
  section.style.setProperty('--title-hover-color', isDark.value 
    ? (props.config?.darkMode?.titleHoverColor || '#60a5fa')
    : (props.config?.titleStyle?.hoverColor || '#2563eb'));
  section.style.setProperty('--description-color', isDark.value ? '#9ca3af' : '#4b5563');
};

// Watch for theme changes
watch(() => isDark.value, () => {
  updateThemeColors();
}, { immediate: true });

// Watch for config changes
watch(() => props.config, () => {
  updateThemeColors();
}, { deep: true });

// Update on mount
onMounted(() => {
  updateThemeColors();
});

// Computed property to check layout
const currentLayout = computed(() => {
  return props.config?.layout || 'grid';
});

// Fetch videos using tRPC
const videoQuery = trpc.hero.getHeroVideos.query({
  themeId: props.config?.themeId,
});

onMounted(async () => {
  console.log("Component mounted");
  console.log("Initial config:", props.config);
  console.log("Initial layout:", props.config?.layout);

  try {
    const result = await videoQuery;
    videoData.value = (result as VideoIntro[]).slice(
      0,
      props.config?.maxItems || 3
    );
    console.log("Fetched videos:", videoData.value);
  } catch (err) {
    console.error("Error fetching videos:", err);
    error.value = err as Error;
  } finally {
    isLoading.value = false;
  }
});

const gridColumns = computed(() => {
  const cols = props.config?.columns || 3;
  return {
    'grid-cols-1': cols === 1,
    'grid-cols-1 md:grid-cols-2': cols === 2,
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': cols === 3,
  };
});

// Helper function to get YouTube video ID
const getVideoId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    let videoId: string | null = null;
    
    if (url.includes('youtube.com')) {
      videoId = url.split('v=')[1]?.split('&')[0] || null;
    } else if (url.includes('youtu.be')) {
      videoId = url.split('/').pop() || null;
    }
    
    return videoId;
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
};

// Updated getEmbedUrl function
const getEmbedUrl = (url: string): string => {
  const videoId = getVideoId(url);
  if (!videoId) return '';
  
  // Add parameters for better performance and user experience
  const params = new URLSearchParams({
    autoplay: '0',
    rel: '0', // Don't show related videos
    modestbranding: '1', // Minimal YouTube branding
    enablejsapi: '1'
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

// Remove unused modal-related code and variables
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop";
};
</script>

<style scoped>
.video-intro-section {
  --title-color: #1a1a1a;
  --title-hover-color: #2563eb;
  --description-color: #4b5563;
}

.video-intro-section :deep(.swiper-pagination-bullet) {
  @apply bg-white bg-opacity-70;
}

.video-intro-section :deep(.swiper-pagination-bullet-active) {
  @apply bg-primary-600;
}

.video-intro-section :deep(.swiper-button-next),
.video-intro-section :deep(.swiper-button-prev) {
  @apply text-white;
}

/* Video card styling */
.video-card {
  @apply transform transition-all duration-300;
}

.video-card:hover {
  @apply -translate-y-1;
}

.video-card .play-button {
  @apply opacity-0 group-hover:opacity-100 transition-opacity duration-300;
}

/* Enhanced modal styles */
:deep(.modal-container) {
  @apply flex items-center justify-center min-h-screen p-4;
}

:deep(.modal-content) {
  @apply relative w-full max-w-5xl mx-auto bg-transparent rounded-xl overflow-hidden;
}

:deep(.modal-overlay) {
  @apply fixed inset-0 backdrop-blur-sm bg-black/90 transition-all duration-300;
}

:deep(.modal-wrapper) {
  @apply w-full h-full flex items-center justify-center;
}

/* YouTube-like font styling */
.font-roboto {
  font-family: "Roboto", "Arial", sans-serif;
}

/* Hover effects for video cards */
.video-card:hover .video-title {
  @apply text-gray-900 dark:text-gray-100;
}

/* Channel name hover effect */
.channel-name:hover {
  @apply text-gray-900 dark:text-gray-200;
}

/* Update hover title styles */
.hover-title {
  color: var(--title-color);
  transition: color 0.3s ease;
}

.hover-title:hover {
  color: var(--title-hover-color);
  text-decoration: v-bind('props.config?.titleStyle?.hoverTextDecoration || "underline"');
}

.title-text {
  color: var(--title-color);
  transition: color 0.3s ease;
}

.description-text {
  color: var(--description-color);
  transition: color 0.3s ease;
}

/* Add styles for iframe container */
.video-card iframe {
  aspect-ratio: 16/9;
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
}

/* Ensure proper aspect ratio in slider */
.swiper-slide iframe {
  aspect-ratio: 16/9;
  width: 100%;
  height: 100%;
}
</style>
