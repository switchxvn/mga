<template>
  <div class="relative group">
    <!-- Preview Area -->
    <div
      class="relative aspect-square rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
      :class="{ 'border-primary': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <!-- Preview Image -->
      <template v-if="preview">
        <img
          :src="preview"
          :alt="alt"
          class="w-full h-full object-cover"
          @error="onImageError"
        />
        <!-- Hover Overlay -->
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div class="text-white text-sm">Click or drag to replace</div>
        </div>
      </template>

      <!-- Upload Placeholder -->
      <template v-else>
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <UploadCloudIcon class="w-8 h-8 text-slate-400" />
          <div class="text-sm text-slate-500 text-center px-4">
            <span class="font-medium">Click to upload</span> or drag and drop
          </div>
        </div>
      </template>

      <!-- Loading Overlay -->
      <div
        v-if="isUploading"
        class="absolute inset-0 bg-black/50 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-2">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <div class="text-white text-sm">Uploading...</div>
        </div>
      </div>
    </div>

    <!-- File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Error Message -->
    <div
      v-if="error"
      class="absolute -bottom-6 left-0 text-sm text-red-500"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UploadCloudIcon } from 'lucide-vue-next'

// Base64 encoded transparent placeholder image
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const props = defineProps<{
  modelValue: string
  preview?: string
  accept?: string
  maxSize?: number // in bytes
  aspectRatio?: number
  alt?: string
  defaultImage?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'error': [message: string]
}>()

const isDragging = ref(false)
const isUploading = ref(false)
const error = ref('')

const fileInput = ref<HTMLInputElement>()

const validateFile = (file: File): boolean => {
  // Check file type
  if (props.accept) {
    const acceptedTypes = props.accept.split(',').map(type => type.trim())
    if (!acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(new RegExp(type.replace('*', '.*')))
    })) {
      error.value = 'Invalid file type'
      return false
    }
  }

  // Check file size
  if (props.maxSize && file.size > props.maxSize) {
    error.value = `File size should not exceed ${formatFileSize(props.maxSize)}`
    return false
  }

  // Check image dimensions if aspectRatio is specified
  if (props.aspectRatio) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const ratio = img.width / img.height
        if (Math.abs(ratio - props.aspectRatio!) > 0.01) {
          error.value = `Image aspect ratio should be ${props.aspectRatio}`
          resolve(false)
        }
        resolve(true)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  return true
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  await handleFile(file)
  input.value = '' // Reset input
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (!file) return

  await handleFile(file)
}

const handleFile = async (file: File) => {
  error.value = ''
  
  // Validate file
  if (!await validateFile(file)) return

  try {
    isUploading.value = true

    // Here you would typically upload the file to your server/storage
    // For now, we'll just create an object URL
    const url = URL.createObjectURL(file)
    emit('update:modelValue', url)
  } catch (err) {
    error.value = 'Failed to upload file'
    console.error('Upload error:', err)
  } finally {
    isUploading.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Handle image error without causing an infinite loop
const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    // Prevent error event from firing again by using a data URI
    target.src = props.defaultImage || FALLBACK_IMAGE;
    // Remove onerror handler to prevent potential loops
    target.onerror = null;
  }
}

// Watch for external preview changes
watch(() => props.preview, (newPreview) => {
  if (newPreview && !props.modelValue) {
    emit('update:modelValue', newPreview)
  }
})
</script> 