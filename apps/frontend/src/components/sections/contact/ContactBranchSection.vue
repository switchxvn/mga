<script setup lang="ts">
import { computed } from 'vue';
import { Phone, Mail, MapPin, Building } from 'lucide-vue-next';

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
  return props.settings.backgroundColor || 'bg-gray-50 dark:bg-gray-900';
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
  return props.settings.branchColumns || 2;
});

// Transform branches data to match the new UI structure
const formattedBranches = computed(() => {
  return branches.value.map(branch => {
    const contacts = [];
    
    if (branch.phone) {
      contacts.push({
        label: 'Phone',
        value: branch.phone,
        type: 'phone'
      });
    }
    
    if (branch.email) {
      contacts.push({
        label: 'Email',
        value: branch.email,
        type: 'email'
      });
    }
    
    return {
      name: branch.name,
      address: branch.address,
      mapUrl: branch.mapUrl,
      contacts
    };
  });
});
</script>

<template>
  <section 
    class="w-full"
    :class="[backgroundColor, textColor]"
    :style="{ padding }"
  >
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4" style="color: rgb(255, 0, 0)">
          {{ translations.title }}
        </h2>
        
        <p v-if="translations.subtitle" class="text-xl mb-4">
          {{ translations.subtitle }}
        </p>
        
        <p v-if="translations.content" class="text-lg max-w-3xl mx-auto">
          {{ translations.content }}
        </p>
      </div>
      
      <!-- Grid Layout -->
      <div v-if="branchLayout === 'grid'" class="max-w-5xl mx-auto">
        <div 
          class="grid gap-8"
          :class="{
            'grid-cols-1': branchColumns === 1,
            'grid-cols-1 md:grid-cols-2': branchColumns === 2,
            'grid-cols-1 md:grid-cols-3': branchColumns === 3,
            'grid-cols-1 md:grid-cols-4': branchColumns === 4
          }"
        >
          <UCard
            v-for="(branch, index) in formattedBranches" 
            :key="index"
            class="transition-transform duration-300 hover:scale-105"
          >
            <!-- Branch Header -->
            <div class="flex items-start gap-4 mb-6">
              <div class="rounded-full bg-primary-50 dark:bg-primary-900/50 p-3">
                <Building class="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 class="text-xl font-extrabold mb-1" style="color: rgb(255, 0, 0)">
                  {{ branch.name }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 flex items-start gap-2 address-container">
                  <MapPin class="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                  <span class="address-text">{{ branch.address }}</span>
                </p>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="space-y-4">
              <div 
                v-for="(contact, contactIndex) in branch.contacts" 
                :key="contactIndex"
                class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div class="rounded-full bg-white dark:bg-gray-700 p-2">
                  <Phone v-if="contact.type === 'phone'" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <Mail v-if="contact.type === 'email'" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-extrabold mb-1" style="color: rgb(255, 0, 0)">
                    {{ contact.label }}
                  </p>
                  <a
                    :href="contact.type === 'phone' ? `tel:${contact.value}` : `mailto:${contact.value}`"
                    class="text-base font-semibold text-gray-900 dark:text-white hover:underline hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {{ contact.value }}
                  </a>
                </div>
              </div>
              
              <!-- Hours Information -->
              <div v-if="branches[index].hours" class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div class="rounded-full bg-white dark:bg-gray-700 p-2">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-extrabold mb-1" style="color: rgb(255, 0, 0)">
                    Business Hours
                  </p>
                  <div>
                    <div v-for="(hours, day) in branches[index].hours" :key="day" class="text-base font-semibold text-gray-900 dark:text-white">
                      <span class="font-medium">{{ day }}:</span> {{ hours }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Map Link -->
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
          </UCard>
        </div>
      </div>
      
      <!-- List Layout -->
      <div v-else class="max-w-4xl mx-auto">
        <div class="space-y-8">
          <UCard
            v-for="(branch, index) in formattedBranches" 
            :key="index"
            class="transition-transform duration-300 hover:scale-105"
          >
            <!-- Branch Header -->
            <div class="flex items-start gap-4 mb-6">
              <div class="rounded-full bg-primary-50 dark:bg-primary-900/50 p-3">
                <Building class="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 class="text-xl font-extrabold mb-1" style="color: rgb(255, 0, 0)">
                  {{ branch.name }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 flex items-start gap-2 address-container">
                  <MapPin class="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                  <span class="address-text">{{ branch.address }}</span>
                </p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Contact Information -->
              <div class="space-y-4">
                <div 
                  v-for="(contact, contactIndex) in branch.contacts" 
                  :key="contactIndex"
                  class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div class="rounded-full bg-white dark:bg-gray-700 p-2">
                    <Phone v-if="contact.type === 'phone'" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <Mail v-if="contact.type === 'email'" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-extrabold mb-1" style="color: rgb(255, 0, 0)">
                      {{ contact.label }}
                    </p>
                    <a
                      :href="contact.type === 'phone' ? `tel:${contact.value}` : `mailto:${contact.value}`"
                      class="text-base font-semibold text-gray-900 dark:text-white hover:underline hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {{ contact.value }}
                    </a>
                  </div>
                </div>
              </div>
              
              <!-- Hours and Map -->
              <div class="space-y-4">
                <!-- Hours Information -->
                <div v-if="branches[index].hours" class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div class="rounded-full bg-white dark:bg-gray-700 p-2">
                    <UIcon name="i-heroicons-clock" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-extrabold mb-1" style="color: rgb(255, 0, 0)">
                      Business Hours
                    </p>
                    <div>
                      <div v-for="(hours, day) in branches[index].hours" :key="day" class="text-base font-semibold text-gray-900 dark:text-white">
                        <span class="font-medium">{{ day }}:</span> {{ hours }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Map Link -->
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
          </UCard>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.address-container {
  min-height: 4.5rem; /* Chiều cao cho 3 dòng text */
  max-height: 4.5rem;
  overflow: hidden;
  position: relative;
}

.address-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5rem;
}
</style> 