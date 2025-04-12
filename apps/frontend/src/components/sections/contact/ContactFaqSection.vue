<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  settings: Record<string, any>;
  translations: {
    title: string;
    subtitle?: string;
    content?: string;
    data?: Record<string, any>;
  };
}

const props = defineProps<Props>();

const faqs = computed(() => {
  if (props.translations.data?.faqs) {
    return props.translations.data.faqs;
  }
  return props.settings.faqs || [];
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

const faqLayout = computed(() => {
  return props.settings.faqLayout || 'accordion';
});

// For accordion layout
const openItems = ref<number[]>([]);

const toggleItem = (index: number) => {
  const position = openItems.value.indexOf(index);
  if (position === -1) {
    openItems.value.push(index);
  } else {
    openItems.value.splice(position, 1);
  }
};

const isItemOpen = (index: number) => {
  return openItems.value.includes(index);
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
      
      <div class="max-w-3xl mx-auto">
        <!-- Accordion Layout -->
        <div v-if="faqLayout === 'accordion'" class="space-y-4">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button 
              class="w-full flex justify-between items-center p-4 text-left font-medium"
              :class="isItemOpen(index) ? 'bg-gray-50 dark:bg-gray-800' : ''"
              @click="toggleItem(index)"
            >
              <span>{{ faq.question }}</span>
              <span class="ml-4">
                <UIcon 
                  :name="isItemOpen(index) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
                  class="w-5 h-5"
                />
              </span>
            </button>
            
            <div 
              v-if="isItemOpen(index)"
              class="p-4 border-t border-gray-200 dark:border-gray-700"
            >
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        
        <!-- Grid Layout -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
          >
            <h3 class="text-lg font-medium mb-2">{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template> 