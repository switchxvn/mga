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

const branches = computed(() => {
  return props.settings.branches || [];
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

const branchLayout = computed(() => {
  return props.settings.branchLayout || 'grid';
});

const branchColumns = computed(() => {
  return props.settings.branchColumns || 3;
});

const getIconName = (type: string) => {
  const typeLower = type.toLowerCase();
  
  switch (typeLower) {
    case 'phone':
      return 'i-heroicons-phone';
    case 'email':
      return 'i-heroicons-envelope';
    case 'address':
      return 'i-heroicons-map-pin';
    case 'hours':
      return 'i-heroicons-clock';
    default:
      return 'i-heroicons-information-circle';
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
      <div v-if="branchLayout === 'grid'" class="max-w-6xl mx-auto">
        <div 
          class="grid gap-8"
          :class="{
            'grid-cols-2': branchColumns === 2,
            'grid-cols-3': branchColumns === 3,
            'grid-cols-4': branchColumns === 4,
            'grid-cols-1': branchColumns === 1
          }"
        >
          <div 
            v-for="(branch, index) in branches" 
            :key="index"
            class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6"
          >
            <h3 class="text-xl font-bold mb-4">{{ branch.name }}</h3>
            
            <div class="space-y-4">
              <div v-if="branch.address" class="flex items-start">
                <UIcon 
                  name="i-heroicons-map-pin"
                  class="w-5 h-5 mr-3 mt-1 text-primary-500"
                />
                <span>{{ branch.address }}</span>
              </div>
              
              <div v-if="branch.phone" class="flex items-center">
                <UIcon 
                  name="i-heroicons-phone"
                  class="w-5 h-5 mr-3 text-primary-500"
                />
                <a 
                  :href="`tel:${branch.phone}`"
                  class="hover:text-primary-500 transition-colors"
                >
                  {{ branch.phone }}
                </a>
              </div>
              
              <div v-if="branch.email" class="flex items-center">
                <UIcon 
                  name="i-heroicons-envelope"
                  class="w-5 h-5 mr-3 text-primary-500"
                />
                <a 
                  :href="`mailto:${branch.email}`"
                  class="hover:text-primary-500 transition-colors"
                >
                  {{ branch.email }}
                </a>
              </div>
              
              <div v-if="branch.hours" class="flex items-start">
                <UIcon 
                  name="i-heroicons-clock"
                  class="w-5 h-5 mr-3 mt-1 text-primary-500"
                />
                <div>
                  <div v-for="(hours, day) in branch.hours" :key="day">
                    <span class="font-medium">{{ day }}:</span> {{ hours }}
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="branch.mapUrl" class="mt-6">
              <a 
                :href="branch.mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center text-primary-500 hover:text-primary-600"
              >
                <UIcon 
                  name="i-heroicons-map"
                  class="w-5 h-5 mr-2"
                />
                <span>View on Map</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- List Layout -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="space-y-8">
          <div 
            v-for="(branch, index) in branches" 
            :key="index"
            class="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6"
          >
            <h3 class="text-xl font-bold mb-4">{{ branch.name }}</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div v-if="branch.address" class="flex items-start">
                  <UIcon 
                    name="i-heroicons-map-pin"
                    class="w-5 h-5 mr-3 mt-1 text-primary-500"
                  />
                  <span>{{ branch.address }}</span>
                </div>
                
                <div v-if="branch.phone" class="flex items-center">
                  <UIcon 
                    name="i-heroicons-phone"
                    class="w-5 h-5 mr-3 text-primary-500"
                  />
                  <a 
                    :href="`tel:${branch.phone}`"
                    class="hover:text-primary-500 transition-colors"
                  >
                    {{ branch.phone }}
                  </a>
                </div>
                
                <div v-if="branch.email" class="flex items-center">
                  <UIcon 
                    name="i-heroicons-envelope"
                    class="w-5 h-5 mr-3 text-primary-500"
                  />
                  <a 
                    :href="`mailto:${branch.email}`"
                    class="hover:text-primary-500 transition-colors"
                  >
                    {{ branch.email }}
                  </a>
                </div>
              </div>
              
              <div class="space-y-4">
                <div v-if="branch.hours" class="flex items-start">
                  <UIcon 
                    name="i-heroicons-clock"
                    class="w-5 h-5 mr-3 mt-1 text-primary-500"
                  />
                  <div>
                    <div v-for="(hours, day) in branch.hours" :key="day">
                      <span class="font-medium">{{ day }}:</span> {{ hours }}
                    </div>
                  </div>
                </div>
                
                <div v-if="branch.mapUrl" class="mt-4">
                  <a 
                    :href="branch.mapUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-primary-500 hover:text-primary-600"
                  >
                    <UIcon 
                      name="i-heroicons-map"
                      class="w-5 h-5 mr-2"
                    />
                    <span>View on Map</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template> 