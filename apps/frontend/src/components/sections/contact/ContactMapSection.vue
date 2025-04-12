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

const mapLocation = computed(() => {
  return props.settings.mapLocation || { lat: 10.87717, lng: 106.699738 };
});

const mapZoom = computed(() => {
  return props.settings.mapZoom || 15;
});

const mapMarkerTitle = computed(() => {
  return props.settings.mapMarkerTitle || 'XE NẴNG MGA';
});

const mapMarkerContent = computed(() => {
  return props.settings.mapMarkerContent || 'Our office location';
});

const mapUrl = computed(() => {
  const { lat, lng } = mapLocation.value;
  return `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d62690.194726882335!2d${lng}!3d${lat}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752643a6346cdb%3A0xcae53b6254821669!2sXE%20N%C3%82NG%20MGA!5e0!3m2!1sen!2sus!4v1743313705151!5m2!1sen!2sus`;
});

const backgroundColor = computed(() => {
  return props.settings.backgroundColor || 'bg-gray-50 dark:bg-gray-900';
});

const textColor = computed(() => {
  return props.settings.textColor || 'text-gray-900 dark:text-white';
});

const padding = computed(() => {
  return props.settings.padding || '0';
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