<template>
  <div class="grid gap-6">
    <!-- Media Preview & Editor - Kết hợp tải lên và xem trước -->
    <div class="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div class="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-medium">Ảnh sản phẩm</h3>
          <p class="text-sm text-slate-500">Tải lên và quản lý ảnh sản phẩm</p>
        </div>
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
                <div class="flex flex-col items-center">
                  <!-- Main Image - Chữ nhật lớn ở trên (không phải hình vuông) -->
                  <div 
                    class="w-full max-w-2xl aspect-[4/3] border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center cursor-pointer relative group mb-4"
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
                    <div v-if="localThumbnail" class="image-preview w-full h-full">
                      <img 
                        :src="localThumbnail" 
                        alt="Ảnh sản phẩm chính" 
                        @error="onThumbnailError" 
                        class="object-contain w-full h-full"
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
                  
                  <!-- Gallery thumbnails row + chức năng -->
                  <div class="flex gap-2 overflow-x-auto w-full max-w-2xl p-2">
                    <!-- Video button -->
                    <div 
                      class="flex-shrink-0 w-14 h-14 rounded-md border border-slate-200 flex flex-col items-center justify-center bg-white cursor-pointer relative group"
                      :class="{ 'border-primary border-2': localVideoUrl }"
                      @click="toggleVideoInput"
                    >
                      <div class="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200">
                        <VideoIcon class="w-5 h-5" :class="localVideoUrl ? 'text-primary' : 'text-slate-500'" />
                      </div>
                      <span class="text-[10px] text-slate-500 mt-1">Video</span>
                      <div v-if="localVideoUrl" class="absolute top-0 right-0 bg-primary text-white text-[8px] px-1 py-0.5">
                        YouTube
                      </div>
                    </div>
                    
                    <!-- Main thumbnail in gallery (if available) -->
                    <div 
                      v-if="localThumbnail"
                      class="flex-shrink-0 w-14 h-14 rounded-md border-2 border-primary overflow-hidden bg-white cursor-pointer relative group"
                      @click="$refs.thumbnailInput.click()"
                    >
                      <div class="w-full h-full flex items-center justify-center">
                        <img 
                          :src="localThumbnail" 
                          alt="Ảnh chính"
                          class="object-contain w-full h-full p-1"
                          @error="onThumbnailError"
                        />
                      </div>
                      <div class="absolute top-0 right-0 bg-primary text-white text-[8px] px-1 py-0.5">
                        Chính
                      </div>
                    </div>
                    
                    <!-- Gallery thumbnails -->
                    <div 
                      v-for="(image, index) in localGallery.slice(0, 8)" 
                      :key="index"
                      class="flex-shrink-0 w-14 h-14 rounded-md border border-slate-200 overflow-hidden bg-white cursor-pointer relative group"
                      @click="setAsMainImage(index)"
                      draggable="true"
                      @dragstart="startDrag($event, index)"
                      @dragover.prevent
                      @dragenter.prevent
                      @drop="onDrop($event, index)"
                    >
                      <div class="w-full h-full flex items-center justify-center">
                        <img 
                          :src="image" 
                          :alt="`Ảnh ${index+1}`"
                          class="object-contain w-full h-full p-1"
                          @error="(e) => onImageError(e, index)"
                        />
                      </div>
                      <!-- Hover overlay with drag handle and delete -->
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                        <button
                          @click.stop="removeImage(index)"
                          class="p-1 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40"
                          title="Xóa ảnh"
                        >
                          <XIcon class="w-3 h-3" />
                        </button>
                        <div
                          class="p-1 rounded-full bg-white/20 backdrop-blur-sm text-white cursor-grab"
                          title="Kéo để sắp xếp lại"
                        >
                          <MoveVerticalIcon class="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    
                    <!-- Add image button -->
                    <div
                      class="flex-shrink-0 w-14 h-14 border-2 border-dashed border-primary/30 rounded-md overflow-hidden transition-colors cursor-pointer"
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
                          class="h-5 w-5 mb-1 transition-colors" 
                          :class="isDraggingGallery ? 'text-primary' : 'text-slate-300'"
                        />
                        <p class="text-[10px] font-medium text-center text-slate-700">
                          {{ isDraggingGallery ? 'Thả' : 'Thêm' }}
                        </p>
                      </div>
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
                <div class="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 text-sm text-slate-700 mt-6">
                  <div class="flex items-center mb-3">
                    <InfoIcon class="h-5 w-5 text-blue-600 flex-shrink-0 mr-2" />
                    <h3 class="font-semibold text-blue-800">Hướng dẫn sử dụng</h3>
                  </div>
                  
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <p class="font-medium text-blue-700 mb-1">Tải lên và quản lý ảnh:</p>
                      <ul class="space-y-1.5 list-disc list-inside text-slate-600">
                        <li>Nhấp vào <span class="font-medium">hình ảnh lớn</span> hoặc kéo thả ảnh vào đó để tải lên <span class="font-medium">ảnh đại diện</span></li>
                        <li>Sử dụng nút <span class="font-medium">"Thêm ảnh"</span> hoặc kéo thả vào đó để thêm ảnh vào thư viện</li>
                        <li><span class="font-medium">Kéo và thả</span> trực tiếp các ảnh thumbnail để sắp xếp lại thứ tự</li>
                        <li>Nhấp vào ảnh trong hàng thumbnail để <span class="font-medium">đặt làm ảnh đại diện</span></li>
                        <li>Di chuột vào ảnh để hiện các <span class="font-medium">nút xóa</span> và kéo thả</li>
                      </ul>
                    </div>
                    
                    <div class="space-y-2">
                      <p class="font-medium text-blue-700 mb-1">Quy định và lưu ý:</p>
                      <ul class="space-y-1.5 list-disc list-inside text-slate-600">
                        <li><span class="font-medium">Định dạng:</span> JPG, PNG, GIF, WebP</li>
                        <li><span class="font-medium">Kích thước tối đa:</span> 2MB cho mỗi ảnh</li>
                        <li><span class="font-medium">Số lượng:</span> Tối đa 8 ảnh (1 ảnh đại diện + 7 ảnh trong thư viện)</li>
                        <li><span class="font-medium">Ảnh đại diện:</span> Nên có tỉ lệ 1:1, khuyến nghị 1000x1000px</li>
                        <li><span class="font-medium">Video:</span> Chỉ hỗ trợ nhúng video từ YouTube</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-600">
                    <p class="flex items-center">
                      <AlertCircleIcon class="h-3.5 w-3.5 mr-1.5" />
                      <span>Lưu ý: Hình ảnh sẽ hiển thị trên trang sản phẩm và các trang khác, ảnh đẹp sẽ giúp tăng tỉ lệ chuyển đổi.</span>
                    </p>
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
    
    <!-- Thêm Video Input Dialog -->
    <!-- YouTube Video Input Modal -->
    <div v-if="showVideoInput" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-slate-800">Thêm Video YouTube</h3>
          <button @click="toggleVideoInput" class="text-slate-400 hover:text-slate-600">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Đường link YouTube</label>
          <input 
            v-model="localVideoUrl" 
            type="text" 
            class="w-full px-3 py-2 border rounded-md"
            :class="{'border-red-500': !isValidYoutubeUrl, 'border-slate-300': isValidYoutubeUrl}"
            placeholder="https://www.youtube.com/watch?v=..."
            @input="isValidYoutubeUrl = true"
          />
          <p v-if="!isValidYoutubeUrl" class="text-sm text-red-500 mt-1">
            Vui lòng nhập đường link YouTube hợp lệ
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Hỗ trợ các định dạng: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
          </p>
        </div>
        
        <!-- Preview hiện tại nếu có video -->
        <div v-if="localVideoUrl && validateYoutubeUrl(localVideoUrl)" class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Xem trước</label>
          <div class="aspect-video w-full bg-slate-100 rounded-md overflow-hidden">
            <iframe 
              :src="getYoutubeEmbedUrl(localVideoUrl)" 
              class="w-full h-full" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        </div>
        
        <div class="flex justify-end gap-2">
          <button 
            @click="localVideoUrl = ''; updateVideoUrl()"
            class="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Xóa video
          </button>
          <button 
            @click="updateVideoUrl()"
            class="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Lưu
          </button>
        </div>
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
  ShoppingCartIcon, ShareIcon, HeartIcon, CheckIcon, VideoIcon,
  MoveVerticalIcon,
} from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'
import { useUpload } from '../../composables/useUpload'

