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
          <div class="title-wrapper relative mb-8">
            <h2 class="text-4xl md:text-5xl font-bold relative z-10 leading-tight text-primary-600 hover:text-primary-700 transition-colors duration-300">
              {{ translations.title }}
            </h2>
          </div>
          <p v-if="translations.subtitle" 
            class="text-xl md:text-2xl mb-8 text-gray-600 font-medium leading-relaxed">
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
            class="relative overflow-hidden rounded-lg shadow-lg group"
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
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.title-wrapper {
  display: inline-block;
}

.title-wrapper:hover .title-accent {
  transform: scale(1.5) translate(5px, -5px);
  opacity: 0.15;
}

.-z-1 {
  z-index: -1;
}

.prose-content :deep(.prose) {
  max-width: 100%;
}

.prose-content :deep(.prose p) {
  margin-bottom: 1.5em;
  line-height: 1.8;
  font-weight: 500;
}

.prose-content :deep(.prose strong) {
  color: inherit;
  font-weight: 700;
}

.prose-content :deep(.prose em) {
  color: inherit;
  font-style: italic;
  font-weight: 500;
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

.prose-content :deep(.prose li) {
  margin: 0.5em 0;
  font-weight: 600;
}

.prose-content :deep(.prose ul), 
.prose-content :deep(.prose ol) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 1.5em 0;
  font-weight: 600;
}

.prose-content :deep(.prose ul li::marker),
.prose-content :deep(.prose ol li::marker) {
  color: currentColor;
  font-weight: 700;
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