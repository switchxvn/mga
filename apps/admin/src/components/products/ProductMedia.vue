<template>
  <div class="grid gap-6">
    <!-- Thumbnail Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Product Thumbnail</h3>
        <p class="text-sm text-slate-500">Upload your product's main image</p>
      </div>
      <div class="p-6">
        <MediaUploader
          v-model="localThumbnail"
          :aspect-ratio="1"
          class="max-w-[300px]"
          accept="image/*"
          :preview="thumbnail"
          @update:model-value="$emit('update:thumbnail', $event)"
          default-image="/images/default/default-image.jpg"
        />
      </div>
    </div>

    <!-- Gallery Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Product Gallery</h3>
        <p class="text-sm text-slate-500">Add additional product images</p>
      </div>
      <div class="p-6">
        <div class="grid gap-6">
          <!-- Gallery Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <template v-for="(image, index) in localGallery" :key="index">
              <div class="relative group aspect-square rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                <img
                  :src="image"
                  :alt="'Product gallery image ' + (index + 1)"
                  class="w-full h-full object-cover"
                  @error="onImageError"
                />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    @click="moveImage(index, index - 1)"
                    :disabled="index === 0"
                    class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="removeImage(index)"
                    class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="moveImage(index, index + 1)"
                    :disabled="index === localGallery.length - 1"
                    class="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </template>

            <!-- Upload Button -->
            <div
              class="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer"
              @click="$refs.galleryInput.click()"
            >
              <PlusIcon class="w-6 h-6 text-slate-400" />
              <span class="text-sm text-slate-500">Add Image</span>
              <input
                ref="galleryInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleGalleryUpload"
                multiple
              />
            </div>
          </div>

          <!-- Help Text -->
          <p class="text-sm text-slate-500">
            You can upload up to 8 images. Drag and drop to reorder.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from 'lucide-vue-next'
import MediaUploader from '../common/media/MediaUploader.vue'

const props = defineProps<{
  thumbnail: string
  gallery: string[]
}>()

const emit = defineEmits<{
  'update:thumbnail': [value: string]
  'update:gallery': [value: string[]]
}>()

const localThumbnail = ref(props.thumbnail)
const localGallery = ref([...props.gallery])

// Base64 encoded transparent placeholder image 
const FALLBACK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Watch for prop changes
watch(() => props.thumbnail, (newValue) => {
  localThumbnail.value = newValue
})

watch(() => props.gallery, (newValue) => {
  localGallery.value = [...newValue]
})

// Gallery methods
const handleGalleryUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const files = Array.from(input.files)
  const maxFiles = 8 - localGallery.value.length
  const filesToUpload = files.slice(0, maxFiles)

  for (const file of filesToUpload) {
    try {
      // Here you would typically upload the file to your server/storage
      // For now, we'll just create an object URL
      const url = URL.createObjectURL(file)
      localGallery.value.push(url)
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  emit('update:gallery', localGallery.value)
  input.value = '' // Reset input
}

const removeImage = (index: number) => {
  localGallery.value.splice(index, 1)
  emit('update:gallery', localGallery.value)
}

const moveImage = (fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= localGallery.value.length) return
  
  const images = [...localGallery.value]
  const [removed] = images.splice(fromIndex, 1)
  images.splice(toIndex, 0, removed)
  
  localGallery.value = images
  emit('update:gallery', localGallery.value)
}

// Handle image error without causing an infinite loop
const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    // Use a data URI to prevent infinite error loops
    target.src = FALLBACK_IMAGE;
    // Remove onerror handler to prevent potential loops
    target.onerror = null;
  }
}
</script> 