const { uploadImage, isUploading } = useUpload()
const { success, error: showError, info } = useToast()

const props = defineProps<{
  thumbnail: string
  gallery: string[]
  videoUrl?: string
}>()

const emit = defineEmits<{
  'update:thumbnail': [value: string]
  'update:gallery': [value: string[]]
  'update:videoUrl': [value: string]
}>()

const localThumbnail = ref(props.thumbnail)
const localGallery = ref([...props.gallery])
const localVideoUrl = ref(props.videoUrl || '')
const galleryInput = ref<HTMLInputElement | null>(null)
const thumbnailInput = ref<HTMLInputElement | null>(null)
const isDraggingThumbnail = ref(false)
const isDraggingGallery = ref(false)
const showVideoInput = ref(false)
const isValidYoutubeUrl = ref(true)

// Default image path
const DEFAULT_IMAGE = '/images/default/default-image.jpg';

// Watch for prop changes
watch(() => props.thumbnail, (newValue) => {
  localThumbnail.value = newValue
})

watch(() => props.gallery, (newValue) => {
  localGallery.value = [...newValue]
})

watch(() => props.videoUrl, (newValue) => {
  localVideoUrl.value = newValue || ''
})

// Upload thumbnail
const handleThumbnailUpload = async (file: File) => {
  if (!file) return;
  
  try {
    isUploading.value = true;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload file
    const response = await fetch('/api/admin/media/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    const url = result.url;
    
    // Update model value
    emit('update:thumbnail', url);
    isUploading.value = false;
  } catch (error) {
    isUploading.value = false;
    showError('Failed to upload thumbnail: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Process image for cropping to 1:1 ratio
const processImageForCropping = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const img = new Image();
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }
              
              // Calculate crop dimensions for 1:1 aspect ratio
              const size = Math.min(img.width, img.height);
              const x = (img.width - size) / 2;
              const y = (img.height - size) / 2;
              
              // Set canvas size to desired output dimensions
              canvas.width = size;
              canvas.height = size;
              
              // Draw cropped image on canvas
              ctx.drawImage(
                img,
                x, y, size, size,  // Source rectangle
                0, 0, size, size   // Destination rectangle
              );
              
              // Convert canvas to Blob
              canvas.toBlob((blob) => {
                if (!blob) {
                  reject(new Error('Failed to create image blob'));
                  return;
                }
                
                // Create a new File from the blob
                const croppedFile = new File([blob], file.name, {
                  type: blob.type,
                  lastModified: Date.now()
                });
                
                // Upload the cropped file
                const formData = new FormData();
                formData.append('file', croppedFile);
                
                fetch('/api/admin/media/upload', {
                  method: 'POST',
                  body: formData
                })
                  .then(response => response.json())
                  .then(result => resolve(result.url))
                  .catch(error => reject(error));
                
              }, file.type);
              
            } catch (error) {
              reject(error);
            }
          };
          
          img.src = e.target?.result as string;
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      reject(error);
    }
  });
};

