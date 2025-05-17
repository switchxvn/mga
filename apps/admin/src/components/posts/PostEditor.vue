<template>
  <div class="grid gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <div class="space-y-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white">{{ t('posts.editor.basicInfo') }}</h2>
      
      <div class="grid grid-cols-1 gap-4">
        <!-- Title -->
        <UFormGroup :label="t('posts.editor.title')" required :error="errors?.title">
          <UInput
            v-model="localTitle"
            :placeholder="t('posts.editor.titlePlaceholder')"
            required
            :error="!!errors?.title"
          />
        </UFormGroup>

        <!-- Slug -->
        <UFormGroup :label="t('posts.editor.urlSlug')" required :error="errors?.slug">
          <div class="flex gap-2">
            <UInput
              v-model="localSlug"
              :placeholder="t('posts.editor.slugPlaceholder')"
              required
              :error="!!errors?.slug"
              class="flex-1"
            />
            <UButton
              type="button"
              variant="soft"
              color="gray"
              @click="$emit('generate-slug')"
              class="flex-shrink-0"
              :title="t('posts.editor.generateSlug')"
              v-if="showGenerateSlug"
            >
              <WandIcon class="w-4 h-4" />
            </UButton>
          </div>
          <div class="mt-1 text-sm text-slate-500">/posts/{{ localSlug }}</div>
        </UFormGroup>

        <!-- Short Description -->
        <UFormGroup :label="t('posts.editor.shortDescription')">
          <UTextarea
            v-model="localShortDescription"
            :placeholder="t('posts.editor.shortDescriptionPlaceholder')"
            rows="3"
          />
        </UFormGroup>

        <!-- Content -->
        <UFormGroup :label="t('posts.editor.content')" required :error="errors?.content">
          <div 
            class="quill-editor"
            :class="{ 'border border-red-500 rounded-lg': !!errors?.content }"
          >
            <ClientOnly>
              <QuillEditor
                v-model:content="localContent"
                :toolbar="mergedEditorOptions.modules.toolbar"
                contentType="html"
                theme="snow"
                ref="quillEditorRef"
                @ready="onEditorReady"
              />
            </ClientOnly>
          </div>
        </UFormGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent, onMounted, computed } from 'vue'
import { WandIcon } from 'lucide-vue-next'
import { useLocalization } from '@/composables/useLocalization'
import { useQuillImageHandler } from '@/composables/useQuillImageHandler'

const { t } = useLocalization()
const { registerQuillImageHandler } = useQuillImageHandler()

// Import QuillEditor lazily
const QuillEditor = defineAsyncComponent(() => 
  import('@vueup/vue-quill').then(mod => {
    return mod.QuillEditor
  })
)

interface Props {
  title: string
  slug: string
  content: string
  shortDescription?: string
  editorOptions: any
  showGenerateSlug?: boolean
  errors?: {
    title?: string
    slug?: string
    content?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  slug: '',
  content: '',
  shortDescription: '',
  showGenerateSlug: false
})

// Tạo cấu hình toolbar mặc định nếu không nhận được từ props
const defaultEditorOptions = {
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

// Hợp nhất cấu hình từ props với cấu hình mặc định
const mergedEditorOptions = computed(() => {
  if (props.editorOptions?.modules?.toolbar) {
    return props.editorOptions
  }
  return defaultEditorOptions
})

const emit = defineEmits<{
  (e: 'update:title', value: string): void
  (e: 'update:slug', value: string): void
  (e: 'update:content', value: string): void
  (e: 'update:shortDescription', value: string): void
  (e: 'generate-slug'): void
}>()

const quillEditorRef = ref<any>(null)
const localTitle = ref(props.title)
const localSlug = ref(props.slug)
const localContent = ref(props.content)
const localShortDescription = ref(props.shortDescription)

// Xử lý khi editor đã sẵn sàng
const onEditorReady = (quill: any) => {
  // Lưu instance của quill để sử dụng khi upload ảnh
  if (process.client) {
    (window as any).currentQuillInstance = quill
    // Đăng ký handler cho nút image trong toolbar
    registerQuillImageHandler(quill)
  }
}

watch(() => props.title, (newVal) => {
  localTitle.value = newVal
})

watch(() => props.slug, (newVal) => {
  localSlug.value = newVal
})

watch(() => props.content, (newVal) => {
  localContent.value = newVal
})

watch(() => props.shortDescription, (newVal) => {
  localShortDescription.value = newVal
})

watch(localTitle, (newVal) => {
  emit('update:title', newVal)
})

watch(localSlug, (newVal) => {
  emit('update:slug', newVal)
})

watch(localContent, (newVal) => {
  emit('update:content', newVal)
})

watch(localShortDescription, (newVal) => {
  emit('update:shortDescription', newVal)
})
</script>


<style scoped>
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
</style> 