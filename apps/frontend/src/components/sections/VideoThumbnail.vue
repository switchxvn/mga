<template>
  <div class="relative w-full h-full">
    <img :src="video.thumbnailUrl" 
         :alt="video.title"
         @error="handleImageError"
         class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
    
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
    
    <!-- Play button overlay -->
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
        <div class="i-heroicons-play-solid w-6 h-6 text-white"></div>
      </div>
    </div>
    
    <!-- Caption overlay -->
    <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
      <h3 class="font-medium text-sm md:text-base line-clamp-1 group-hover:text-primary-300 transition-colors">
        {{ video.title }}
      </h3>
      <p v-if="video.description" class="text-xs text-white/80 line-clamp-2 mt-1 group-hover:text-white transition-colors">
        {{ video.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { VideoThumbnail as VideoThumbnailType } from '~/types';

defineProps({
  video: {
    type: Object as PropType<VideoThumbnailType>,
    required: true
  }
});

const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop';
};
</script> 