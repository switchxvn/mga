<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps<{
  src?: string | null;
  alt: string;
  width?: string | number;
  height?: string | number;
  class?: string;
}>();

const defaultImage = '/images/default-image.jpg';
const imageError = ref(false);
const isLoaded = ref(false);
const isMounted = ref(false);

const imageSrc = computed(() => {
  if (imageError.value || !props.src) {
    return defaultImage;
  }
  return props.src;
});

const handleError = () => {
  imageError.value = true;
};

const handleLoad = () => {
  isLoaded.value = true;
};

onMounted(() => {
  isMounted.value = true;
  
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.src = imageSrc.value;
    
    if (img.complete) {
      isLoaded.value = true;
    } else {
      img.onload = () => {
        isLoaded.value = true;
      };
      img.onerror = () => {
        imageError.value = true;
      };
    }
  }
});
</script>

<template>
  <div class="relative overflow-hidden" :class="class">
    <img
      :src="imageSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="isMounted ? 'lazy' : 'eager'"
      @error="handleError"
      @load="handleLoad"
      class="transition-opacity duration-300"
      :class="{
        'opacity-100': isLoaded || !isMounted,
        'opacity-0': !isLoaded && isMounted
      }"
    />
    <div
      v-if="(!isLoaded && isMounted)"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
    ></div>
  </div>
</template> 