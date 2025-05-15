<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  FileTextIcon,
  SettingsIcon,
  XIcon,
  SaveIcon,
  SaveAllIcon,
  ChevronDownIcon,
  CheckIcon
} from 'lucide-vue-next';
import { useAuth } from '../../composables/useAuth';
import { useTrpc } from '../../composables/useTrpc';
import { useMenuItem } from '../../composables/useMenuItem';
import PageHeader from '../../components/common/header/PageHeader.vue';
import IconSelector from '../../components/common/IconSelector.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Create Menu Item - Admin Panel'
});

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Use the menu item composable
const {
  form,
  errors,
  isLoading,
  error,
  selectedLanguage,
  currentTranslation,
  createMenuItem
} = useMenuItem();

// Check if we have a parent ID from the query params
if (route.query.parentId) {
  form.value.parentId = Number(route.query.parentId);
}

// Local state
const currentTab = ref('basic');
const isLanguageOpen = ref(false);
const languages = ref<any[]>([]);
const defaultLanguage = ref('');
const parentMenuItems = ref<any[]>([]);

const tabs = [
  { 
    id: 'basic', 
    name: 'Basic Info', 
    icon: FileTextIcon
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: SettingsIcon
  }
];

// Fetch languages
const fetchLanguages = async () => {
  try {
    const [langs, defaultLang] = await Promise.all([
      trpc.admin.languages.getLanguages.query(),
      trpc.admin.languages.getDefaultLanguage.query()
    ]);
    languages.value = langs;
    defaultLanguage.value = defaultLang?.code || 'en';
    selectedLanguage.value = defaultLang?.code || 'en';
    form.value.defaultLocale = defaultLang?.code || 'en';
    
    // Initialize translations for default language
    if (selectedLanguage.value && !form.value.translations[selectedLanguage.value]) {
      form.value.translations[selectedLanguage.value] = {
        label: '',
        href: ''
      };
    }
  } catch (error) {
    console.error('Failed to fetch languages:', error);
  }
};

// Fetch parent menu items
const fetchParentMenuItems = async () => {
  try {
    const result = await trpc.admin.menuItems.getAllMenuItems.query({
      page: 1,
      limit: 100,
      isActive: true
    });
    
    parentMenuItems.value = result.items;
  } catch (error) {
    console.error('Failed to fetch parent menu items:', error);
  }
};

// Handle form submission
const handleSubmit = async (saveAndContinue = false) => {
  const success = await createMenuItem();
  
  if (success && saveAndContinue) {
    // Reset form for a new entry
    form.value = {
      defaultLocale: defaultLanguage.value,
      icon: null,
      order: 0,
      isActive: true,
      parentId: form.value.parentId, // Keep the same parent
      translations: {}
    };
    
    // Initialize translations for default language
    if (selectedLanguage.value) {
      form.value.translations[selectedLanguage.value] = {
        label: '',
        href: ''
      };
    }
  }
};

// Generate URL slug from label
const generateSlug = () => {
  if (!currentTranslation.value.label) return;
  
  const slug = currentTranslation.value.label
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-');     // Replace multiple - with single -
  
  currentTranslation.value.href = `/${slug}`;
};

// Handle click outside language dropdown
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    isLanguageOpen.value = false;
  }
};

// Handle flag image error
const onFlagImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.textContent = selectedLanguage.value?.toUpperCase().slice(0, 2) || '';
      parent.classList.add('bg-primary', 'text-white', 'rounded-sm', 'text-xs', 'font-medium', 'flex', 'items-center', 'justify-center');
    }
  }
};

// Watch for language changes
watch(selectedLanguage, (newLang, oldLang) => {
  if (!newLang) return;

  if (oldLang) {
    // Save current content to translations before switching
    form.value.translations[oldLang] = {
      label: currentTranslation.value.label,
      href: currentTranslation.value.href
    };
  }
  
  // Initialize new translation if it doesn't exist
  if (!form.value.translations[newLang]) {
    form.value.translations[newLang] = {
      label: '',
      href: ''
    };
  }
});

