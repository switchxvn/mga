<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  settings: Record<string, any>;
  translations: {
    title: string;
    subtitle?: string;
    content?: string;
  };
}

const props = defineProps<Props>();

const mapHeight = computed(() => {
  return props.settings.mapHeight || '450px';
});

const mapUrl = computed(() => {
  return props.settings.mapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.634577287642!2d105.07654807592712!3d10.685446160863476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a215d98a63f69%3A0xc8274e4e878f281!2zQ8OhcCB0cmVvIE7DumkgU2Ft!5e0!3m2!1svi!2s!4v1744503351826!5m2!1svi!2s';
});

const backgroundColor = computed(() => {
  return props.settings.backgroundColor || 'bg-gray-50 dark:bg-gray-900';
});

const textColor = computed(() => {
  return props.settings.textColor || 'text-gray-900 dark:text-white';
});

const padding = computed(() => {
  return props.settings.padding || '4rem 0';
});
</script>

<template>
  <section 
    class="w-full"
    :class="[backgroundColor, textColor]"
    :style="{ padding }"
  >
    <div class="container mx-auto px-4">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">{{ translations.title }}</h2>
        
        <p v-if="translations.subtitle" class="text-xl mb-4">
          {{ translations.subtitle }}
        </p>
        
        <p v-if="translations.content" class="text-lg max-w-3xl mx-auto">
          {{ translations.content }}
        </p>
      </div>
      
      <div class="relative w-full" :style="{ height: mapHeight }">
        <iframe 
          :src="mapUrl"
          class="absolute inset-0 w-full h-full"
          :style="{ border: 0 }"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          :allowfullscreen="true"
        />
      </div>
    </div>
  </section>
</template> 