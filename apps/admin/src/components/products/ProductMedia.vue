<template>
  <div class="grid gap-6">
    <!-- Media Preview & Editor - Kết hợp tải lên và xem trước -->
    <div class="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div class="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-medium">Ảnh sản phẩm</h3>
          <p class="text-sm text-slate-500">Tải lên và quản lý ảnh sản phẩm</p>
        </div>
        <button 
          @click="openGalleryInput"
          class="px-3 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
          :disabled="isUploading || localGallery.length >= 8"
        >
          <PlusIcon class="h-4 w-4" />
          <span class="text-sm font-medium">Thêm ảnh</span>
        </button>
      </div>
      
      <div class="p-6">
        <!-- Product Preview with Upload Controls -->
        <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <!-- Preview Header - Giống trang web thật -->
          <div class="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <div class="flex items-center text-xs text-slate-500">
              <MonitorIcon class="h-3.5 w-3.5 mr-1.5" />
              <span>Xem trước trang chi tiết sản phẩm</span>
            </div>
            <div class="text-xs text-primary flex items-center">
              <InfoIcon class="h-3.5 w-3.5 mr-1" />
              <span>Nhấp hoặc kéo thả ảnh vào khu vực được đánh dấu</span>
            </div>
          </div>
          
          <!-- Preview Content with Upload Controls -->
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Left Side - Image Gallery with Upload Controls -->
              <div class="space-y-4">
                <!-- Main Image Area - Row with main image and gallery upload -->
                <div class="grid grid-cols-6 gap-2">
                  <!-- Main Image - Upload ảnh đại diện với kéo thả -->
                  <div 
                    class="aspect-square border border-dashed border-slate-300 rounded-md overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer relative group col-span-5"
                    @click="$refs.thumbnailInput.click()"
                    @dragover.prevent="isDraggingThumbnail = true"
                    @dragleave.prevent="isDraggingThumbnail = false"
                    @drop.prevent="handleThumbnailDrop"
                  >
                    <!-- Upload icon overlay when hovering -->
                    <div 
                      class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 transition-opacity"
                      :class="isDraggingThumbnail ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                    >
                      <UploadCloudIcon class="h-10 w-10 text-white mb-2" />
                      <span class="text-white text-sm font-medium">
                        {{ isDraggingThumbnail ? 'Thả để tải lên' : 'Tải lên ảnh đại diện' }}
                      </span>
                      <span class="text-white/70 text-xs mt-1">hoặc nhấp để chọn ảnh</span>
                    </div>
                    
                    <!-- Thumbnail image if available -->
                    <div v-if="localThumbnail" class="image-preview image-preview-large">
                      <img 
                        :src="localThumbnail" 
                        alt="Ảnh sản phẩm chính" 
                        @error="onThumbnailError" 
                      />
                    </div>
                    
                    <!-- Upload placeholder if no image -->
                    <div v-else class="flex flex-col items-center justify-center text-slate-300 p-4">
                      <ImageIcon class="h-16 w-16 mb-2" />
                      <p class="text-sm text-slate-500 text-center mb-1">Tải lên ảnh đại diện</p>
                      <p class="text-xs text-slate-400 text-center">Khuyến nghị: 1000 x 1000px</p>
                    </div>
                    
                    <!-- Hidden file input for thumbnail -->
                    <input
                      ref="thumbnailInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleThumbnailUpload"
                    />
                  </div>
                  
                  <!-- Gallery Drop Area - Bên cạnh ảnh chính -->
                  <div
                    class="aspect-square border-2 border-dashed border-primary/30 rounded-md overflow-hidden transition-colors col-span-1"
                    :class="{
                      'bg-primary/5': isDraggingGallery,
                      'bg-slate-50 hover:bg-primary/5': !isDraggingGallery
                    }"
                    @dragover.prevent="isDraggingGallery = true"
                    @dragleave.prevent="isDraggingGallery = false"
                    @drop.prevent="handleGalleryDrop"
                    @click="openGalleryInput"
                  >
                    <div class="flex flex-col items-center justify-center h-full">
                      <UploadCloudIcon 
                        class="h-6 w-6 mb-1 transition-colors" 
                        :class="isDraggingGallery ? 'text-primary' : 'text-slate-300'"
                      />
                      <p class="text-xs font-medium text-center text-slate-700">
                        {{ isDraggingGallery ? 'Thả để tải lên' : 'Thêm ảnh' }}
                      </p>
                      <input
                        ref="galleryInput"
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="handleGalleryUpload"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Gallery thumbnails -->
                <div class="grid grid-cols-6 gap-2">
                  <div 
                    v-for="(image, index) in localGallery.slice(0, 6)" 
                    :key="index"
                    class="aspect-square border border-slate-200 rounded-md overflow-hidden bg-slate-50 cursor-pointer relative group"
                    @click="handleGalleryItemClick(index)"
                  >
                    <!-- Hover overlay with actions -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                      <button
                        @click.stop="setAsMainImage(index)"
                        class="p-1.5 rounded-full bg-primary text-white hover:bg-primary-dark"
                        title="Đặt làm ảnh chính"
                      >
                        <CheckIcon class="w-3.5 h-3.5" />
                      </button>
                      <button
                        @click.stop="removeImage(index)"
                        class="p-1.5 rounded-full bg-primary text-white hover:bg-primary-dark"
                        title="Xóa ảnh"
                      >
                        <TrashIcon class="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <!-- Gallery image container -->
                    <div class="image-preview image-preview-small gallery-preview-container">
                      <img 
                        :src="image" 
                        :alt="`Ảnh sản phẩm ${index+1}`" 
                        @error="(e) => onImageError(e, index)"
                      />
                    </div>
                  </div>
                  
                  <!-- Additional Gallery Images (if needed) -->
                  <div 
                    v-for="(image, index) in localGallery.slice(6, 8)" 
                    :key="index + 6"
                    class="aspect-square border border-slate-200 rounded-md overflow-hidden bg-slate-50 cursor-pointer relative group"
                    @click="handleGalleryItemClick(index + 6)"
                  >
                    <!-- Hover overlay with actions -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                      <button
                        @click.stop="setAsMainImage(index + 6)"
                        class="p-1.5 rounded-full bg-primary text-white hover:bg-primary-dark"
                        title="Đặt làm ảnh chính"
                      >
                        <CheckIcon class="w-3.5 h-3.5" />
                      </button>
                      <button
                        @click.stop="removeImage(index + 6)"
                        class="p-1.5 rounded-full bg-primary text-white hover:bg-primary-dark"
                        title="Xóa ảnh"
                      >
                        <TrashIcon class="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <!-- Gallery image container -->
                    <div class="image-preview image-preview-small gallery-preview-container">
                      <img 
                        :src="image" 
                        :alt="`Ảnh sản phẩm ${index + 7}`" 
                        @error="(e) => onImageError(e, index + 6)"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Gallery Management Tools -->
                <div v-if="localGallery.length > 0" class="border border-slate-200 rounded-md p-3 bg-slate-50">
                  <div class="flex justify-between items-center">
                    <div class="text-xs text-slate-600 flex items-center gap-1">
                      <ImagesIcon class="w-3.5 h-3.5" />
                      <span>Thư viện ảnh ({{ localGallery.length }}/8)</span>
                    </div>
                    <button 
                      v-if="localGallery.length < 8"
                      @click="openGalleryInput"
                      class="text-xs text-primary font-medium flex items-center hover:underline"
                    >
                      <PlusIcon class="h-3 w-3 mr-1" />
                      <span>Thêm ảnh</span>
                    </button>
                  </div>
                  
                  <!-- Gallery Grid for Reordering -->
                  <div v-if="localGallery.length > 0" class="grid grid-cols-6 gap-2 mt-3">
                    <div 
                      v-for="(image, index) in localGallery" 
                      :key="index"
                      class="aspect-square border border-slate-200 rounded-md overflow-hidden bg-slate-50 cursor-move relative group"
                    >
                      <!-- Hover overlay with actions -->
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <div class="flex gap-1">
                          <button
                            @click="moveImage(index, index - 1)"
                            :disabled="index === 0"
                            class="p-1 rounded-full bg-primary text-white disabled:opacity-50 hover:bg-primary-dark"
                            title="Di chuyển sang trái"
                          >
                            <ChevronLeftIcon class="w-3 h-3" />
                          </button>
                          <button
                            @click.stop="setAsMainImage(index)"
                            class="p-1 rounded-full bg-primary text-white hover:bg-primary-dark"
                            title="Đặt làm ảnh chính"
                          >
                            <CheckIcon class="w-3 h-3" />
                          </button>
                          <button
                            @click.stop="removeImage(index)"
                            class="p-1 rounded-full bg-primary text-white hover:bg-primary-dark"
                            title="Xóa ảnh"
                          >
                            <XIcon class="w-3 h-3" />
                          </button>
                          <button
                            @click="moveImage(index, index + 1)"
                            :disabled="index === localGallery.length - 1"
                            class="p-1 rounded-full bg-primary text-white disabled:opacity-50 hover:bg-primary-dark"
                            title="Di chuyển sang phải"
                          >
                            <ChevronRightIcon class="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <!-- Gallery image thumbnail -->
                      <div class="image-preview image-preview-small gallery-preview-container">
                        <img 
                          :src="image" 
                          :alt="`Ảnh sản phẩm ${index+1}`" 
                        />
                      </div>
                      
                      <!-- Image number badge -->
                      <div class="absolute top-0.5 left-0.5 text-[10px] bg-primary text-white rounded px-1 z-10">
                        {{ index + 1 }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Right Side - Product Info Preview -->
              <div class="space-y-4">
                <div class="space-y-1 border-b border-slate-100 pb-3">
                  <div class="h-7 w-3/4 rounded bg-slate-200 animate-pulse"></div>
                  <div class="h-6 w-1/3 rounded bg-slate-200 animate-pulse mt-2"></div>
                </div>
                
                <div class="h-24 border border-slate-200 rounded-md bg-slate-50 p-3">
                  <div class="h-4 w-3/4 rounded bg-slate-200 mb-2"></div>
                  <div class="h-4 w-1/2 rounded bg-slate-200 mb-2"></div>
                  <div class="h-4 w-2/3 rounded bg-slate-200"></div>
                </div>
                
                <div class="flex gap-3">
                  <div class="flex-1">
                    <div class="border border-slate-200 rounded-md h-10 flex items-center justify-center px-4 gap-3">
                      <MinusIcon class="h-4 w-4 text-slate-400" />
                      <span class="text-sm">1</span>
                      <PlusIcon class="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div class="flex-[2]">
                    <div class="bg-primary text-white rounded-md h-10 flex items-center justify-center">
                      <ShoppingCartIcon class="h-4 w-4 mr-2" />
                      <span class="text-sm font-medium">Thêm vào giỏ hàng</span>
                    </div>
                  </div>
                </div>
                
                <div class="border-t border-slate-200 pt-4 flex gap-3">
                  <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShareIcon class="h-4 w-4 text-slate-400" />
                  </div>
                  <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <HeartIcon class="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                
                <!-- Mobile-friendly explanation -->
                <div class="border border-slate-200 rounded-md p-3 bg-slate-50 text-xs text-slate-600 flex items-start gap-2 mt-4">
                  <InfoIcon class="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="font-medium mb-1">Cách sử dụng:</p>
                    <ul class="space-y-1 list-disc list-inside text-slate-500">
                      <li>Nhấp vào ảnh lớn ở bên trái để tải lên ảnh đại diện</li>
                      <li>Sử dụng ô "Thêm ảnh" ở bên phải để tải lên thư viện ảnh</li>
                      <li>Nhấp vào ảnh trong thư viện để quản lý: đặt làm ảnh chính, xóa...</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Description Section -->
            <div class="mt-8 border-t border-slate-200 pt-4">
              <div class="mb-4 flex border-b border-slate-200">
                <div class="px-4 py-2 border-b-2 border-primary text-primary font-medium">Mô tả</div>
                <div class="px-4 py-2 text-slate-500">Thông số kỹ thuật</div>
              </div>
              <div class="space-y-2 p-2">
                <div class="h-4 w-full rounded bg-slate-200 animate-pulse"></div>
                <div class="h-4 w-5/6 rounded bg-slate-200 animate-pulse"></div>
                <div class="h-4 w-3/4 rounded bg-slate-200 animate-pulse"></div>
                <div class="h-4 w-4/5 rounded bg-slate-200 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Loading Indicator -->
        <div v-if="isUploading" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-xl flex items-center gap-4">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <div>
              <p class="text-slate-800 font-medium">Đang tải lên...</p>
              <p class="text-slate-500 text-sm">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Help Information -->
    <div class="bg-blue-50 p-4 rounded-md border border-blue-100 flex gap-3">
      <InfoIcon class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div>
        <h4 class="text-sm font-medium text-blue-700 mb-1">Lời khuyên về ảnh sản phẩm</h4>
        <ul class="text-xs text-blue-600 space-y-1 list-disc list-inside">
          <li>Sử dụng ảnh có độ phân giải cao (khuyến nghị 1000x1000 pixel hoặc lớn hơn)</li>
          <li>Ảnh đại diện nên thể hiện rõ sản phẩm với nền trắng hoặc trong suốt</li>
          <li>Tải lên nhiều ảnh ở các góc khác nhau để khách hàng nhìn rõ sản phẩm</li>
          <li>Đảm bảo ánh sáng tốt và ảnh không bị mờ</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, 
  XIcon, InfoIcon, AlertCircleIcon, ImageIcon, ImagesIcon, 
  UploadCloudIcon, LayoutIcon, MonitorIcon, MinusIcon,
  ShoppingCartIcon, ShareIcon, HeartIcon, CheckIcon
} from 'lucide-vue-next'
import { useToast } from 'vue-toastification'
import { useUpload } from '../../composables/useUpload'

