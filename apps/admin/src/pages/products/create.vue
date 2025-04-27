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
        <div class="space-y-6">
          <!-- Header -->
          <PageHeader
            title="Create Product"
            description="Add a new product to your store"
          >
            <template #actions>
              <!-- Language Switcher -->
              <div class="language-switcher relative">
                <button 
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
                to="/products" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
              >
                <XIcon class="w-4 h-4 mr-2" />
                Cancel
              </NuxtLink>
              
              <button 
                @click="createProduct()" 
                :disabled="loading"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
              >
                <SaveAllIcon class="w-4 h-4 mr-2" />
                {{ loading ? 'Creating...' : 'Create Product' }}
              </button>
            </template>
          </PageHeader>

          <!-- Tabs -->
          <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
            <button
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
            <div v-show="currentTab === 'basic'">
              <ProductEditor
                v-model:name="form.name"
                v-model:slug="form.slug"
                v-model:description="form.description"
                v-model:shortDescription="form.shortDescription"
                v-model:price="form.price"
                v-model:compareAtPrice="form.compareAtPrice"
                v-model:sku="form.sku"
                v-model:barcode="form.barcode"
                :editor-options="editorOptions"
                @generate-slug="generateSlug"
              />
            </div>

            <!-- Media Tab -->
            <div v-show="currentTab === 'media'">
              <ProductMedia
                v-model:thumbnail="form.thumbnail"
                v-model:gallery="form.gallery"
              />
            </div>

            <!-- Categories Tab -->
            <div v-show="currentTab === 'categories'">
              <ProductCategories
                v-model="form.categoryIds"
              />
            </div>

            <!-- Variants Tab -->
            <div v-show="currentTab === 'variants'">
              <ProductVariants
                v-model="form.variants"
                v-model:hasVariants="form.hasVariants"
              />
            </div>

            <!-- Inventory Tab -->
            <div v-show="currentTab === 'inventory'">
              <ProductInventory
                v-model:trackInventory="form.trackInventory"
                v-model:quantity="form.quantity"
                v-model:lowStockThreshold="form.lowStockThreshold"
              />
            </div>

            <!-- SEO Tab -->
            <div v-show="currentTab === 'seo'">
              <ProductSEO
                v-model:meta-description="form.metaDescription"
                v-model:tags-input="tagsInput"
                :tags="form.tags"
                @tag-input="handleTagInput"
                @remove-tag="removeTag"
              />
            </div>

            <!-- Settings Tab -->
            <div v-show="currentTab === 'settings'">
              <ProductSettings
                v-model:published="form.published"
                v-model:featured="form.featured"
                v-model:taxable="form.taxable"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTrpc } from '../../composables/useTrpc'
import slugify from 'slugify'
import { useHead } from 'nuxt/app'
import { useToast } from 'vue-toastification'

// Import Lucide icons
import {
  FileTextIcon,
  ImageIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
  SaveAllIcon,
  ChevronDownIcon,
  CheckIcon,
  SaveIcon,
  FolderIcon,
  LayersIcon,
  PackageIcon
} from 'lucide-vue-next'

// Import components
import PageHeader from '../../components/common/header/PageHeader.vue'
import ProductEditor from '../../components/products/ProductEditor.vue'
import ProductMedia from '../../components/products/ProductMedia.vue'
import ProductSEO from '../../components/products/ProductSEO.vue'
import ProductSettings from '../../components/products/ProductSettings.vue'
import ProductCategories from '../../components/products/ProductCategories.vue'
import ProductVariants from '../../components/products/ProductVariants.vue'
import ProductInventory from '../../components/products/ProductInventory.vue'

const trpc = useTrpc()
const router = useRouter()
const toast = useToast()
const loading = ref(false)

// Initialize currentTab
const currentTab = ref('basic')

const tabs = [
  { 
    id: 'basic', 
    name: 'Basic Info', 
    icon: FileTextIcon
  },
  { 
    id: 'media', 
    name: 'Media', 
    icon: ImageIcon
  },
  {
    id: 'categories',
    name: 'Categories',
    icon: FolderIcon
  },
  {
    id: 'variants',
    name: 'Variants',
    icon: LayersIcon
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: PackageIcon
  },
  { 
    id: 'seo', 
    name: 'SEO', 
    icon: SearchIcon
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: SettingsIcon
  }
]

