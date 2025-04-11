<!-- Tourism cultural section -->
<script setup lang="ts">
interface Props {
  settings: {
    layout?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    imagePosition?: 'left' | 'right';
    animation?: {
      enabled: boolean;
      type: string;
      duration: number;
      delay: number;
    };
    images: string[];
  };
  translations: {
    title: string;
    subtitle?: string;
    content?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  settings: () => ({ images: [], imagePosition: 'right' }),
  translations: () => ({ title: '' })
});

// Generate unique keys for images
const imageKeys = props.settings.images.map((_, index) => `cultural-image-${index}`);
</script>

<template>
  <section 
    :class="[
      'w-full py-16',
      settings.backgroundColor || 'bg-gray-50',
      settings.textColor || 'text-gray-900'
    ]"
    :data-aos="settings.animation?.enabled ? settings.animation.type : null"
    :data-aos-duration="settings.animation?.duration"
    :data-aos-delay="settings.animation?.delay"
  >
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Text Content -->
        <div 
          :class="[
            'prose-content',
            settings.imagePosition === 'left' ? 'order-2 lg:order-2' : 'order-2 lg:order-1'
          ]"
          data-aos="fade-up"
          :data-aos-duration="settings.animation?.duration"
          :data-aos-delay="settings.animation?.delay"
        >
          <h2 class="text-4xl font-bold mb-4">{{ translations.title }}</h2>
          <p v-if="translations.subtitle" class="text-xl mb-6 text-gray-600">
            {{ translations.subtitle }}
          </p>
          <div v-if="translations.content" 
            class="prose prose-lg prose-stone dark:prose-invert max-w-none"
            v-html="translations.content">
          </div>
        </div>

        <!-- Images -->
        <div :class="[
          'grid grid-cols-2 gap-4',
          settings.imagePosition === 'left' ? 'order-1 lg:order-1' : 'order-1 lg:order-2'
        ]">
          <div v-for="(image, index) in settings.images" 
            :key="imageKeys[index]"
            class="relative overflow-hidden rounded-lg shadow-lg"
            :class="{
              'mt-8 aspect-[3/4]': index === 0,
              '-mt-4 mb-4 aspect-[3/5]': index === 1
            }"
            :data-aos="settings.imagePosition === 'left' ? 'fade-right' : 'fade-left'"
            :data-aos-duration="1000"
            :data-aos-delay="index * 200 + 200"
          >
            <img 
              :src="image" 
              :alt="`Cultural image ${index + 1}`"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.prose-content :deep(.prose) {
  max-width: 100%;
}

.prose-content :deep(.prose p) {
  margin-bottom: 1.5em;
  line-height: 1.8;
}

.prose-content :deep(.prose strong) {
  color: inherit;
  font-weight: 600;
}

.prose-content :deep(.prose em) {
  color: inherit;
  font-style: italic;
}

.prose-content :deep(.prose a) {
  color: #2563eb;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.prose-content :deep(.prose a:hover) {
  color: #1d4ed8;
  text-decoration-thickness: 2px;
}

.prose-content :deep(.prose ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 1.5em 0;
}

.prose-content :deep(.prose ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 1.5em 0;
}

.prose-content :deep(.prose li) {
  margin: 0.5em 0;
}

.prose-content :deep(.prose h3) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 1.5em 0 1em;
}

.prose-content :deep(.prose h4) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1.5em 0 1em;
}
</style> 