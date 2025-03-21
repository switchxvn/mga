<!-- VideoIntroSection.vue -->
<template>
  <section class="video-intro-section py-8">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center" v-if="section?.title">
        {{ section.title }}
      </h2>

      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <ULoader size="lg" />
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error.message }}
      </div>

      <div v-else>
        <!-- Grid Layout -->
        <div v-if="currentLayout === 'grid'" 
             class="grid gap-6" 
             :class="gridColumns">
          <div v-for="video in videoData" 
               :key="video.id"
               class="video-card group h-full">
            <div class="relative aspect-video overflow-hidden rounded-lg shadow-md mb-4">
              <img 
                :src="video.thumbnailUrl" 
                :alt="video.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  @click="playVideo(video)"
                  class="p-4 rounded-full bg-white/80 hover:bg-white transition-all transform scale-90 group-hover:scale-100"
                >
                  <Icon name="heroicons:play" class="w-8 h-8 text-primary-600" />
                </button>
              </div>
            </div>
            <div v-if="section?.settings?.showTitle" class="flex flex-col h-full">
              <h3 class="text-lg font-semibold line-clamp-1 mb-2">{{ video.title }}</h3>
              <p v-if="section?.settings?.showDescription" 
                 class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {{ video.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Slider Layout -->
        <div v-else class="max-w-5xl mx-auto">
          <Swiper
            :modules="[SwiperAutoplay, SwiperPagination, SwiperNavigation]"
            :slides-per-view="1"
            :space-between="30"
            :autoplay="section?.settings?.sliderSettings?.autoplay ? {
              delay: section.settings.sliderSettings.autoplaySpeed || 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: section.settings.sliderSettings.pauseOnHover
            } : false"
            :pagination="section?.settings?.sliderSettings?.dots ? { clickable: true } : false"
            :navigation="section?.settings?.sliderSettings?.arrows"
            class="w-full rounded-lg overflow-hidden"
          >
            <SwiperSlide v-for="video in videoData" 
                         :key="video.id"
                         class="group">
              <div class="relative aspect-video">
                <img 
                  :src="video.thumbnailUrl" 
                  :alt="video.title"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                  <div class="absolute inset-0 flex items-center justify-center">
                    <button 
                      @click="playVideo(video)"
                      class="p-4 rounded-full bg-white/80 hover:bg-white transition-all transform scale-90 group-hover:scale-100"
                    >
                      <Icon name="heroicons:play" class="w-8 h-8 text-primary-600" />
                    </button>
                  </div>
                  <div 
                    v-if="section?.settings?.showTitle" 
                    class="absolute bottom-0 left-0 right-0 p-6"
                  >
                    <h3 class="text-xl font-semibold text-white">{{ video.title }}</h3>
                    <p v-if="section?.settings?.showDescription" 
                       class="mt-2 text-gray-200 line-clamp-2">
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

    <!-- Video Modal -->
    <UModal v-model="showVideoModal" size="2xl" :ui="{ overlay: { background: 'bg-gray-900/80' } }">
      <div class="aspect-video w-full bg-black rounded-lg overflow-hidden">
        <iframe
          v-if="selectedVideo?.videoUrl"
          :src="getEmbedUrl(selectedVideo.videoUrl)"
          class="w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay as SwiperAutoplay, Pagination as SwiperPagination, Navigation as SwiperNavigation } from 'swiper/modules'
import { useTrpc } from '~/composables/useTrpc'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

interface VideoIntro {
  id: number
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  isActive: boolean
  order: number
}

interface Props {
  config: {
    id: number
    title: string
    settings: {
      layout: 'grid' | 'slider'
      columns: number
      maxItems: number
      showTitle: boolean
      showDescription: boolean
      themeId?: number
      sliderSettings?: {
        autoplay: boolean
        autoplaySpeed: number
        pauseOnHover: boolean
        arrows: boolean
        dots: boolean
      }
    }
  }
}

const props = defineProps<Props>()
const section = computed(() => props.config)
const videoData = ref<VideoIntro[]>([])
const isLoading = ref(true)
const error = ref<Error | null>(null)
const trpc = useTrpc()

// Computed property to check layout
const currentLayout = computed(() => {
  const layout = props.config?.settings?.layout
  console.log('Current layout:', layout)
  return layout || 'grid'
})

// Watch for changes in config props
watch(() => props.config, (newConfig) => {
  console.log('Config changed:', newConfig)
  console.log('Layout:', newConfig?.settings?.layout)
}, { deep: true })

// Fetch videos using tRPC
const videoQuery = trpc.hero.getHeroVideos.query({ 
  themeId: props.config?.settings?.themeId
})

onMounted(async () => {
  console.log('Component mounted')
  console.log('Initial config:', props.config)
  console.log('Initial layout:', props.config?.settings?.layout)
  
  try {
    const result = await videoQuery
    videoData.value = (result as VideoIntro[]).slice(0, props.config?.settings?.maxItems || 3)
    console.log('Fetched videos:', videoData.value)
  } catch (err) {
    console.error('Error fetching videos:', err)
    error.value = err as Error
  } finally {
    isLoading.value = false
  }
})

const gridColumns = computed(() => {
  const cols = props.config?.settings?.columns || 3
  return {
    'grid-cols-1': cols === 1,
    'grid-cols-1 md:grid-cols-2': cols === 2,
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': cols === 3,
  }
})

// Video modal handling
const showVideoModal = ref(false)
const selectedVideo = ref<VideoIntro | null>(null)

const playVideo = (video: VideoIntro) => {
  console.log('Playing video:', video)
  selectedVideo.value = video
  showVideoModal.value = true
  console.log('Modal state:', showVideoModal.value)
  console.log('Selected video URL:', getEmbedUrl(video.videoUrl))
}

// Handle image error
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement
  imgElement.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop'
}

// Helper function to convert video URL to embed URL
const getEmbedUrl = (url: string): string => {
  console.log('Converting URL:', url)
  if (!url) return ''
  
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=') 
        ? url.split('v=')[1]?.split('&')[0] 
        : url.split('/').pop()
      console.log('YouTube video ID:', videoId)
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()
      console.log('Vimeo video ID:', videoId)
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  } catch (error) {
    console.error('Error converting URL:', error)
    return ''
  }
}
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

/* Grid hover effects */
.video-card {
  @apply transition-transform duration-300 hover:-translate-y-1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-card > div:last-child {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-card h3 {
  margin-bottom: 0.5rem;
}

.video-card p {
  flex: 1;
  margin: 0;
}

/* Modal styles */
:deep(.modal-container) {
  @apply max-w-4xl relative z-50;
}

:deep(.modal-content) {
  @apply p-0 bg-transparent shadow-xl;
}

:deep(.modal-overlay) {
  @apply backdrop-blur-sm transition-all duration-300;
}
</style> 