const { uploadImage, isUploading } = useUpload()
const toast = useToast()

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
const galleryInput = ref<HTMLInputElement | null>(null)
const thumbnailInput = ref<HTMLInputElement | null>(null)
const isDraggingThumbnail = ref(false)
const isDraggingGallery = ref(false)

// Default image path
const DEFAULT_IMAGE = '/images/default/default-image.jpg';

// Watch for prop changes
watch(() => props.thumbnail, (newValue) => {
  localThumbnail.value = newValue
})

watch(() => props.gallery, (newValue) => {
  localGallery.value = [...newValue]
})

// Handle thumbnail upload
const handleThumbnailUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  console.log(`Starting thumbnail upload: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)
  
  // Kiểm tra định dạng file
  if (!file.type.startsWith('image/')) {
    toast.error('Chỉ chấp nhận file hình ảnh')
    input.value = ''
    return
  }

  // Hiển thị ảnh tạm thời ngay lập tức để cải thiện UX
  const tempURL = URL.createObjectURL(file)
  localThumbnail.value = tempURL
  
  try {
    toast.info('Đang xử lý ảnh...')
    // Thêm xử lý hình ảnh để đảm bảo tỉ lệ 1:1
    const url = await processAndUploadImage(file, 'products')
    console.log(`Thumbnail upload success, URL: ${url}`)
    
    // Update thumbnail với URL chính thức sau khi tải lên
    localThumbnail.value = url
    
    // Emit event to update thumbnail in parent component
    emit('update:thumbnail', url)
    
    // Show success message
    toast.success('Đã tải lên ảnh đại diện thành công')
    
    // Giải phóng bộ nhớ
    URL.revokeObjectURL(tempURL)
  } catch (error) {
    console.error('Failed to upload thumbnail:', error)
    toast.error('Tải lên ảnh đại diện thất bại')
    // Nếu lỗi, xóa ảnh preview tạm thời
    if (localThumbnail.value === tempURL) {
      localThumbnail.value = ''
    }
    // Giải phóng bộ nhớ
    URL.revokeObjectURL(tempURL)
  } finally {
    input.value = '' // Reset input
  }
}

// Process image to ensure 1:1 ratio before uploading
const processAndUploadImage = async (file: File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Processing image for 1:1 ratio: ${file.name}`)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      console.log('FileReader loaded image data')
      const img = new Image()
      
      img.onload = async () => {
        console.log(`Image loaded for processing, dimensions: ${img.width}x${img.height}`)
        try {
          // Determine the size and positioning for the square crop
          const size = Math.min(img.width, img.height)
          const x = (img.width - size) / 2
          const y = (img.height - size) / 2
          console.log(`Cropping dimensions: size=${size}, x=${x}, y=${y}`)
          
          // Create canvas with 1:1 ratio
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            console.error('Failed to get canvas context')
            reject(new Error('Không thể tạo context canvas'))
            return
          }
          
          // Draw cropped image
          ctx.drawImage(img, x, y, size, size, 0, 0, size, size)
          console.log('Image cropped on canvas')
          
          // Convert to Blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              console.error('Failed to create blob from canvas')
              reject(new Error('Không thể tạo Blob từ canvas'))
              return
            }
            console.log(`Created blob: size=${blob.size} bytes, type=${blob.type}`)
            
            // Create a new File object from the blob
            const croppedFile = new File([blob], file.name, { 
              type: file.type,
              lastModified: file.lastModified 
            })
            console.log(`Created cropped file: ${croppedFile.name}, size=${croppedFile.size} bytes`)
            
            try {
              // Upload the processed image
              console.log('Starting upload of processed image')
              const url = await uploadImage(croppedFile, folder)
              console.log(`Upload successful, URL: ${url}`)
              resolve(url)
            } catch (error) {
              console.error('Error uploading processed image:', error)
              reject(error)
            }
          }, file.type)
        } catch (error) {
          console.error('Error processing image:', error)
          reject(error)
        }
      }
      
      img.onerror = (error) => {
        console.error('Image loading error:', error)
        reject(new Error('Không thể tải hình ảnh'))
      }
      
      img.src = e.target?.result as string
      console.log('Set image source from FileReader result')
    }
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error)
      reject(new Error('Không thể đọc file'))
    }
    
    reader.readAsDataURL(file)
    console.log('Started reading file as Data URL')
  })
}