// Handle thumbnail drop
const handleThumbnailDrop = async (event: DragEvent) => {
  isDraggingThumbnail.value = false
  if (!event.dataTransfer?.files.length) return
  
  const file = event.dataTransfer.files[0]
  if (!file.type.startsWith('image/')) {
    showError('Chỉ chấp nhận file hình ảnh')
    return
  }
  
  // Hiển thị ảnh tạm thời ngay lập tức
  const tempURL = URL.createObjectURL(file)
  localThumbnail.value = tempURL
  
  try {
    info('Đang xử lý ảnh...')
    const url = await processImageForCropping(file)
    // Cập nhật với URL chính thức
    localThumbnail.value = url
    emit('update:thumbnail', url)
    success('Đã tải lên ảnh đại diện thành công')
    // Giải phóng bộ nhớ
    URL.revokeObjectURL(tempURL)
  } catch (error) {
    console.error('Failed to upload thumbnail via drag & drop:', error)
    showError('Tải lên ảnh đại diện thất bại')
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
      showError('Chỉ chấp nhận file hình ảnh')
    } else {
      info('Bạn đã đạt đến số lượng ảnh tối đa (8 ảnh)')
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
    info(`Đang xử lý ${filesToUpload.length} ảnh...`)
    
    // Upload all files with 1:1 processing
    const uploadPromises = filesToUpload.map(async (file, index) => {
      try {
        const tempUrl = tempUrlMap.get(file) as string
        const url = await processImageForCropping(file)
        
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
        showError(`Tải lên ảnh ${file.name} thất bại`)
        
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
      success(`Đã tải lên thành công ${validUrls.length} ảnh`)
    }
  } catch (error) {
    console.error('Gallery upload error:', error)
    showError('Tải ảnh thất bại')
    
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
      showError('Chỉ chấp nhận file hình ảnh')
    } else {
      info('Bạn đã đạt đến số lượng ảnh tối đa (8 ảnh)')
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
    info(`Đang xử lý ${filesToUpload.length} ảnh...`)
    
    // Xử lý tải lên tuần tự để cập nhật UI từng ảnh một
    for (const file of filesToUpload) {
      try {
        const tempUrl = tempUrlMap.get(file) as string
        const url = await processImageForCropping(file)
        
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
    success(`Đã tải lên thành công ${filesToUpload.length} ảnh`)
    
    // Cập nhật gallery một lần cuối
    emit('update:gallery', localGallery.value)
  } catch (error) {
    console.error('Gallery upload error via drag & drop:', error)
    showError('Tải ảnh thất bại')
    
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
    // Thay thế ảnh được chọn bằng ảnh thumbnail hiện tại
    localGallery.value[index] = localThumbnail.value
  } else {
    // Nếu không có thumbnail, xóa ảnh gallery được chọn
    localGallery.value.splice(index, 1)
  }
  
  // Set the selected image as thumbnail
  localThumbnail.value = selectedImage
  
  // Update parent component
  emit('update:thumbnail', localThumbnail.value)
  emit('update:gallery', localGallery.value)
  
  success('Đã đặt làm ảnh đại diện')
}

// Remove image from gallery
const removeImage = (index: number) => {
  localGallery.value.splice(index, 1)
  emit('update:gallery', localGallery.value)
  info('Đã xóa ảnh khỏi thư viện')
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

// Handle drag start
const startDrag = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    // Lưu index của ảnh đang kéo
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('index', index.toString())
    
    // Tùy chọn: thêm hình ảnh kéo
    if (event.target instanceof HTMLElement) {
      const img = event.target.querySelector('img')
      if (img) {
        const rect = img.getBoundingClientRect()
        const dragImg = new Image()
        dragImg.src = img.src
        dragImg.style.opacity = '0.5'
        event.dataTransfer.setDragImage(dragImg, rect.width / 2, rect.height / 2)
      }
    }
  }
}

// Handle drop to reorder images
const onDrop = (event: DragEvent, dropIndex: number) => {
  if (!event.dataTransfer) return
  
  const dragIndex = parseInt(event.dataTransfer.getData('index'))
  if (isNaN(dragIndex)) return
  
  // Không làm gì nếu thả vào chính nó
  if (dragIndex === dropIndex) return
  
  // Tạo bản sao của gallery để thao tác
  const newGallery = [...localGallery.value]
  
  // Lấy ảnh đang kéo
  const draggedImage = newGallery[dragIndex]
  
  // Xóa ảnh từ vị trí cũ
  newGallery.splice(dragIndex, 1)
  
  // Chèn ảnh vào vị trí mới
  newGallery.splice(dropIndex, 0, draggedImage)
  
  // Cập nhật gallery
  localGallery.value = newGallery
  emit('update:gallery', localGallery.value)
  
  success('Đã thay đổi vị trí ảnh')
}

// Validate YouTube URL
const validateYoutubeUrl = (url: string): boolean => {
  if (!url.trim()) return true // Empty is valid (optional field)
  
  // Check for YouTube URL patterns
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(.*)$/
  return youtubeRegex.test(url)
}

// Update video URL
const updateVideoUrl = () => {
  const isValid = validateYoutubeUrl(localVideoUrl.value)
  isValidYoutubeUrl.value = isValid
  
  if (isValid) {
    emit('update:videoUrl', localVideoUrl.value)
    if (localVideoUrl.value) {
      showVideoInput.value = false
      success('Link video đã được cập nhật')
    }
  }
}

// Toggle video input
const toggleVideoInput = () => {
  showVideoInput.value = !showVideoInput.value
  isValidYoutubeUrl.value = true // Reset validation state
}

// Extract video ID from YouTube URL for embedding
const getYoutubeEmbedUrl = (url: string): string => {
  if (!url) return ''
  
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : ''
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