onMounted(async () => {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    router.push("/auth/login");
    return;
  }
  
  // Fetch languages and parent menu items
  await Promise.all([
    fetchLanguages(),
    fetchParentMenuItems()
  ]);
  
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex-1 overflow-y-auto">
      <form @submit.prevent="handleSubmit(false)" class="space-y-6">
        <!-- Header -->
        <PageHeader
          title="Create Menu Item"
          description="Add a new item to your website navigation menu"
        >
          <template #actions>
            <!-- Language Switcher -->
            <div class="language-switcher relative">
              <button 
                type="button"
                @click.stop="isLanguageOpen = !isLanguageOpen"
                class="inline-flex items-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <div class="w-5 h-5 flex items-center justify-center">
                  <img 
                    v-if="selectedLanguage"
                    :src="`/images/flag/${languages.find(l => l.code === selectedLanguage)?.flagCode.toLowerCase()}.svg`"
                    :alt="`${languages.find(l => l.code === selectedLanguage)?.nativeName} flag`"
                    class="w-5 h-5 rounded-sm object-cover"
                    @error="onFlagImageError"
                  />
                </div>
                <span>{{ languages.find(l => l.code === selectedLanguage)?.nativeName || 'Select Language' }}</span>
                <ChevronDownIcon 
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': isLanguageOpen }"
                />
              </button>

              <!-- Dropdown menu -->
              <div 
                v-if="isLanguageOpen" 
                class="absolute z-50 mt-1 min-w-[240px] rounded-md shadow-lg bg-white ring-1 ring-black/5 focus:outline-none"
              >
                <div class="py-1">
                  <button
                    type="button"
                    v-for="lang in languages"
                    :key="lang.code"
                    @click="selectedLanguage = lang.code; isLanguageOpen = false"
                    class="flex items-center w-full h-10 px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
                    :class="{ 'bg-slate-50': selectedLanguage === lang.code }"
                  >
                    <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center mr-2">
                      <img 
                        :src="`/images/flag/${lang.flagCode.toLowerCase()}.svg`"
                        :alt="`${lang.nativeName} flag`"
                        class="w-5 h-5 rounded-sm object-cover"
                        @error="onFlagImageError"
                      />
                    </div>
                    <span class="truncate">{{ lang.nativeName }}</span>
                    <span v-if="lang.code === defaultLanguage" class="ml-1 text-xs text-slate-500 flex-shrink-0">(Default)</span>
                    <CheckIcon
                      v-if="selectedLanguage === lang.code"
                      class="h-4 w-4 ml-auto flex-shrink-0 text-primary"
                    />
                  </button>
                </div>
              </div>
            </div>

            <NuxtLink 
              to="/menu-items" 
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
            >
              <XIcon class="w-4 h-4 mr-2" />
              Cancel
            </NuxtLink>
            
            <button 
              type="button"
              @click.prevent="handleSubmit(true)" 
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
            >
              <SaveIcon class="w-4 h-4 mr-2" />
              {{ isLoading ? 'Saving...' : 'Save & Create Another' }}
            </button>

            <button 
              type="submit"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
            >
              <SaveAllIcon class="w-4 h-4 mr-2" />
              {{ isLoading ? 'Saving...' : 'Save & Back to List' }}
            </button>
          </template>
        </PageHeader>

        <!-- Error Banner -->
        <div v-if="error" class="p-4 rounded-md bg-red-50 dark:bg-red-900/30">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
          <button
            type="button"
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
            :class="{
              'bg-primary text-white': currentTab === tab.id,
              'text-slate-600 hover:text-slate-900 hover:bg-slate-50': currentTab !== tab.id
            }"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.name }}
          </button>
        </nav>

        <div class="grid gap-6">
          <!-- Basic Info Tab -->
          <div v-show="currentTab === 'basic'" class="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div class="space-y-4">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
              
              <div class="grid grid-cols-2 gap-4">
                <UFormGroup label="Label" required :error="errors.translations">
                  <UInput
                    v-model="currentTranslation.label"
                    placeholder="Enter menu item label"
                    required
                    :error="!!errors.translations"
                  />
                </UFormGroup>

                <UFormGroup label="Parent Menu Item">
                  <USelect
                    v-model="form.parentId"
                    :options="[
                      { id: null, label: 'None (Root Level)' },
                      ...parentMenuItems.map(item => ({
                        id: item.id,
                        label: item.translations?.[0]?.label || `Menu Item #${item.id}`
                      }))
                    ]"
                    option-attribute="label"
                    value-attribute="id"
                    placeholder="Select parent menu item"
                  />
                </UFormGroup>

                <IconSelector
                  v-model="form.icon"
                  :error="errors.icon"
                />
              </div>

              <UFormGroup label="URL" required>
                <div class="flex gap-2">
                  <UInput
                    v-model="currentTranslation.href"
                    placeholder="Enter URL (e.g. /about or https://example.com)"
                    required
                    class="flex-1"
                  />
                  <UButton
                    type="button"
                    variant="soft"
                    color="gray"
                    @click="generateSlug"
                    class="flex-shrink-0"
                    title="Generate URL from label"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </UButton>
                </div>
              </UFormGroup>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-show="currentTab === 'settings'" class="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div class="space-y-4">
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Settings</h2>
              
              <UFormGroup label="Display Order">
                <UInput
                  v-model="form.order"
                  type="number"
                  min="0"
                  placeholder="Enter display order (lower numbers appear first)"
                />
              </UFormGroup>
              
              <UFormGroup>
                <UCheckbox
                  v-model="form.isActive"
                  label="Active"
                  help="When active, this menu item will be visible on the frontend"
                />
              </UFormGroup>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  @apply bg-white rounded-lg p-6 space-y-6 shadow-sm;
}

.section-title {
  @apply text-lg font-medium text-gray-900;
}

.language-switcher {
  position: relative;
  display: inline-block;
  width: auto;
}

/* Dropdown menu */
.absolute {
  z-index: 50 !important;
}
</style> 