// Handle thumbnail drop
const handleThumbnailDrop = async (event: DragEvent) => {
  isDraggingThumbnail.value = false
  if (!event.dataTransfer?.files.length) return
  
  const file = event.dataTransfer.files[0]
  if (!file.type.startsWith('image/')) {
    toast.error('Chỉ chấp nhận file hình ảnh')
    return
  }
  
  // Hiển thị ảnh tạm thời ngay lập tức
  const tempURL = URL.createObjectURL(file)
  localThumbnail.value = tempURL
  
  try {
    toast.info('Đang xử lý ảnh...')
    const url = await processAndUploadImage(file, 'products')
    // Cập nhật với URL chính thức
    localThumbnail.value = url
    emit('update:thumbnail', url)
    toast.success('Đã tải lên ảnh đại diện thành công')
    // Giải phóng bộ nhớ
    URL.revokeObjectURL(tempURL)
  } catch (error) {
    console.error('Failed to upload thumbnail via drag & drop:', error)
    toast.error('Tải lên ảnh đại diện thất bại')
    // Xóa ảnh tạm nếu lỗi
    if (localThumbnail.value === tempURL) {
      localThumbnail.value = ''
    }
    // Giải phóng bộ nhớ
    URL.revokeObjectURL(tempURL)
  }
}

