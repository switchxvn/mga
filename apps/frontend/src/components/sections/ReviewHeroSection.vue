<script setup lang="ts">
import { useLocalization } from '../../composables/useLocalization';

// Props cho section này
const props = defineProps({
  section: {
    type: Object,
    required: true
  }
});

const { t } = useLocalization();

// Lấy settings từ section
const settings = props.section.settings || {};

// Default values
const title = settings.title || t('reviews.title');
const description = settings.description || t('reviews.description');
const backgroundImage = settings.backgroundImage || '';
const backgroundColor = settings.backgroundColor || 'bg-primary-50 dark:bg-primary-900/20';
const textColor = settings.textColor || 'text-gray-900 dark:text-white';
const textAlignment = settings.textAlignment || 'text-center';
const paddingTop = settings.paddingTop || 'py-8 sm:py-16';
const paddingBottom = settings.paddingBottom || '';
</script>

<template>
  <div :class="[backgroundColor, paddingTop, paddingBottom]" 
       :style="backgroundImage ? `background-image: url(${backgroundImage}); background-size: cover; background-position: center;` : ''">
    <div class="container mx-auto px-4 flex flex-col items-center justify-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-4 text-center" :class="textColor">
        {{ title }}
      </h1>
      <p class="text-lg max-w-3xl text-center" :class="textColor === 'text-gray-900 dark:text-white' ? 'text-gray-600 dark:text-gray-300' : textColor">
        {{ description }}
      </p>
    </div>
  </div>
</template> 