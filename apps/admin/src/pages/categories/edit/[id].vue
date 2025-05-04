<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div class="flex flex-col items-center gap-2">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p class="text-sm text-slate-500">Loading...</p>
      </div>
    </div>

    <!-- Content Area -->
    <div v-else class="min-h-screen bg-slate-50">
      <div class="flex-1 overflow-y-auto">
        <form @submit.prevent="updateCategory(false)" class="space-y-6">
          <!-- Header -->
          <PageHeader
            title="Edit Category"
            description="Update your category content and settings"
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
                to="/categories" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
              >
                <XIcon class="w-4 h-4 mr-2" />
                Cancel
              </NuxtLink>
              
              <button 
                type="button"
                @click.prevent="updateCategory(true)" 
                :disabled="loading"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
              >
                <SaveIcon class="w-4 h-4 mr-2" />
                {{ loading && saveAndContinue ? 'Saving...' : 'Save & Continue' }}
              </button>

              <button 
                type="submit"
                :disabled="loading"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
              >
                <SaveAllIcon class="w-4 h-4 mr-2" />
                {{ loading && !saveAndContinue ? 'Saving...' : 'Save & Back to List' }}
              </button>
            </template>
          </PageHeader>

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
                  <UFormGroup label="Name" required :error="errors.name">
                    <UInput
                      v-model="form.name"
                      name="name"
                      placeholder="Enter category name"
                      required
                      :error="!!errors.name"
                    />
                  </UFormGroup>

                  <UFormGroup label="Type" required :error="errors.type">
                    <USelect
                      v-model="form.type"
                      :options="[
                        { label: 'News', value: CategoryType.NEWS },
                        { label: 'Product', value: CategoryType.PRODUCT },
                        { label: 'Both', value: CategoryType.BOTH },
                        { label: 'Gallery', value: CategoryType.GALLERY }
                      ]"
                      option-attribute="label"
                      required
                      :error="!!errors.type"
                    />
                  </UFormGroup>
                </div>

                <UFormGroup label="Slug" required :error="errors.slug">
                  <div class="flex gap-2">
                    <UInput
                      v-model="currentTranslation.slug"
                      placeholder="Enter URL slug"
                      required
                      :error="!!errors.slug"
                      class="flex-1"
                    />
                    <UButton
                      type="button"
                      variant="soft"
                      color="gray"
                      @click="generateSlug"
                      class="flex-shrink-0"
                      title="Generate slug from name"
                    >
                      <WandIcon class="w-4 h-4" />
                    </UButton>
                  </div>
                </UFormGroup>

                <UFormGroup label="Description">
                  <UTextarea
                    v-model="currentTranslation.description"
                    placeholder="Enter description"
                    :rows="4"
                  />
                </UFormGroup>
              </div>
            </div>

            <!-- Settings Tab -->
            <div v-show="currentTab === 'settings'" class="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div class="space-y-4">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Settings</h2>
                
                <UFormGroup>
                  <UCheckbox
                    v-model="form.active"
                    label="Active"
                    help="When active, this category will be visible on the frontend"
                  />
                </UFormGroup>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useRoute, useRouter } from 'vue-router'
import slugify from 'slugify'
import {
  FileTextIcon,
  SettingsIcon,
  XIcon,
  SaveAllIcon,
  ChevronDownIcon,
  CheckIcon,
  SaveIcon,
  WandIcon
} from 'lucide-vue-next'
import { TYPE } from 'vue-toastification'
import { useTrpc } from '../../../composables/useTrpc'

// Import components
import PageHeader from '../../../components/common/header/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const trpc = useTrpc()

// Define types to match server schema
interface CategoryTranslation {
  locale: string
  name: string
  slug: string
  description: string | null
}

const CategoryType = {
  NEWS: 'news',
  PRODUCT: 'product',
  BOTH: 'both',
  GALLERY: 'gallery'
}

interface CategoryUpdateData {
  name?: string
  type?: CategoryType
  active?: boolean
  translations?: CategoryTranslation[]
}

interface Translation {
  name: string
  slug: string
  description: string
}

interface CategoryForm {
  name: string
  type: CategoryType
  active: boolean
  translations: Record<string, Translation>
}

// Add validation types and refs
interface ValidationErrors {
  name?: string;
  slug?: string;
  type?: string;
}

const errors = ref<ValidationErrors>({})
const loading = ref(true)
const saveAndContinue = ref(false)
const currentTab = ref('basic')
const selectedLanguage = ref('')
const defaultLanguage = ref('')
const isLanguageOpen = ref(false)
const languages = ref<any[]>([])

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
]

const form = ref<CategoryForm>({
  name: '',
  type: CategoryType.NEWS,
  active: true,
  translations: {}
})

