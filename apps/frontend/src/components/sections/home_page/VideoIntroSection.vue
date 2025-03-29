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
        <div v-if="currentLayout === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="video in videoData"
            :key="video.id"
            class="video-card group relative h-[480px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div class="relative h-[280px] overflow-hidden">
              <!-- YouTube iframe -->
              <iframe
                v-if="getVideoId(video.videoUrl)"
                :src="getEmbedUrl(video.videoUrl)"
                class="w-full h-full object-cover"
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
            <div class="p-6 flex flex-col h-[200px]">
              <div class="flex-1">
                <!-- Title -->
                <h3
                  v-if="props.config?.showTitle"
                  :class="titleClasses"
                  class="line-clamp-2 mb-3"
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
                  :class="[descriptionClasses, 'line-clamp-3']"
                >
                  {{ video.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Slider Layout -->
        <div v-else class="w-full">
          <div class="swiper-container">
            <Swiper
              :modules="[Autoplay, SwiperPagination, SwiperNavigation]"
              :slides-per-view="props.config?.sliderSettings?.slidesPerView || 3"
              :space-between="24"
              :loop="true"
              :breakpoints="{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 24
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 24
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24
                }
              }"
              :autoplay="{
                delay: props.config?.sliderSettings?.autoplaySpeed || 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: props.config?.sliderSettings?.pauseOnHover || true
              }"
              :pagination="{
                clickable: true,
                dynamicBullets: true
              }"
              :navigation="true"
              class="!overflow-visible pb-12"
            >
              <SwiperSlide v-for="video in videoData" :key="video.id" class="group h-[480px]">
                <div class="video-card group relative h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div class="relative h-[280px] overflow-hidden">
                    <!-- YouTube iframe -->
                    <iframe
                      v-if="getVideoId(video.videoUrl)"
                      :src="getEmbedUrl(video.videoUrl)"
                      class="w-full h-full object-cover"
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
                  </div>
                  
                  <!-- Video Info Section -->
                  <div class="p-6 flex flex-col h-[170px]">
                    <div class="flex-1">
                      <!-- Title -->
                      <h3
                        v-if="props.config?.showTitle"
                        :class="titleClasses"
                        class="line-clamp-2 mb-3"
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
                        :class="[descriptionClasses, 'line-clamp-3']"
                      >
                        {{ video.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import {
  Autoplay,
  Pagination as SwiperPagination,
  Navigation as SwiperNavigation,
} from "swiper/modules";
import { useTrpc } from "~/composables/useTrpc";
import { useDarkMode } from "~/composables/useDarkMode";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
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
      slidesPerView?: number;
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
    videoData.value = result as VideoIntro[];
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
  position: relative;
  overflow: hidden;
}

.swiper-container {
  overflow: hidden;
  margin: 0 40px;
  
  @media (max-width: 640px) {
    margin: 0;
  }
}

.video-intro-section :deep(.swiper) {
  overflow: visible;
  margin: 0;
  padding: 0;
}

.video-intro-section :deep(.swiper-wrapper) {
  display: flex;
  align-items: stretch;
}

.video-intro-section :deep(.swiper-slide) {
  height: auto;
  display: flex;
  flex-shrink: 0;
}

.video-intro-section :deep(.swiper-button-next),
.video-intro-section :deep(.swiper-button-prev) {
  width: 40px;
  height: 40px;
  margin-top: -20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  @media (max-width: 640px) {
    display: none;
  }
  
  &::after {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--primary);
  }
  
  &:hover {
    background-color: var(--primary);
    &::after {
      color: white;
    }
  }
  
  &.swiper-button-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: white;
      &::after {
        color: var(--primary);
      }
    }
  }
}

.video-intro-section :deep(.swiper-button-prev) {
  left: 0;
}

.video-intro-section :deep(.swiper-button-next) {
  right: 0;
}

.video-intro-section :deep(.swiper-pagination) {
  position: relative;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 1rem;
}

.video-intro-section :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  margin: 0;
  background-color: var(--primary);
  opacity: 0.3;
  transition: all 0.3s ease;
  
  &-active {
    opacity: 1;
    transform: scale(1.2);
  }
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
