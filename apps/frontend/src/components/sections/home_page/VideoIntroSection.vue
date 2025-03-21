<!-- VideoIntroSection.vue -->
<template>
  <section class="video-intro-section py-8">
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
              <img
                :src="video.thumbnailUrl"
                :alt="video.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                @error="handleImageError"
              />
              <!-- Dark overlay with play button -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80"
              >
                <div class="absolute inset-0 flex items-center justify-center">
                  <button
                    @click="playVideo(video)"
                    class="p-3 rounded-full bg-white/90 hover:bg-white transform transition-all duration-300 scale-90 group-hover:scale-100 hover:scale-105 shadow-lg"
                  >
                    <PlayCircle
                      class="w-8 h-8 text-primary-600"
                      :size="32"
                      :stroke-width="2.5"
                    />
                  </button>
                </div>
              </div>
            </div>
            <!-- Video Info Section -->
            <div class="p-4">
              <div class="flex gap-3">
              
                <div class="flex-1 min-w-0">
                  <!-- Title -->
                  <h3
                    v-if="props.config?.showTitle"
                    class="font-roboto mb-1"
                    :style="{
                      fontSize: props.config?.titleStyle?.fontSize || '1.125rem',
                      fontWeight: props.config?.titleStyle?.fontWeight || '600',
                    }"
                  >
                    <a
                      v-if="props.config?.linkEnabled"
                      :href="video.videoUrl"
                      :target="props.config?.linkTarget || '_blank'"
                      rel="noopener noreferrer"
                      class="hover-title transition-colors duration-300"
                      :style="{
                        color: isDark 
                          ? props.config?.darkMode?.titleColor || '#ffffff'
                          : props.config?.titleStyle?.color || '#1a1a1a',
                        textDecoration: props.config?.titleStyle?.textDecoration || 'none',
                      }"
                    >
                      {{ video.title }}
                    </a>
                    <span v-else>{{ video.title }}</span>
                  </h3>
                  
                
                  <!-- Description -->
                  <p
                    v-if="props.config?.showDescription"
                    class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
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
                <img
                  :src="video.thumbnailUrl"
                  :alt="video.title"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
                >
                  <div class="absolute inset-0 flex items-center justify-center">
                    <button
                      @click="playVideo(video)"
                      class="p-4 rounded-full bg-white/80 hover:bg-white transition-all transform scale-90 group-hover:scale-100"
                    >
                      <PlayCircle
                        class="w-8 h-8 text-primary-600"
                        :size="32"
                        :stroke-width="2.5"
                      />
                    </button>
                  </div>
                  <div
                    v-if="props.config?.showTitle"
                    class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
                  >
                    <div class="flex gap-4 items-start">
                   

                      <div class="flex-1">
                        <!-- Title -->
                        <h3 class="text-xl font-roboto font-medium text-white mb-2">
                          {{ video.title }}
                        </h3>


                        <!-- Description -->
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
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <UModal
      v-model="showVideoModal"
      :ui="{
        overlay: { background: 'bg-gray-900/90' },
        container: 'flex items-center justify-center min-h-screen p-4',
        base: 'relative w-full max-w-5xl mx-auto',
        wrapper: 'w-full',
      }"
    >
      <div class="relative w-full h-0 pb-[56.25%] bg-black rounded-xl overflow-hidden">
        <iframe
          v-if="selectedVideo?.videoUrl"
          :src="getEmbedUrl(selectedVideo.videoUrl)"
          class="absolute top-0 left-0 w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </UModal>
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
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { PlayCircle } from "lucide-vue-next";
import { useColorMode } from '@vueuse/core'

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

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Computed property to check layout
const currentLayout = computed(() => {
  return props.config?.layout || 'grid';
});

// Watch for changes in config props
watch(
  () => props.config,
  (newConfig) => {
    console.log("Config changed:", newConfig);
    console.log("Layout:", newConfig?.layout);
  },
  { deep: true }
);

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

// Video modal handling
const showVideoModal = ref(false);
const selectedVideo = ref<VideoIntro | null>(null);

const playVideo = (video: VideoIntro) => {
  console.log("Playing video:", video);
  selectedVideo.value = video;
  showVideoModal.value = true;
  console.log("Modal state:", showVideoModal.value);
  console.log("Selected video URL:", getEmbedUrl(video.videoUrl));
};

// Handle image error
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src =
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop";
};

// Helper function to convert video URL to embed URL
const getEmbedUrl = (url: string): string => {
  console.log("Converting URL:", url);
  if (!url) return "";

  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("v=")
        ? url.split("v=")[1]?.split("&")[0]
        : url.split("/").pop();
      console.log("YouTube video ID:", videoId);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      console.log("Vimeo video ID:", videoId);
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  } catch (error) {
    console.error("Error converting URL:", error);
    return "";
  }
};
</script>

<style scoped>
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

.hover-title:hover {
  color: v-bind('isDark ? props.config?.darkMode?.titleHoverColor || "#60a5fa" : props.config?.titleStyle?.hoverColor || "#2563eb"');
  text-decoration: v-bind('props.config?.titleStyle?.hoverTextDecoration || "underline"');
}
</style>