// Handle thumbnail error
const onThumbnailError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = DEFAULT_IMAGE;
    target.onerror = null;
  }
}

// Open gallery input safely
const openGalleryInput = () => {
  if (galleryInput.value) {
    galleryInput.value.click()
  }
}

// Handle gallery item click
const handleGalleryItemClick = (index: number) => {
  // Hiển thị preview hoặc hành động khác khi nhấp vào ảnh gallery
  // Có thể mở một dialog hiển thị ảnh to hơn
  
  // Ví dụ: tạm thời set làm ảnh chính
  setAsMainImage(index);
}

// Handle gallery upload
const handleGalleryUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const files = Array.from(input.files)
  const maxFiles = 8 - localGallery.value.length
  const filesToUpload = files.slice(0, maxFiles).filter(file => file.type.startsWith('image/'))
  
  if (filesToUpload.length === 0) {
    if (files.some(file => !file.type.startsWith('image/'))) {
      toast.error('Chỉ chấp nhận file hình ảnh')
    } else {
      toast.info('Bạn đã đạt đến số lượng ảnh tối đa (8 ảnh)')
    }
    input.value = ''
    return
  }

  // Tạo tạm thời các URL cho preview ngay lập tức
  const tempUrlMap = new Map<File, string>()
  const tempGallery = [...localGallery.value]
  
  filesToUpload.forEach(file => {
    const tempUrl = URL.createObjectURL(file)
    tempUrlMap.set(file, tempUrl)
    tempGallery.push(tempUrl)
  })
  
  // Cập nhật gallery với ảnh tạm thời để hiển thị ngay
  localGallery.value = tempGallery

  try {
    toast.info(`Đang xử lý ${filesToUpload.length} ảnh...`)
    
    // Upload all files with 1:1 processing
    const uploadPromises = filesToUpload.map(async (file, index) => {
      try {
        const tempUrl = tempUrlMap.get(file) as string
        const url = await processAndUploadImage(file, 'products')
        
        // Thay thế URL tạm thời bằng URL thật sau khi tải lên
        const tempIndex = localGallery.value.indexOf(tempUrl)
        if (tempIndex !== -1) {
          localGallery.value.splice(tempIndex, 1, url)
          // Cập nhật gallery sau mỗi lần thay thế để UI cập nhật
          localGallery.value = [...localGallery.value]
          emit('update:gallery', localGallery.value)
        }
        
        // Giải phóng bộ nhớ
        URL.revokeObjectURL(tempUrl)
        
        return url
      } catch (error) {
        console.error('Failed to upload image:', error)
        toast.error(`Tải lên ảnh ${file.name} thất bại`)
        
        // Xóa URL tạm thời khỏi gallery nếu upload thất bại
        const tempUrl = tempUrlMap.get(file) as string
        const tempIndex = localGallery.value.indexOf(tempUrl)
        if (tempIndex !== -1) {
          localGallery.value.splice(tempIndex, 1)
          localGallery.value = [...localGallery.value]
          emit('update:gallery', localGallery.value)
        }
        
        // Giải phóng bộ nhớ
        URL.revokeObjectURL(tempUrl)
        
        return null
      }
    })

    // Wait for all uploads
    const uploadedUrls = await Promise.all(uploadPromises)
    
    // Filter out failed uploads
    const validUrls = uploadedUrls.filter(url => url !== null) as string[]
    
    // Notify parent component một lần nữa để đảm bảo đồng bộ
    emit('update:gallery', localGallery.value)
    
    // Show success message
    if (validUrls.length > 0) {
      toast.success(`Đã tải lên thành công ${validUrls.length} ảnh`)
    }
  } catch (error) {
    console.error('Gallery upload error:', error)
    toast.error('Tải ảnh thất bại')
    
    // Xóa tất cả URL tạm thời nếu có lỗi tổng thể
    tempUrlMap.forEach((tempUrl) => {
      const tempIndex = localGallery.value.indexOf(tempUrl)
      if (tempIndex !== -1) {
        localGallery.value.splice(tempIndex, 1)
      }
      URL.revokeObjectURL(tempUrl)
    })
    
    localGallery.value = [...localGallery.value]
    emit('update:gallery', localGallery.value)
  } finally {
    input.value = '' // Reset input
  }
}

