<template>
  <section class="bg-white shadow-sm rounded-lg border border-slate-200">
    <div class="p-6 border-b border-slate-200">
      <h3 class="text-lg font-medium text-slate-900 flex items-center gap-2">
        <ImageIcon class="w-5 h-5" />
        Featured Image
      </h3>
    </div>
    
    <div class="p-6">
      <div class="space-y-4">
        <div 
          v-if="featuredImage" 
          class="aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group relative"
        >
          <img 
            :src="featuredImage" 
            alt="Featured image" 
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            @click="handleRemoveImage"
            class="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>
        <div 
          v-else 
          class="aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2"
        >
          <div class="rounded-full bg-slate-100 p-3">
            <ImageIcon class="w-6 h-6 text-slate-400" />
          </div>
          <p class="text-sm text-slate-500">No image selected</p>
        </div>
        
        <div class="space-y-2">
          <input
            :value="featuredImage"
            type="text"
            placeholder="Enter image URL or upload"
            class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            @input="$emit('update:featuredImage', ($event.target as HTMLInputElement).value)"
          />
          <p class="text-sm text-slate-500 flex items-center gap-2">
            <RulerIcon class="w-4 h-4" />
            Recommended: 1200x630px
          </p>
        </div>
        
        <div class="space-y-3">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <div v-if="uploadProgress !== null" class="space-y-2">
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-sm text-slate-500 text-center">
              Uploading... {{ Math.round(uploadProgress) }}%
            </p>
          </div>
          
          <button 
            v-else
            class="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-slate-200 hover:bg-slate-100 h-10"
            @click="handleUploadClick"
            :disabled="isUploading"
          >
            <UploadIcon class="w-4 h-4 mr-2" />
            Upload Image
          </button>
        </div>

        <p v-if="error" class="text-sm text-red-500 flex items-center gap-2">
          <AlertCircleIcon class="w-4 h-4" />
          {{ error }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ImageIcon, RulerIcon, UploadIcon, XIcon, AlertCircleIcon } from 'lucide-vue-next'
import { useUpload } from '../../composables/useUpload'

const props = defineProps<{
  featuredImage: string
}>()

const emit = defineEmits<{
  'update:featuredImage': [value: string]
}>()

const { uploadFile } = useUpload()

const fileInput = ref<HTMLInputElement | null>(null)
const uploadProgress = ref<number | null>(null)
const isUploading = ref(false)
const error = ref<string | null>(null)

const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleRemoveImage = () => {
  emit('update:featuredImage', '')
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image size should be less than 5MB'
    return
  }
  
  try {
    isUploading.value = true
    error.value = null
    uploadProgress.value = 0
    
    const result = await uploadFile({
      file,
      folder: 'posts',
      onProgress: (progress) => {
        uploadProgress.value = progress
      }
    })
    
    emit('update:featuredImage', result.url)
  } catch (err) {
    error.value = 'Failed to upload image. Please try again.'
    console.error('Upload error:', err)
  } finally {
    isUploading.value = false
    uploadProgress.value = null
    input.value = ''
  }
}
</script> 