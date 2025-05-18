<template>
  <AuthWrapper>
    <PermissionGate :permissions="[]">
      <div class="min-h-screen bg-slate-50">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div class="flex flex-col items-center gap-2">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p class="text-sm text-slate-500">{{ t('common.loading') }}</p>
          </div>
        </div>

        <!-- Content Area -->
        <div v-else class="min-h-screen bg-slate-50">
          <div class="flex-1 overflow-y-auto">
            <div class="space-y-6">
              <!-- Header -->
              <PageHeader
                :title="t('posts.createPost')"
                :description="t('posts.description')"
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
                      <span>{{ languages.find(l => l.code === selectedLanguage)?.nativeName || t('language.selectLanguage') }}</span>
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
                          <span v-if="lang.code === defaultLanguage" class="ml-1 text-xs text-slate-500 flex-shrink-0">({{ t('language.default') }})</span>
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
                    {{ t('posts.cancel') }}
                  </NuxtLink>
                  
                  <button 
                    @click="createPost(true)" 
                    :disabled="loading"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
                  >
                    <SaveIcon class="w-4 h-4 mr-2" />
                    {{ loading && saveAndContinue ? t('common.saving') : t('posts.saveAndContinue') }}
                  </button>

                  <button 
                    @click="createPost(false)" 
                    :disabled="loading"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    <SaveAllIcon class="w-4 h-4 mr-2" />
                    {{ loading && !saveAndContinue ? t('common.saving') : t('posts.saveAndBack') }}
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
                    @ready="onEditorReady"
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
                    :selected-language="selectedLanguage"
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
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useHead } from 'nuxt/app'

// Import Lucide icons
import {
  XIcon,
  SaveAllIcon,
  ChevronDownIcon,
  CheckIcon,
  SaveIcon
} from 'lucide-vue-next'

// Import components
import PageHeader from '@/components/common/header/PageHeader.vue'
import PostEditor from '@/components/posts/PostEditor.vue'
import PostMedia from '@/components/posts/PostMedia.vue'
import PostSEO from '@/components/posts/PostSEO.vue'
import PostSettings from '@/components/posts/PostSettings.vue'
import PostCategories from '@/components/posts/PostCategories.vue'
import PermissionGate from '@/components/common/PermissionGate.vue'
import AuthWrapper from '@/components/common/AuthWrapper.vue'
import { usePost } from '@/composables/usePost';
import { useLocalization } from '@/composables/useLocalization';
import { useQuillImageHandler } from '@/composables/useQuillImageHandler';

const { t } = useLocalization();
const { registerQuillImageHandler } = useQuillImageHandler();

const {
  loading,
  saveAndContinue,
  currentTab,
  tabs,
  form,
  tagsInput,
  errors,
  editorOptions,
  languages,
  selectedLanguage,
  defaultLanguage,
  isLanguageOpen,
  handleTagInput,
  addTag,
  removeTag,
  generateSlug,
  fetchLanguages,
  onFlagImageError,
  createPost
} = usePost();

// Update page title dynamically
useHead(() => ({
  title: form.title 
    ? `${t('posts.create')}: ${form.title} - ${t('common.adminDashboard')}`
    : `${t('posts.createPost')} - ${t('common.adminDashboard')}`
}));

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    isLanguageOpen.value = false;
  }
};

onMounted(async () => {
  await fetchLanguages();
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
    
    // Thêm cấu hình toolbar cho editor
    editorOptions.modules = {
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
});

onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
});

// Xử lý khi editor đã sẵn sàng
const onEditorReady = (quill: any) => {
  // Lưu instance của quill để sử dụng khi upload ảnh
  if (process.client) {
    (window as any).currentQuillInstance = quill
    // Đăng ký handler cho nút image trong toolbar
    registerQuillImageHandler(quill)
  }
}
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