// Handle gallery drop with multiple files
const handleGalleryDrop = async (event: DragEvent) => {
  isDraggingGallery.value = false
  if (!event.dataTransfer?.files.length) return
  
  const files = Array.from(event.dataTransfer.files)
  const maxFiles = 8 - localGallery.value.length
  const filesToUpload = files.slice(0, maxFiles).filter(file => file.type.startsWith('image/'))
  
  if (filesToUpload.length === 0) {
    if (files.some(file => !file.type.startsWith('image/'))) {
      toast.error('Chỉ chấp nhận file hình ảnh')
    } else {
      toast.info('Bạn đã đạt đến số lượng ảnh tối đa (8 ảnh)')
    }
    return
  }

  // Tạo tạm thời các URL cho preview ngay lập tức
  const tempUrlMap = new Map<File, string>()
  const tempGallery = [...localGallery.value]
  
  filesToUpload.forEach(file => {
    const tempUrl = URL.createObjectURL(file)
    tempUrlMap.set(file, tempUrl)
    tempGallery.push(tempUrl)
  })
  
  // Cập nhật gallery với ảnh tạm thời để hiển thị ngay
  localGallery.value = tempGallery

  try {
    toast.info(`Đang xử lý ${filesToUpload.length} ảnh...`)
    
    // Xử lý tải lên tuần tự để cập nhật UI từng ảnh một
    for (const file of filesToUpload) {
      try {
        const tempUrl = tempUrlMap.get(file) as string
        const url = await processAndUploadImage(file, 'products')
        
        // Thay thế URL tạm thời bằng URL thật sau khi tải lên
        const tempIndex = localGallery.value.indexOf(tempUrl)
        if (tempIndex !== -1) {
          localGallery.value.splice(tempIndex, 1, url)
          // Cập nhật gallery sau mỗi lần thay thế để UI cập nhật
          localGallery.value = [...localGallery.value]
          emit('update:gallery', localGallery.value)
        }
        
        // Giải phóng bộ nhớ
        URL.revokeObjectURL(tempUrl)
      } catch (error) {
        console.error(`Failed to upload image: ${file.name}`, error)
        
        // Xóa URL tạm thời khỏi gallery nếu upload thất bại
        const tempUrl = tempUrlMap.get(file) as string
        const tempIndex = localGallery.value.indexOf(tempUrl)
        if (tempIndex !== -1) {
          localGallery.value.splice(tempIndex, 1)
          localGallery.value = [...localGallery.value]
        }
        
        // Giải phóng bộ nhớ
        URL.revokeObjectURL(tempUrl)
      }
    }
    
    // Thông báo hoàn thành
    toast.success(`Đã tải lên thành công ${filesToUpload.length} ảnh`)
    
    // Cập nhật gallery một lần cuối
    emit('update:gallery', localGallery.value)
  } catch (error) {
    console.error('Gallery upload error via drag & drop:', error)
    toast.error('Tải ảnh thất bại')
    
    // Xóa tất cả URL tạm thời nếu có lỗi tổng thể
    tempUrlMap.forEach((tempUrl) => {
      const tempIndex = localGallery.value.indexOf(tempUrl)
      if (tempIndex !== -1) {
        localGallery.value.splice(tempIndex, 1)
      }
      URL.revokeObjectURL(tempUrl)
    })
    
    localGallery.value = [...localGallery.value]
    emit('update:gallery', localGallery.value)
  }
}

