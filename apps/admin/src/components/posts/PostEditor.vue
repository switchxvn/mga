<template>
  <div class="space-y-6">
    <!-- Title & Slug Section -->
    <section class="grid gap-6 p-6 bg-white shadow-sm rounded-lg border border-slate-200">
      <div class="border-b border-slate-200 pb-6">
        <h3 class="text-lg font-medium text-slate-900 flex items-center gap-2">
          <TypeIcon class="w-5 h-5" />
          Basic Information
        </h3>
      </div>
      
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-900 flex items-center gap-2">
            <TypeIcon class="w-4 h-4" />
            Title
          </label>
          <input
            :value="title"
            type="text"
            placeholder="Enter a descriptive title"
            class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-900 flex items-center gap-2">
            <LinkIcon class="w-4 h-4" />
            URL Slug
          </label>
          <div class="flex gap-2">
            <input
              :value="slug"
              type="text"
              placeholder="url-friendly-slug"
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              @input="$emit('update:slug', ($event.target as HTMLInputElement).value)"
            />
            <button 
              @click="$emit('generate-slug')"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 w-10"
              title="Generate SEO-friendly URL"
            >
              <WandIcon class="w-4 h-4" />
            </button>
          </div>
          <p class="text-sm text-slate-500 flex items-center gap-2">
            <LinkIcon class="w-4 h-4" />
            /posts/{{ slug }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-900 flex items-center gap-2">
            <TypeIcon class="w-4 h-4" />
            Short Description
          </label>
          <textarea
            :value="shortDescription"
            rows="3"
            placeholder="Enter a short description for this post"
            class="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            @input="$emit('update:shortDescription', $event.target.value)"
          ></textarea>
        </div>
      </div>
    </section>

    <!-- Content Editor -->
    <section class="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
      <div class="p-6 border-b border-slate-200">
        <h3 class="text-lg font-medium text-slate-900 flex items-center gap-2">
          <PencilIcon class="w-5 h-5" />
          Content Editor
        </h3>
      </div>
      <div class="p-6">
        <ClientOnly>
          <QuillEditor
            :content="content"
            :options="editorOptions"
            contentType="html"
            placeholder="Write your post content here..."
            class="min-h-[500px] [&_.ql-editor]:min-h-[400px] [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-slate-200"
            @update:content="$emit('update:content', $event)"
          />
          <template #fallback>
            <div class="min-h-[500px] rounded-lg p-4 bg-slate-50">
              <div class="animate-pulse space-y-4">
                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-slate-200 rounded"></div>
                  <div class="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { TypeIcon, LinkIcon, WandIcon, PencilIcon } from 'lucide-vue-next'

defineProps<{
  title: string
  slug: string
  content: string
  shortDescription: string
  editorOptions: any
}>()

defineEmits<{
  'update:title': [value: string]
  'update:slug': [value: string]
  'update:content': [value: string]
  'update:shortDescription': [value: string]
  'generate-slug': []
}>()
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