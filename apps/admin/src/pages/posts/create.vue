<template>
  <AuthWrapper>
    <PermissionGate :permissions="[]">
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
                title="Create Post"
                description="Create a new post with translations"
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
                    to="/posts" 
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
                  >
                    <XIcon class="w-4 h-4 mr-2" />
                    Cancel
                  </NuxtLink>
                  
                  <button 
                    @click="createPost(true)" 
                    :disabled="loading"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
                  >
                    <SaveIcon class="w-4 h-4 mr-2" />
                    {{ loading && saveAndContinue ? 'Saving...' : 'Save & Continue' }}
                  </button>

                  <button 
                    @click="createPost(false)" 
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
                  <PostEditor
                    v-model:title="form.title"
                    v-model:slug="form.slug"
                    v-model:content="form.content"
                    v-model:shortDescription="form.shortDescription"
                    :editor-options="editorOptions"
                    @generate-slug="generateSlug"
                    :show-generate-slug="true"
                    :errors="errors"
                    required
                  />
                </div>

                <!-- Media Tab -->
                <div v-show="currentTab === 'media'">
                  <PostMedia
                    v-model:thumbnail="form.thumbnail"
                  />
                </div>

                <!-- Categories Tab -->
                <div v-show="currentTab === 'categories'">
                  <PostCategories
                    v-model="form.categoryIds"
                  />
                </div>

                <!-- SEO Tab -->
                <div v-show="currentTab === 'seo'">
                  <PostSEO
                    v-model:meta-description="form.metaDescription"
                    v-model:tags-input="tagsInput"
                    :tags="form.tags"
                    @tag-input="handleTagInput"
                    @remove-tag="removeTag"
                  />
                </div>

                <!-- Settings Tab -->
                <div v-show="currentTab === 'settings'">
                  <PostSettings
                    v-model:published="form.published"
                    :updated-at="form.updatedAt"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  </AuthWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '@/composables/useTrpc'
import slugify from 'slugify'
import { useHead } from 'nuxt/app'
import { useToast } from 'vue-toastification'
import { useI18n } from "vue-i18n";
import { useAuth } from '@/composables/useAuth'
import PermissionGate from '@/components/common/PermissionGate.vue'
import AuthWrapper from '@/components/common/AuthWrapper.vue'

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
  WandIcon
} from 'lucide-vue-next'

// Import components
import PageHeader from '@/components/common/header/PageHeader.vue'
import PostEditor from '@/components/posts/PostEditor.vue'
import PostMedia from '@/components/posts/PostMedia.vue'
import PostSEO from '@/components/posts/PostSEO.vue'
import PostSettings from '@/components/posts/PostSettings.vue'
import PostCategories from '@/components/posts/PostCategories.vue'
import PermissionAlert from '@/components/common/PermissionAlert.vue'

const trpc = useTrpc()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const { user } = useAuth()
const loading = ref(false)
const saveAndContinue = ref(false)

// Initialize currentTab from query params or default to 'basic'
const currentTab = ref(route.query.tab?.toString() || 'basic')

// Watch for tab changes and update URL
watch(currentTab, (newTab) => {
  router.replace({ 
    query: { 
      ...route.query,
      tab: newTab 
    }
  })
})

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

interface PostForm {
  title: string
  slug: string
  content: string
  shortDescription: string
  published: boolean
  thumbnail: string
  metaDescription: string
  tags: string[]
  categoryIds: number[]
  updatedAt: string
  translations: Record<string, {
    title: string
    slug: string
    content: string
    shortDescription: string
    metaDescription: string
    thumbnail: string
  }>
}

const initialForm: PostForm = {
  title: '',
  slug: '',
  content: '',
  shortDescription: '',
  published: false,
  thumbnail: '',
  metaDescription: '',
  tags: [],
  categoryIds: [],
  updatedAt: new Date().toISOString(),
  translations: {}
}

const form = ref({ ...initialForm })
const tagsInput = ref('')

// Update page title dynamically
useHead(() => ({
  title: form.value.title 
    ? `Create: ${form.value.title} - Admin Dashboard`
    : 'Create Post - Admin Dashboard'
}))

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

// Generate slug from title with Vietnamese support
const generateSlug = () => {
  if (form.value.title) {
    form.value.slug = slugify(form.value.title, {
      lower: true,           // Convert to lowercase
      strict: true,          // Strip special characters except replacement
      locale: 'vi',          // Vietnamese language
      trim: true             // Trim leading and trailing replacement chars
    })
  }
}

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
      title: form.value.title,
      slug: form.value.slug,
      content: form.value.content,
      shortDescription: form.value.shortDescription,
      metaDescription: form.value.metaDescription,
      thumbnail: form.value.thumbnail
    }
  }
  
  // Load content for new language
  if (form.value.translations[newLang]) {
    const translation = form.value.translations[newLang]
    form.value.title = translation.title
    form.value.slug = translation.slug
    form.value.content = translation.content
    form.value.shortDescription = translation.shortDescription
    form.value.metaDescription = translation.metaDescription
    form.value.thumbnail = translation.thumbnail
  } else {
    // Reset form for new translation
    form.value.title = ''
    form.value.slug = ''
    form.value.content = ''
    form.value.shortDescription = ''
    form.value.metaDescription = ''
    form.value.thumbnail = ''
  }
})

