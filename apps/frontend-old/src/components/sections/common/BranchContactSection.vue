<!-- BranchContactSection.vue -->
<template>
  <div v-if="activeSection?.settings" class="relative w-screen left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-gray-50 dark:bg-gray-900 mt-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4" style="color: rgb(255, 0, 0)">
          {{ activeSection.title }}
        </h2>
        <p v-if="activeSection.settings.description" class="text-gray-600 dark:text-gray-400">
          {{ activeSection.settings.description }}
        </p>
      </div>

      <!-- Branches Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <UCard
          v-for="branch in branches"
          :key="branch.name"
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
              <p class="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <MapPin class="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                {{ branch.address }}
              </p>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-4">
            <div 
              v-for="(contact, index) in branch.contacts" 
              :key="index"
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
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Phone, Mail, MapPin, Building } from 'lucide-vue-next';
import { useTheme } from '../../../composables/useTheme';
import { ref, onMounted, computed } from 'vue';
import { PageType } from '@ew/shared';

interface Branch {
  name: string;
  address: string;
  mapUrl?: string;
  contacts: Array<{
    label: string;
    value: string;
    type: 'phone' | 'email';
  }>;
}

const { getActiveTheme } = useTheme();
const theme = ref<any>(null);

const activeSection = computed(() => 
  theme.value?.sections.find((section: any) => 
    section.type === 'branch_contact' && section.isActive
  )
);

const branches = computed<Branch[]>(() => {
  if (!activeSection.value?.settings?.branches) return [];
  return activeSection.value.settings.branches;
});

onMounted(async () => {
  theme.value = await getActiveTheme({ pageType: PageType.CONTACT_PAGE });
});
</script>

<style scoped>
.hover\:scale-105:hover {
  transform: scale(1.05);
}
</style>
