<!-- Tourism features section -->
<script setup lang="ts">
interface Feature {
  title: string;
  image: string;
  link: string;
}

interface Props {
  settings: {
    layout?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    animation?: {
      enabled: boolean;
      type: string;
      duration: number;
      delay: number;
    };
    features: Feature[];
  };
  translations: {
    title: string;
    subtitle?: string;
    content?: string;
    data?: {
      description?: string;
    };
  };
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({ features: [] }),
  translations: () => ({ title: '' })
});
</script>

<template>
  <section 
    :class="[
      'w-full py-16',
      settings.backgroundColor || 'bg-white',
      settings.textColor || 'text-gray-900'
    ]"
    :data-aos="settings.animation?.enabled ? settings.animation.type : null"
    :data-aos-duration="settings.animation?.duration"
    :data-aos-delay="settings.animation?.delay"
  >
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4">{{ translations.title }}</h2>
        <p v-if="translations.subtitle" class="text-xl mb-4 text-gray-600">
          {{ translations.subtitle }}
        </p>
        <div v-if="translations.content" 
          class="max-w-3xl mx-auto mb-8"
          v-html="translations.content">
        </div>
        <p v-if="translations.data?.description" 
          class="text-lg text-gray-600 max-w-4xl mx-auto">
          {{ translations.data.description }}
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="feature in settings.features"
          :key="feature.title"
          :to="feature.link"
          class="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div class="aspect-w-4 aspect-h-3">
            <img 
              :src="feature.image" 
              :alt="feature.title"
              class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <h3 class="text-white text-xl font-semibold">{{ feature.title }}</h3>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.aspect-w-4 {
  position: relative;
  padding-bottom: 75%; /* 4:3 Aspect Ratio */
}

.aspect-h-3 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style> 