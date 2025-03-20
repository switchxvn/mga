<script setup lang="ts">
interface CompanyIntroConfig {
  layout: 'left-image' | 'right-image' | 'full-text';
  title: string;
  description: string;
  image?: string;
  stats?: Array<{
    id: string;
    value: string;
    label: string;
  }>;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  maxWidth?: string;
  border?: {
    width: string;
    style: string;
    color: string;
    radius: string;
  };
  buttonStyle?: {
    padding: string;
    fontSize: string;
    fontWeight: string;
  };
}

defineProps<{
  config?: CompanyIntroConfig;
}>();

const getBorderStyles = (config: CompanyIntroConfig) => {
  if (!config.border) return {};
  
  return {
    border: `${config.border.width} ${config.border.style} ${config.border.color}`,
    borderRadius: config.border.radius,
    padding: '2rem'
  };
};

const getButtonStyles = (config: CompanyIntroConfig) => {
  if (!config.buttonStyle) return {};

  return {
    padding: config.buttonStyle.padding,
    fontSize: config.buttonStyle.fontSize,
    fontWeight: config.buttonStyle.fontWeight
  };
};
</script>

<template>
  <section 
    v-if="config"
    class="company-intro py-16"
    :style="{
      backgroundColor: config.backgroundColor || 'var(--background)',
      color: config.textColor || 'var(--text)'
    }"
  >
    <div class="container mx-auto px-4">
      <!-- Full Text Layout -->
      <div v-if="config.layout === 'full-text'" 
        :style="{ 
          maxWidth: config.maxWidth || '800px',
          ...getBorderStyles(config)
        }"
        class="text-center mx-auto"
      >
        <h2 class="text-3xl md:text-4xl font-bold mb-6">{{ config.title }}</h2>
        <div class="prose dark:prose-invert max-w-none mb-8 mx-auto" v-html="config.description"></div>

        <!-- Stats Grid for full-text layout -->
        <div v-if="config.stats" class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div v-for="stat in config.stats" :key="stat.id" class="text-center">
            <div class="text-3xl font-bold text-primary mb-2">{{ stat.value }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ stat.label }}</div>
          </div>
        </div>

        <!-- CTA Button for full-text layout -->
        <UButton
          v-if="config.buttonText && config.buttonLink"
          :to="config.buttonLink"
          color="primary"
          variant="solid"
          class="mt-4 inline-block"
          :style="getButtonStyles(config)"
        >
          {{ config.buttonText }}
        </UButton>
      </div>

      <!-- Image Layouts -->
      <div v-else class="flex flex-col md:flex-row items-center gap-8">
        <!-- Image Section -->
        <div 
          v-if="config.image"
          :class="[
            'w-full md:w-1/2',
            config.layout === 'right-image' ? 'md:order-2' : ''
          ]"
        >
          <img 
            :src="config.image" 
            :alt="config.title"
            class="rounded-lg shadow-xl w-full h-auto object-cover"
          />
        </div>

        <!-- Content Section -->
        <div 
          :class="[
            'w-full',
            config.image ? 'md:w-1/2' : 'md:w-3/4 mx-auto',
            config.layout === 'right-image' ? 'md:order-1' : ''
          ]"
          :style="getBorderStyles(config)"
        >
          <h2 class="text-3xl md:text-4xl font-bold mb-6">{{ config.title }}</h2>
          <div class="prose dark:prose-invert max-w-none mb-8" v-html="config.description"></div>

          <!-- Stats Grid -->
          <div v-if="config.stats" class="grid grid-cols-2 gap-6 mb-8">
            <div v-for="stat in config.stats" :key="stat.id" class="text-center">
              <div class="text-3xl font-bold text-primary mb-2">{{ stat.value }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ stat.label }}</div>
            </div>
          </div>

          <!-- CTA Button -->
          <UButton
            v-if="config.buttonText && config.buttonLink"
            :to="config.buttonLink"
            color="primary"
            variant="solid"
            class="mt-4 inline-block"
            :style="getButtonStyles(config)"
          >
            {{ config.buttonText }}
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.prose {
  max-width: 65ch;
}

:deep(.button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;
}
</style> 