interface ProductVariant {
  id?: number
  name: string
  sku: string
  barcode: string
  price: number
  compareAtPrice: number | null
  quantity: number
  options: {
    name: string
    value: string
  }[]
}

interface ProductForm {
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice: number | null
  sku: string
  barcode: string
  published: boolean
  featured: boolean
  taxable: boolean
  thumbnail: string
  gallery: string[]
  metaDescription: string
  tags: string[]
  categoryIds: number[]
  hasVariants: boolean
  variants: ProductVariant[]
  trackInventory: boolean
  quantity: number
  lowStockThreshold: number
  translations: Record<string, {
    name: string
    slug: string
    description: string
    shortDescription: string
    metaDescription: string
  }>
}

const initialForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: 0,
  compareAtPrice: null,
  sku: '',
  barcode: '',
  published: false,
  featured: false,
  taxable: true,
  thumbnail: '',
  gallery: [],
  metaDescription: '',
  tags: [],
  categoryIds: [],
  hasVariants: false,
  variants: [],
  trackInventory: true,
  quantity: 0,
  lowStockThreshold: 5,
  translations: {}
}

const form = ref({ ...initialForm })
const tagsInput = ref('')

// Update page title
useHead({
  title: 'Create Product - Admin Dashboard'
})

const handleTagInput = (e: KeyboardEvent) => {
  // Handle Enter key
  if (e.key === 'Enter') {
    e.preventDefault()
    addTag()
  }
  // Handle Space key
  else if (e.key === ' ') {
    e.preventDefault()
    addTag()
  }
  // Handle Backspace when input is empty
  else if (e.key === 'Backspace' && tagsInput.value === '') {
    e.preventDefault()
    form.value.tags.pop()
  }
}

const addTag = () => {
  const tag = tagsInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagsInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

// Generate slug from name with Vietnamese support
const generateSlug = () => {
  if (form.value.name) {
    form.value.slug = slugify(form.value.name, {
      lower: true,           // Convert to lowercase
      strict: true,          // Strip special characters except replacement
      locale: 'vi',          // Vietnamese language
      trim: true             // Trim leading and trailing replacement chars
    })
  }
}

// Watch name changes to suggest slug
watch(() => form.value.name, (newName) => {
  if (!form.value.slug && newName) {
    generateSlug()
  }
})

interface Language {
  id: number;
  name: string;
  code: string;
  nativeName: string;
  flagCode: string;
  isDefault: boolean;
  isActive: boolean;
}

const languages = ref<Language[]>([])
const selectedLanguage = ref('')
const defaultLanguage = ref('')
const isLanguageOpen = ref(false)

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
})

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
})

// Update watch for selectedLanguage
watch(selectedLanguage, (newLang, oldLang) => {
  if (oldLang) {
    // Save current content to translations before switching
    form.value.translations[oldLang] = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description,
      shortDescription: form.value.shortDescription,
      metaDescription: form.value.metaDescription
    }
  }
  
  // Load content for new language
  if (form.value.translations[newLang]) {
    const translation = form.value.translations[newLang]
    form.value.name = translation.name
    form.value.slug = translation.slug
    form.value.description = translation.description
    form.value.shortDescription = translation.shortDescription
    form.value.metaDescription = translation.metaDescription
  } else {
    // Reset form for new translation
    form.value.name = ''
    form.value.slug = ''
    form.value.description = ''
    form.value.shortDescription = ''
    form.value.metaDescription = ''
  }
})

