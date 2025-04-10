<!-- Hero section for about page -->
<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  settings: {
    heroHeight?: string;
    heroBackgroundImage?: string;
    heroOverlayOpacity?: number;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    animation?: {
      enabled: boolean;
      type: string;
      duration: number;
      delay: number;
    };
  };
  translations: {
    title: string;
    subtitle?: string;
    content?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({}),
  translations: () => ({ title: '' })
});

const sectionStyle = computed(() => ({
  height: props.settings.heroHeight || '500px',
  backgroundColor: props.settings.backgroundColor || 'transparent',
  color: props.settings.textColor || 'inherit',
  padding: props.settings.padding || '4rem 0',
  backgroundImage: props.settings.heroBackgroundImage ? `url(${props.settings.heroBackgroundImage})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative' as const
}));

const overlayStyle = computed(() => ({
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'black',
  opacity: props.settings.heroOverlayOpacity || 0.5,
  zIndex: 1
}));

const contentStyle = computed(() => ({
  position: 'relative' as const,
  zIndex: 2
}));
</script>

<template>
  <section 
    class="w-full flex items-center justify-center"
    :style="sectionStyle"
    :data-aos="settings.animation?.enabled ? settings.animation.type : null"
    :data-aos-duration="settings.animation?.duration"
    :data-aos-delay="settings.animation?.delay"
  >
    <div v-if="settings.heroBackgroundImage" :style="overlayStyle"></div>
    
    <div class="container mx-auto px-4" :style="contentStyle">
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {{ translations.title }}
        </h1>
        <p v-if="translations.subtitle" class="text-xl md:text-2xl mb-6">
          {{ translations.subtitle }}
        </p>
        <div v-if="translations.content" class="prose dark:prose-invert mx-auto" v-html="translations.content"></div>
      </div>
    </div>
  </section>
</template> 