// Set image as main image
const setAsMainImage = (index: number) => {
  // Get the selected image from the gallery
  const selectedImage = localGallery.value[index]
  
  // Save the current thumbnail to add to gallery if available
  if (localThumbnail.value) {
    // Add current thumbnail to gallery
    localGallery.value.push(localThumbnail.value)
  }
  
  // Set the selected image as thumbnail
  localThumbnail.value = selectedImage
  
  // Remove the selected image from gallery
  localGallery.value.splice(index, 1)
  
  // Update parent component
  emit('update:thumbnail', localThumbnail.value)
  emit('update:gallery', localGallery.value)
  
  toast.success('Đã đặt làm ảnh đại diện')
}

// Remove image from gallery
const removeImage = (index: number) => {
  localGallery.value.splice(index, 1)
  emit('update:gallery', localGallery.value)
  toast.info('Đã xóa ảnh khỏi thư viện')
}

// Move image in gallery
const moveImage = (fromIndex: number, toIndex: number) => {
  if (toIndex < 0 || toIndex >= localGallery.value.length) return
  
  const images = [...localGallery.value]
  const [removed] = images.splice(fromIndex, 1)
  images.splice(toIndex, 0, removed)
  
  localGallery.value = images
  emit('update:gallery', localGallery.value)
}

// Handle image error
const onImageError = (e: Event, index: number) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    // Replace with default image
    target.src = DEFAULT_IMAGE;
    // Update gallery array
    localGallery.value[index] = DEFAULT_IMAGE;
    emit('update:gallery', localGallery.value);
    // Remove error handler
    target.onerror = null;
  }
}
</script>

<style scoped>
.border-primary {
  border-color: var(--color-primary, #4f46e5);
}

.text-primary {
  color: var(--color-primary, #4f46e5);
}

.bg-primary {
  background-color: var(--color-primary, #4f46e5);
}

.bg-primary-dark {
  background-color: var(--color-primary-dark, #4338ca);
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.image-preview-large img {
  object-fit: contain;
  width: 100%;
  height: 100%;
  padding: 8px;
}

.image-preview-small img {
  object-fit: contain;
  width: 100%;
  height: 100%;
  padding: 4px;
}

/* Đảm bảo ảnh preview có kích thước đồng nhất */
.gallery-preview-container {
  width: 100%;
  height: 100%;
  background-color: white;
}
</style> 