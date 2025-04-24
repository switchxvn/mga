<template>
  <section class="bg-white shadow-sm rounded-lg border border-slate-200">
    <div class="p-6 border-b border-slate-200">
      <h3 class="text-lg font-medium text-slate-900 flex items-center gap-2">
        <SearchIcon class="w-5 h-5" />
        SEO Settings
      </h3>
    </div>
    
    <div class="p-6">
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-900 flex items-center gap-2">
            <FileTextIcon class="w-4 h-4" />
            Meta Description
          </label>
          <textarea
            :value="metaDescription"
            placeholder="Enter SEO meta description"
            class="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            @input="$emit('update:metaDescription', ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
          <p 
            class="text-sm flex justify-end"
            :class="{
              'text-slate-500': (metaDescription?.length || 0) <= 160,
              'text-red-500': (metaDescription?.length || 0) > 160
            }"
          >
            {{ metaDescription?.length || 0 }}/160 characters
          </p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-900 flex items-center gap-2">
            <TagsIcon class="w-4 h-4" />
            Tags
          </label>
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(tag, index) in tags"
                :key="index"
                class="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-sm"
              >
                <span>{{ tag }}</span>
                <button
                  @click="$emit('remove-tag', index)"
                  class="hover:text-red-500"
                >
                  <XIcon class="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              :value="tagsInput"
              type="text"
              @keydown="$emit('tag-input', $event)"
              placeholder="Enter tags, separated by commas or space"
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              @input="$emit('update:tagsInput', ($event.target as HTMLInputElement).value)"
            />
            <p class="text-sm text-slate-500">
              Example: technology, web development
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SearchIcon, FileTextIcon, TagsIcon, XIcon } from 'lucide-vue-next'

defineProps<{
  metaDescription: string
  tags: string[]
  tagsInput: string
}>()

defineEmits<{
  'update:metaDescription': [value: string]
  'update:tagsInput': [value: string]
  'remove-tag': [index: number]
  'tag-input': [event: KeyboardEvent]
}>()
</script> 