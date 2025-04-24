<template>
  <div class="grid gap-6">
    <!-- Meta Description Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Meta Description</h3>
        <p class="text-sm text-slate-500">Write a description to help search engines better understand your product</p>
      </div>
      <div class="p-6">
        <div class="grid gap-2">
          <textarea
            :value="metaDescription"
            @input="$emit('update:meta-description', ($event.target as HTMLTextAreaElement).value)"
            rows="3"
            class="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter meta description..."
          ></textarea>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Recommended length: 150-160 characters</span>
            <span :class="{ 'text-red-500': metaDescription.length > 160 }">
              {{ metaDescription.length }}/160
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tags Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Product Tags</h3>
        <p class="text-sm text-slate-500">Add tags to help customers find your product</p>
      </div>
      <div class="p-6">
        <div class="grid gap-4">
          <!-- Tags Input -->
          <div class="grid gap-2">
            <div class="flex flex-wrap gap-2 p-3 rounded-md border border-slate-200 bg-white min-h-[42px]">
              <!-- Tags -->
              <template v-for="(tag, index) in tags" :key="index">
                <div class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">
                  <span>{{ tag }}</span>
                  <button
                    type="button"
                    @click="$emit('remove-tag', index)"
                    class="rounded-full p-0.5 hover:bg-slate-200 transition-colors"
                  >
                    <XIcon class="w-3 h-3" />
                  </button>
                </div>
              </template>

              <!-- Input -->
              <input
                type="text"
                :value="tagsInput"
                @input="$emit('update:tags-input', ($event.target as HTMLInputElement).value)"
                @keydown="$emit('tag-input', $event)"
                class="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none"
                placeholder="Type and press Enter or Space to add tags"
              />
            </div>
          </div>

          <!-- Help Text -->
          <div class="text-sm text-slate-500">
            <p>Press Enter or Space to add tags. Use backspace to remove the last tag.</p>
            <p class="mt-1">Popular tags: electronics, clothing, accessories, home decor</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'

defineProps<{
  metaDescription: string
  tagsInput: string
  tags: string[]
}>()

defineEmits<{
  'update:meta-description': [value: string]
  'update:tags-input': [value: string]
  'tag-input': [event: KeyboardEvent]
  'remove-tag': [index: number]
}>()
</script> 