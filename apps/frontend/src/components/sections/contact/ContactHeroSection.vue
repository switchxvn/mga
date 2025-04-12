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

const heroStyle = computed(() => {
  const { heroHeight, heroBackgroundImage, heroOverlayOpacity } = props.settings;
  return {
    height: heroHeight || '400px',
    backgroundImage: heroBackgroundImage ? `url(${heroBackgroundImage})` : 'none',
    '--overlay-opacity': heroOverlayOpacity || 0.6
  };
});

const textColor = computed(() => {
  return props.settings.textColor || 'text-white';
});

const backgroundColor = computed(() => {
  return props.settings.backgroundColor || '';
});

const padding = computed(() => {
  return props.settings.padding || '0';
});
</script>

<template>
  <section 
    class="relative w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
    :class="[backgroundColor, textColor]"
    :style="heroStyle"
  >
    <div 
      class="absolute inset-0 bg-black" 
      :style="{ opacity: `var(--overlay-opacity)` }"
    ></div>
    
    <div 
      class="container mx-auto px-4 relative z-10 text-center"
      :style="{ padding }"
    >
      <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ translations.title }}</h1>
      
      <p v-if="translations.subtitle" class="text-xl md:text-2xl mb-6">
        {{ translations.subtitle }}
      </p>
      
      <p v-if="translations.content" class="text-lg max-w-3xl mx-auto">
        {{ translations.content }}
      </p>
    </div>
  </section>
</template> 