// Add validation types and refs
interface ValidationErrors {
  title?: string;
  slug?: string;
  content?: string;
}

const errors = ref<ValidationErrors>({})

// Add validation function
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validate title
  if (!form.value.title?.trim()) {
    errors.value.title = 'Tiêu đề không được để trống'
    isValid = false
  }

  // Validate slug
  if (!form.value.slug?.trim()) {
    errors.value.slug = 'Đường dẫn không được để trống'
    isValid = false
  }

  // Validate content
  if (!form.value.content?.trim()) {
    errors.value.content = 'Nội dung không được để trống'
    isValid = false
  }

  return isValid
}

const createPost = async (continueEditing = false) => {
  try {
    // Validate form before submitting
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại các trường bắt buộc', {
        timeout: 8000,
        position: 'top-right',
        closeButton: true
      })
      return
    }

    loading.value = true
    saveAndContinue.value = continueEditing

    // Save current content to translations before creating
    form.value.translations[selectedLanguage.value] = {
      title: form.value.title,
      slug: form.value.slug,
      content: form.value.content,
      shortDescription: form.value.shortDescription,
      metaDescription: form.value.metaDescription,
      thumbnail: form.value.thumbnail
    }

    // Prepare translations array for API
    const translations = Object.entries(form.value.translations).map(([locale, content]) => ({
      locale,
      title: content.title,
      slug: content.slug,
      content: content.content,
      shortDescription: content.shortDescription,
      metaDescription: content.metaDescription,
      ogImage: content.thumbnail
    }))

    const response = await trpc.admin.posts.createPost.mutate({
      title: form.value.title,
      content: form.value.content,
      shortDescription: form.value.shortDescription,
      status: form.value.published ? 'PUBLISHED' : 'DRAFT',
      thumbnail: form.value.thumbnail || '',
      metaDescription: form.value.metaDescription || '',
      translations,
      tags: form.value.tags,
      categoryIds: form.value.categoryIds
    })

    toast.success('Tạo bài viết thành công!')

    if (!continueEditing) {
      router.push('/posts')
    } else {
      // Redirect to edit page
      router.push(`/posts/edit/${response.id}`)
    }
  } catch (error: any) {
    console.error('Failed to create post:', error)
    
    const currentLang = languages.value.find(l => l.code === selectedLanguage.value)
    const langName = currentLang?.nativeName || selectedLanguage.value
    
    let errorMessage = `[${langName}] `

    // Handle validation errors
    if (error.data?.zodError?.fieldErrors) {
      const fieldErrors = error.data.zodError.fieldErrors
      const errorMessages = []

      // Handle title errors
      if (fieldErrors.title) {
        errorMessages.push(fieldErrors.title[0])
      }

      // Handle content errors
      if (fieldErrors.content) {
        errorMessages.push(fieldErrors.content[0])
      }

      // Handle translation errors
      if (fieldErrors.translations) {
        errorMessages.push(fieldErrors.translations[0])
      }

      errorMessage += errorMessages.join(', ')
    } 
    // Handle specific error codes
    else if (error.code === 'CONFLICT') {
      errorMessage += 'Đường dẫn này đã tồn tại, vui lòng chọn đường dẫn khác'
    }
    else if (error.code === 'BAD_REQUEST') {
      errorMessage += error.message || 'Dữ liệu không hợp lệ'
    }
    // Handle other errors
    else {
      errorMessage += error.message || 'Có lỗi xảy ra, vui lòng thử lại'
    }
    
    toast.error(errorMessage, {
      timeout: 8000,
      position: 'top-right',
      closeButton: true
    })
  } finally {
    loading.value = false
    saveAndContinue.value = false
  }
}

// Quill Editor Options
const editorOptions = {
  theme: 'snow',
  modules: {
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

const hasCreatePostsPermission = computed(() => {
  return user.value?.permissions?.includes('CREATE_POSTS') || false;
});

// Add middleware
definePageMeta({
  middleware: ["auth", "permission"],
});
</script>

<style>
.quill-editor {
  @apply bg-white rounded-lg overflow-hidden;
}

.required::after {
  content: '*';
  @apply text-red-500 ml-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.error-message {
  @apply text-sm text-red-500 mt-1;
}

.input-error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

.ql-toolbar {
  @apply border-0 border-b border-slate-200 bg-white px-6 !important;
}

.ql-container {
  @apply border-0 bg-white !important;
}

.ql-container.error {
  @apply border border-red-500 !important;
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