// Create product
const createProduct = async () => {
  try {
    loading.value = true

    // Save current content to translations before updating
    form.value.translations[selectedLanguage.value] = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description,
      shortDescription: form.value.shortDescription,
      metaDescription: form.value.metaDescription
    }

    // Prepare translations array for API
    const translations = Object.entries(form.value.translations).map(([locale, content]) => ({
      locale,
      name: content.name,
      slug: content.slug,
      description: content.description,
      shortDescription: content.shortDescription,
      metaDescription: content.metaDescription
    }))

    await trpc.admin.products.createProduct.mutate({
      name: form.value.name,
      description: form.value.description,
      shortDescription: form.value.shortDescription,
      price: form.value.price,
      compareAtPrice: form.value.compareAtPrice,
      sku: form.value.sku,
      barcode: form.value.barcode,
      published: form.value.published,
      featured: form.value.featured,
      taxable: form.value.taxable,
      thumbnail: form.value.thumbnail,
      gallery: form.value.gallery,
      metaDescription: form.value.metaDescription,
      translations,
      tags: form.value.tags,
      categoryIds: form.value.categoryIds,
      hasVariants: form.value.hasVariants,
      variants: form.value.variants,
      trackInventory: form.value.trackInventory,
      quantity: form.value.quantity,
      lowStockThreshold: form.value.lowStockThreshold
    })

    toast.success('Product created successfully!')
    router.push('/products')
  } catch (error: any) {
    console.error('Failed to create product:', error)
    
    const currentLang = languages.value.find(l => l.code === selectedLanguage.value)
    const langName = currentLang?.nativeName || selectedLanguage.value
    
    let errorMessage = `[${langName}] `
    
    // Handle tRPC error
    if (error.cause) {
      errorMessage += error.cause
    } else if (error.message) {
      errorMessage += error.message
    } else {
      errorMessage += 'Failed to create product. Please try again.'
    }
    
    toast.error(errorMessage, {
      timeout: 8000,
      closeButton: true,
      icon: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored'
    })
  } finally {
    loading.value = false
  }
}

// Quill Editor Options
const editorOptions = ref({
  theme: 'snow',
  modules: {}
})

// Initialize editor options on client-side only
if (process.client) {
  editorOptions.value.modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  }
}

const onFlagImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
    // Add a fallback display like the language code or first letter
    const parent = target.parentElement;
    if (parent) {
      parent.textContent = selectedLanguage.value?.toUpperCase().slice(0, 2) || '';
      parent.classList.add('bg-primary', 'text-white', 'rounded-sm', 'text-xs', 'font-medium', 'flex', 'items-center', 'justify-center');
    }
  }
};
</script>

<style>
.quill-editor {
  @apply bg-white rounded-lg overflow-hidden;
}

.ql-toolbar {
  @apply border-0 border-b border-slate-200 bg-white px-6 !important;
}

.ql-container {
  @apply border-0 bg-white !important;
}

.ql-editor {
  @apply min-h-[400px] text-slate-700 px-6 !important;
}

.ql-editor h1 {
  @apply text-3xl font-bold mb-4;
}

.ql-editor h2 {
  @apply text-2xl font-semibold mb-3;
}

.ql-editor h3 {
  @apply text-xl font-semibold mb-3;
}

.ql-editor p {
  @apply mb-4 text-base leading-relaxed;
}

.ql-editor ul, .ql-editor ol {
  @apply mb-4 pl-6;
}

.ql-editor ul {
  @apply list-disc;
}

.ql-editor ol {
  @apply list-decimal;
}

.ql-editor blockquote {
  @apply border-l-4 border-slate-200 pl-4 italic my-4;
}

.ql-editor img {
  @apply max-w-full rounded-lg my-4;
}

.ql-editor pre {
  @apply bg-slate-100 p-4 rounded-lg my-4 overflow-x-auto;
}

.ql-editor code {
  @apply font-mono text-sm bg-slate-100 px-1.5 py-0.5 rounded;
}

/* Prose styles for preview */
.prose {
  @apply text-slate-700;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-slate-900 font-semibold mt-8 mb-4;
}

.prose p {
  @apply mb-4;
}

.prose ul, .prose ol {
  @apply mb-4 pl-6;
}

.prose ul {
  @apply list-disc;
}

.prose ol {
  @apply list-decimal;
}

.prose a {
  @apply text-primary hover:text-primary/80;
}

.prose img {
  @apply rounded-lg my-8;
}

.prose blockquote {
  @apply border-l-4 border-slate-200 pl-4 italic my-6;
}

.prose code {
  @apply bg-slate-100 px-1.5 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-slate-900 text-slate-50 p-4 rounded-lg my-6 overflow-x-auto;
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