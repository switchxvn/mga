<template>
  <div class="relative w-full h-full">
    <!-- Preview Area -->
    <div
      class="relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer shadow-sm group h-full"
      :class="[
        isDragging ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-2 border-dashed border-slate-300 hover:border-primary bg-slate-50 hover:bg-slate-100'
      ]"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <!-- Preview Image -->
      <template v-if="preview">
        <div class="absolute inset-0 w-full h-full">
          <img
            :src="preview"
            :alt="alt"
            class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            @error="onImageError"
          />
          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
            <div class="flex flex-col items-center mb-2">
              <div class="p-2 rounded-full bg-white/20 mb-2">
                <UploadCloudIcon class="w-6 h-6 text-white" />
              </div>
              <div class="text-white text-sm font-medium">{{ t('components.common.media.uploader.changeImage') }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- Upload Placeholder - Trống, chưa có ảnh -->
      <template v-else>
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 animate-pulse-subtle">
          <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ImagePlusIcon class="w-10 h-10 text-primary" />
          </div>
          <div class="text-center">
            <div class="text-base font-medium text-slate-700 mb-1">
              {{ t('components.common.media.uploader.uploadImage') }}
            </div>
            <div class="text-sm text-slate-500 max-w-xs">
              {{ t('components.common.media.uploader.dropHere') }}
            </div>
            <div class="mt-4">
              <button class="px-5 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center mx-auto gap-2">
                <UploadCloudIcon class="w-4 h-4" />
                {{ t('components.common.media.uploader.selectImage') }}
              </button>
            </div>
          </div>
          <div class="text-xs text-slate-400 mt-2 border-t border-slate-200 pt-3 w-full text-center">
            {{ t('components.common.media.uploader.supportedFormats') }}
          </div>
        </div>
      </template>

      <!-- Loading Overlay -->
      <div
        v-if="isUploading"
        class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="relative h-12 w-12">
            <div class="absolute inset-0 rounded-full border-4 border-primary/30"></div>
            <div class="absolute inset-0 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
          </div>
          <div class="text-white text-sm font-medium">{{ t('components.common.media.uploader.uploading') }}</div>
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
      class="absolute -bottom-6 left-0 text-sm text-red-500 bg-red-50 px-2 py-1 rounded flex items-center gap-1"
    >
      <AlertCircleIcon class="w-4 h-4" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UploadCloudIcon, AlertCircleIcon, ImagePlusIcon } from 'lucide-vue-next'
import { useUpload } from '../../../composables/useUpload'
import { useLocalization } from '../../../composables/useLocalization'

const { t } = useLocalization()

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

const { uploadImage, isUploading: uploading } = useUpload()
const isDragging = ref(false)
const isUploading = ref(false)
const error = ref('')
const progress = ref(0)

const fileInput = ref<HTMLInputElement>()

const validateFile = (file: File): boolean => {
  error.value = ''
  
  // Check file type
  if (props.accept) {
    const acceptedTypes = props.accept.split(',').map(type => type.trim())
    if (!acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(new RegExp(type.replace('*', '.*')))
    })) {
      error.value = t('components.common.media.uploader.invalidFormat')
      return false
    }
  }

  // Check file size
  if (props.maxSize && file.size > props.maxSize) {
    error.value = t('components.common.media.uploader.fileTooLarge', { size: formatFileSize(props.maxSize) })
    return false
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
  if (!validateFile(file)) return

  try {
    isUploading.value = true
    progress.value = 0
    
    // Sử dụng uploadImage từ composable
    const url = await uploadImage(file, 'products')
    emit('update:modelValue', url)
  } catch (err: any) {
    error.value = err?.message || t('components.common.media.uploader.uploadFailed')
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

<style scoped>
.opacity-enter-active,
.opacity-leave-active {
  transition: opacity 0.3s ease;
}

.opacity-enter-from,
.opacity-leave-to {
  opacity: 0;
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
</style> 