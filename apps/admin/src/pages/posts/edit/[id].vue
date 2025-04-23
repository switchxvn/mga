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
            title="Edit Post"
            description="Update your post content and settings"
          >
            <template #actions>
              <!-- Language Switcher -->
              <div class="language-switcher relative">
                <button 
                  @click.stop="isLanguageOpen = !isLanguageOpen"
                  class="inline-flex items-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <img 
                    v-if="selectedLanguage"
                    :src="`../../../assets/images/flag/${languages.find(l => l.code === selectedLanguage)?.flagCode}.svg`"
                    :alt="`${languages.find(l => l.code === selectedLanguage)?.nativeName} flag`"
                    class="w-5 h-5 rounded-sm object-cover"
                    @error="handleImageError"
                  />
                  <span>{{ languages.find(l => l.code === selectedLanguage)?.nativeName || 'Select Language' }}</span>
                  <ChevronDownIcon 
                    class="h-4 w-4 transition-transform"
                    :class="{ 'rotate-180': isLanguageOpen }"
                  />
                </button>

                <!-- Dropdown menu -->
                <div 
                  v-if="isLanguageOpen" 
                  class="absolute z-50 mt-1 min-w-[160px] rounded-md shadow-lg bg-white ring-1 ring-black/5 focus:outline-none"
                >
                  <div class="py-1">
                    <button
                      v-for="lang in languages"
                      :key="lang.code"
                      @click="selectedLanguage = lang.code; fetchPost(); isLanguageOpen = false"
                      class="flex items-center w-full h-10 px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100 transition-colors"
                      :class="{ 'bg-slate-50': selectedLanguage === lang.code }"
                    >
                      <div class="w-5 h-5 flex items-center justify-center mr-2">
                        <img 
                          :src="`../../../assets/images/flag/${lang.flagCode}.svg`"
                          :alt="`${lang.nativeName} flag`"
                          class="w-5 h-5 rounded-sm object-cover"
                          @error="handleImageError"
                        />
                      </div>
                      <span>{{ lang.name }}</span>
                      <span v-if="lang.code === defaultLanguage" class="ml-1 text-xs text-slate-500">(Default)</span>
                      <CheckIcon
                        v-if="selectedLanguage === lang.code"
                        class="h-4 w-4 ml-auto text-primary"
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
                @click="updatePost(true)" 
                :disabled="loading"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
              >
                <SaveIcon class="w-4 h-4 mr-2" />
                {{ loading && saveAndContinue ? 'Saving...' : 'Save & Continue' }}
              </button>

              <button 
                @click="updatePost(false)" 
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
                :editor-options="editorOptions"
                @generate-slug="generateSlug"
              />
            </div>

            <!-- Media Tab -->
            <div v-show="currentTab === 'media'">
              <PostMedia
                v-model:featured-image="form.featuredImage"
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '../../../composables/useTrpc'
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
  SaveIcon
} from 'lucide-vue-next'

// Import components
import PageHeader from '../../../components/ui/PageHeader.vue'
import PostEditor from '../../../components/posts/PostEditor.vue'
import PostMedia from '../../../components/posts/PostMedia.vue'
import PostSEO from '../../../components/posts/PostSEO.vue'
import PostSettings from '../../../components/posts/PostSettings.vue'

const trpc = useTrpc()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(true)
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
  published: boolean
  featuredImage: string
  metaDescription: string
  tags: string[]
  updatedAt: string
}

const initialForm: PostForm = {
  title: '',
  slug: '',
  content: '',
  published: false,
  featuredImage: '',
  metaDescription: '',
  tags: [],
  updatedAt: new Date().toISOString()
}

const form = ref({ ...initialForm })
const tagsInput = ref('')

// Update page title dynamically
useHead(() => ({
  title: form.value.title 
    ? `Edit: ${form.value.title} - Admin Dashboard`
    : 'Edit Post - Admin Dashboard'
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

// Watch title changes to suggest slug
watch(() => form.value.title, (newTitle) => {
  if (!form.value.slug && newTitle) {
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
  fetchPost()
})

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
})

// Update fetchPost function
const fetchPost = async () => {
  try {
    const post = await trpc.admin.posts.getPostById.query(Number(route.params.id))
    
    if (post) {
      const translation = post.translations?.find(t => t.locale === selectedLanguage.value) || post.translations?.[0] || {}
      form.value = {
        title: translation.title || post.title || '',
        slug: translation.slug || '',  // Use translation slug directly, don't generate
        content: translation.content || post.content || '',
        published: post.published,
        featuredImage: translation.ogImage || post.thumbnail || '',
        metaDescription: translation.metaDescription || '',
        tags: post.postTags?.map(tag => tag.tag.name) || [],
        updatedAt: post.updatedAt
      }
      tagsInput.value = form.value.tags.join(', ')
    }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    router.push('/posts')
  } finally {
    loading.value = false
  }
}

// Update translations interface to match backend
interface PostTranslation {
  locale: string;
  title: string;
  slug: string;
  content: string;
  shortDescription?: string;
  metaDescription?: string;
  metaTitle?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};

// Update updatePost function
const updatePost = async (continueEditing = false) => {
  try {
    loading.value = true
    saveAndContinue.value = continueEditing

    await trpc.admin.posts.updatePost.mutate({
      id: Number(route.params.id),
      data: {
        title: form.value.title,
        content: form.value.content,
        status: form.value.published ? 'PUBLISHED' : 'DRAFT',
        featuredImage: form.value.featuredImage || '',
        metaDescription: form.value.metaDescription || '',
        translations: [{
          locale: selectedLanguage.value,
          title: form.value.title,
          slug: form.value.slug,
          content: form.value.content,
          metaDescription: form.value.metaDescription,
          ogImage: form.value.featuredImage
        }],
        tags: form.value.tags
      }
    })

    toast.success('Post updated successfully!')

    if (!continueEditing) {
      router.push('/posts')
    } else {
      // Refresh the post data
      await fetchPost()
    }
  } catch (error) {
    console.error('Failed to update post:', error)
    toast.error('Failed to update post. Please try again.')
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