// Computed property for current translation
const currentTranslation = computed(() => {
  if (!selectedLanguage.value || !form.value.translations[selectedLanguage.value]) {
    return {
      name: '',
      slug: '',
      description: ''
    }
  }
  return form.value.translations[selectedLanguage.value]
})

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    isLanguageOpen.value = false;
  }
};

onMounted(async () => {
  try {
    const [langs, defaultLang] = await Promise.all([
      trpc.admin.languages.getLanguages.query(),
      trpc.admin.languages.getDefaultLanguage.query()
    ])
    languages.value = langs
    defaultLanguage.value = defaultLang?.code || ''
    selectedLanguage.value = defaultLang?.code || ''
  } catch (error) {
    console.error('Failed to fetch languages:', error)
  }
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
  }
  fetchCategory()
})

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
})

// Watch for language changes
watch(selectedLanguage, (newLang, oldLang) => {
  if (!newLang) return

  if (oldLang) {
    // Save current content to translations before switching
    form.value.translations[oldLang] = {
      name: form.value.name,
      slug: currentTranslation.value.slug,
      description: currentTranslation.value.description
    }
  }
  
  // Load content for new language
  if (form.value.translations[newLang]) {
    const translation = form.value.translations[newLang]
    form.value.name = translation.name
  } else {
    // Initialize new translation
    form.value.name = ''
    form.value.translations[newLang] = {
      name: '',
      slug: '',
      description: ''
    }
  }
})

// Add generateSlug function
const generateSlug = () => {
  if (form.value.name) {
    if (!form.value.translations[selectedLanguage.value]) {
      form.value.translations[selectedLanguage.value] = {
        name: '',
        slug: '',
        description: ''
      }
    }
    form.value.translations[selectedLanguage.value].slug = slugify(form.value.name, {
      lower: true,
      strict: true,
      locale: selectedLanguage.value,
      trim: true
    })
  }
}

// Add validation function
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validate name
  if (!form.value.name?.trim()) {
    errors.value.name = 'Name is required'
    isValid = false
  }

  // Validate slug
  if (!currentTranslation.value.slug?.trim()) {
    errors.value.slug = 'Slug is required'
    isValid = false
  }

  // Validate type
  if (!form.value.type) {
    errors.value.type = 'Type is required'
    isValid = false
  }

  return isValid
}

const fetchCategory = async () => {
  try {
    const category = await trpc.admin.category.getCategoryById.query(Number(route.params.id))
    
    if (category) {
      // Initialize translations
      const translations: Record<string, any> = {}
      
      category.translations?.forEach(translation => {
        translations[translation.locale] = {
          name: translation.name,
          slug: translation.slug,
          description: translation.description || ''
        }
      })

      form.value = {
        name: category.translations?.find(t => t.locale === selectedLanguage.value)?.name || category.name || '',
        type: category.type as CategoryType,
        active: category.active,
        translations
      }
    }
  } catch (error) {
    console.error('Failed to fetch category:', error)
    router.push('/categories')
  } finally {
    loading.value = false
  }
}

const updateCategory = async (continueEditing = false) => {
  try {
    // Validate form before submitting
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        description: 'Please check all required fields',
        type: 'error'
      })
      return
    }

    loading.value = true
    saveAndContinue.value = continueEditing

    if (selectedLanguage.value) {
      // Save current content to translations before submitting
      form.value.translations[selectedLanguage.value] = {
        name: form.value.name,
        slug: currentTranslation.value.slug,
        description: currentTranslation.value.description
      }
    }

    // Prepare minimal data for update that matches server schema
    const updateData: CategoryUpdateData = {
      name: form.value.name,
      type: form.value.type,
      active: form.value.active,
      translations: Object.entries(form.value.translations).map(([locale, content]): CategoryTranslation => ({
        locale,
        name: content.name,
        slug: content.slug,
        description: content.description || null
      }))
    }

    await trpc.admin.category.updateCategory.mutate({
      id: Number(route.params.id),
      data: updateData
    })
    
    const currentLang = languages.value.find(l => l.code === selectedLanguage.value)
    const langName = currentLang?.nativeName || selectedLanguage.value

    showToast({
      title: 'Success',
      description: `Category "${form.value.name}" (${langName}) updated successfully`,
      type: 'success'
    })
    
    if (!continueEditing) {
      router.push('/categories')
    } else {
      // Refresh the category data
      await fetchCategory()
    }
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    const currentLang = languages.value.find(l => l.code === selectedLanguage.value)
    const langName = currentLang?.nativeName || selectedLanguage.value
    
    let errorMessage = `[${langName}] `
    
    if (error.cause) {
      errorMessage += error.cause
    } else if (error.message) {
      errorMessage += error.message
    } else {
      errorMessage += 'Failed to update category. Please try again.'
    }
    
    showToast({
      title: 'Error',
      description: errorMessage,
      type: 'error'
    })
  } finally {
    loading.value = false
    saveAndContinue.value = false
  }
}

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
</script>

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