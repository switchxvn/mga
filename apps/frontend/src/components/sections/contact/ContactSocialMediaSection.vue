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

const socialLinks = computed(() => {
  return props.settings.socialLinks || [];
});

const backgroundColor = computed(() => {
  return props.settings.backgroundColor || 'bg-white dark:bg-gray-800';
});

const textColor = computed(() => {
  return props.settings.textColor || 'text-gray-900 dark:text-white';
});

const padding = computed(() => {
  return props.settings.padding || '4rem 0';
});

const socialLayout = computed(() => {
  return props.settings.socialLayout || 'grid';
});

const socialColumns = computed(() => {
  return props.settings.socialColumns || 4;
});

const getIconName = (platform: string) => {
  const platformLower = platform.toLowerCase();
  
  switch (platformLower) {
    case 'facebook':
      return 'i-simple-icons-facebook';
    case 'twitter':
      return 'i-simple-icons-twitter';
    case 'instagram':
      return 'i-simple-icons-instagram';
    case 'linkedin':
      return 'i-simple-icons-linkedin';
    case 'youtube':
      return 'i-simple-icons-youtube';
    case 'pinterest':
      return 'i-simple-icons-pinterest';
    case 'tiktok':
      return 'i-simple-icons-tiktok';
    default:
      return 'i-simple-icons-globe';
  }
};
</script>

<template>
  <section 
    class="w-full"
    :class="[backgroundColor, textColor]"
    :style="{ padding }"
  >
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">{{ translations.title }}</h2>
        
        <p v-if="translations.subtitle" class="text-xl mb-4">
          {{ translations.subtitle }}
        </p>
        
        <p v-if="translations.content" class="text-lg max-w-3xl mx-auto">
          {{ translations.content }}
        </p>
      </div>
      
      <!-- Grid Layout -->
      <div v-if="socialLayout === 'grid'" class="max-w-4xl mx-auto">
        <div 
          class="grid gap-6"
          :class="{
            'grid-cols-2': socialColumns === 2,
            'grid-cols-3': socialColumns === 3,
            'grid-cols-4': socialColumns === 4,
            'grid-cols-1': socialColumns === 1
          }"
        >
          <a 
            v-for="(social, index) in socialLinks" 
            :key="index"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-300"
          >
            <div 
              class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              :style="{ backgroundColor: social.color || '#000000' }"
            >
              <UIcon 
                :name="getIconName(social.platform)"
                class="w-8 h-8 text-white"
              />
            </div>
            <span class="font-medium">{{ social.platform }}</span>
          </a>
        </div>
      </div>
      
      <!-- List Layout -->
      <div v-else class="max-w-2xl mx-auto">
        <div class="space-y-4">
          <a 
            v-for="(social, index) in socialLinks" 
            :key="index"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-300"
          >
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              :style="{ backgroundColor: social.color || '#000000' }"
            >
              <UIcon 
                :name="getIconName(social.platform)"
                class="w-6 h-6 text-white"
              />
            </div>
            <span class="font-medium">{{ social.platform }}</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template> 