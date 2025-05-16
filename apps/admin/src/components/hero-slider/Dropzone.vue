<template>
  <div class="border-2 border-dashed rounded p-4 text-center cursor-pointer" @drop.prevent="onDrop" @dragover.prevent @click="onClick">
    <slot>{{ t('components.common.media.uploader.dropHere') }}</slot>
    <input type="file" accept="image/*" class="hidden" ref="fileInput" @change="onFileChange" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
const emit = defineEmits(['file-drop'])
const fileInput = ref<HTMLInputElement | null>(null)
function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files && files.length > 0) emit('file-drop', files[0])
}
function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) emit('file-drop', files[0])
}
function onClick() {
  fileInput.value?.click()
}
</script> 