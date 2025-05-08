<script setup lang="ts">
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
import { ref, computed, onMounted, watch, nextTick } from '../../composables/useVueComposables';
import Loader from '../ui/Loader.vue';

// Định nghĩa interface cho Gallery và ThemeSection
interface GalleryTranslation {
  id: number;
  locale: string;
  title: string;
  description?: string;
}

interface Gallery {
  id: number;
  image: string;
  isActive: boolean;
  sequence: number;
  translations: GalleryTranslation[];
  width?: string;
}

interface ThemeSection {
  id: number;
  type: string;
  title: string;
  componentName: string;
  order: number;
  isActive: boolean;
  settings: Record<string, any>;
  categoryIds?: number[];
}

// Props cho section
const props = defineProps<{
  section: ThemeSection;
}>();

// Composables
const { t, locale } = useLocalization();
const trpc = useTrpc();

// Default settings
const defaultSettings = {
  title: 'KHÁCH HÀNG CHECKIN',
  description: 'Hình ảnh khách hàng tại cửa hàng của chúng tôi',
  backgroundColor: 'bg-gray-50 dark:bg-gray-800',
  textColor: 'text-gray-900 dark:text-white',
  titleColor: 'text-primary-600 dark:text-primary-400',
  borderColor: 'border-gray-200 dark:border-gray-700',
  paddingY: 'py-16',
  maxGalleries: 12,
  categoryIds: [],
  showTitle: true
};

// Lấy settings từ section với mặc định
const settings = computed(() => ({
  ...defaultSettings,
  ...(props.section?.settings || {})
}));

// Lấy giá trị từ settings
const title = computed(() => settings.value.title);
const description = computed(() => settings.value.description);
const backgroundColor = computed(() => settings.value.backgroundColor);
const textColor = computed(() => settings.value.textColor);
const titleColor = computed(() => settings.value.titleColor);
const borderColor = computed(() => settings.value.borderColor);
const paddingY = computed(() => settings.value.paddingY);
const maxGalleries = computed(() => settings.value.maxGalleries);
const showTitle = computed(() => settings.value.showTitle);

// State
const galleries = ref<Gallery[]>([]);
const isLoading = ref(true);
const hasError = ref(false);

// Đo lường scrolling
const galleryContainer = ref<HTMLElement | null>(null);
const galleryWrapper = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);
const maxScroll = ref(0);

// Thêm tính năng kéo cuộn
const isDragging = ref(false);
const startX = ref(0);
const dragScrollLeft = ref(0);

// Thêm một URL placeholder từ một nguồn có sẵn trên internet
const placeholderImageUrl = 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Image+Not+Found';

// Thêm vào một Set để theo dõi những ảnh đã bị lỗi
const erroredImages = ref(new Set());

// Biến để kiểm soát việc xử lý lỗi ảnh
const processingImageErrors = ref(false);

// Cờ để kiểm soát việc sử dụng dữ liệu mẫu
const useMockData = ref(false);

// Thêm biến để kiểm soát việc gọi API
const isApiCallInProgress = ref(false);

// Lấy categoryIds từ section hoặc settings
const categoryIds = computed(() => {
  // Ưu tiên lấy từ props.section.categoryIds nếu có
  if (props.section?.categoryIds && props.section.categoryIds.length > 0) {
    return props.section.categoryIds;
  }
  
  // Tiếp theo lấy từ settings.categoryIds
  if (settings.value.categoryIds && settings.value.categoryIds.length > 0) {
    return settings.value.categoryIds;
  }
  
  // Cuối cùng, lấy từ props.section.settings.categoryIds nếu có
  return props.section?.settings?.categoryIds || [];
});

// Helper function to get fixed width based on index
const getItemWidth = (index: number) => {
  // Pattern repeats every 6 images for consistent layout
  const pattern = index % 6;
  
  switch (pattern) {
    case 0: // Large landscape
      return '500px';
    case 1: // Portrait
      return '300px';
    case 2: // Square
      return '300px';
    case 3: // Wide landscape
      return '600px';
    case 4: // Small square
      return '400px';
    case 5: // Medium landscape
      return '500px';
    default:
      return '400px';
  }
};

// Scroll methods
const handleScrollLeft = () => {
  if (!galleryContainer.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const newPosition = Math.max(0, scrollPosition.value - containerWidth);
  galleryContainer.value.scrollTo({
    left: newPosition,
    behavior: 'smooth'
  });
};

const handleScrollRight = () => {
  if (!galleryContainer.value || !galleryWrapper.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const scrollWidth = galleryWrapper.value.scrollWidth;
  const currentScroll = galleryContainer.value.scrollLeft;
  
  // Calculate the maximum scroll position
  const maxScrollPosition = scrollWidth - containerWidth;
  
  // Calculate new scroll position
  const newPosition = Math.min(maxScrollPosition, currentScroll + containerWidth);
  
  // Update scroll position
  galleryContainer.value.scrollTo({
    left: newPosition,
    behavior: 'smooth'
  });
};

// Add drag scroll functionality
const startDragging = (e: MouseEvent) => {
  if (!galleryContainer.value) return;
  isDragging.value = true;
  startX.value = e.pageX - galleryContainer.value.offsetLeft;
  dragScrollLeft.value = galleryContainer.value.scrollLeft;
};

const stopDragging = () => {
  isDragging.value = false;
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value || !galleryContainer.value) return;
  e.preventDefault();
  const x = e.pageX - galleryContainer.value.offsetLeft;
  const walk = (x - startX.value) * 2;
  galleryContainer.value.scrollLeft = dragScrollLeft.value - walk;
  scrollPosition.value = galleryContainer.value.scrollLeft;
};

// Update scroll position on scroll
const onScroll = () => {
  if (!galleryContainer.value || !galleryWrapper.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const scrollWidth = galleryWrapper.value.scrollWidth;
  
  scrollPosition.value = galleryContainer.value.scrollLeft;
  maxScroll.value = scrollWidth - containerWidth;
};

// Update max scroll value
const updateMaxScroll = () => {
  if (!galleryContainer.value || !galleryWrapper.value) return;
  const containerWidth = galleryContainer.value.clientWidth;
  const scrollWidth = galleryWrapper.value.scrollWidth;
  
  maxScroll.value = scrollWidth - containerWidth;
  scrollPosition.value = galleryContainer.value.scrollLeft;
};

// Helper functions for row management
const getRowItems = (rowIndex: number) => {
  const itemsPerRow = Math.ceil(galleries.value.length / 3);
  const start = rowIndex * itemsPerRow;
  const items = galleries.value.slice(start, start + itemsPerRow);
  
  // Add fixed width based on position in overall gallery
  return items.map((item, indexInRow) => ({
    ...item,
    width: getItemWidth(start + indexInRow)
  }));
};

// Thiết lập lại môi trường trước khi fetch data
const resetEnvironment = () => {
  // Reset lại danh sách ảnh lỗi
  erroredImages.value.clear();
  processingImageErrors.value = false;
};

// Pre-load image để kiểm tra nếu có lỗi
const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url || erroredImages.value.has(url)) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => {
      erroredImages.value.add(url);
      resolve(false);
    };
    img.src = url;
  });
};

// Thêm chức năng để kiểm tra định dạng API response
const checkValidGalleryObject = (obj: any): boolean => {
  return obj && 
    typeof obj === 'object' && 
    'id' in obj && 
    'image' in obj && 
    Array.isArray(obj.translations) && 
    obj.translations.length > 0;
};

// Lấy dữ liệu gallery từ API
const fetchGalleries = async () => {
  // Nếu đang gọi API thì không gọi tiếp
  if (isApiCallInProgress.value) {
    console.log('API call already in progress, skipping');
    return;
  }
  
  isLoading.value = true;
  hasError.value = false;
  isApiCallInProgress.value = true;
  
  // Reset môi trường
  resetEnvironment();
  
  try {
    // Log thông tin chi tiết để debug API
    console.log('[Gallery API] Section properties:', {
      id: props.section?.id,
      type: props.section?.type,
      componentName: props.section?.componentName
    });
    console.log('[Gallery API] CategoryIds sources:');
    console.log('- From props.section.categoryIds:', props.section?.categoryIds);
    console.log('- From settings.categoryIds:', settings.value.categoryIds);
    console.log('- Combined result (categoryIds.value):', categoryIds.value);
    
    // Chuẩn bị tham số cho API
    const queryParams: Record<string, any> = {
      locale: locale.value
    };
    
    // Chỉ thêm categoryIds nếu có giá trị
    if (categoryIds.value.length > 0) {
      console.log('[Gallery API] Using categoryIds in API call:', categoryIds.value);
      queryParams.categoryIds = categoryIds.value;
    } else {
      console.log('[Gallery API] No categoryIds available for API call');
    }
    
    // Log queryParams trước khi gọi API
    console.log('[Gallery API] Final query params:', JSON.stringify(queryParams, null, 2));
    
    console.log('[Gallery API] Calling trpc.gallery.active.query...');
    // Gọi API với tham số đã chuẩn bị
    const result = await trpc.gallery.active.query(queryParams);
    
    // Log kết quả API chi tiết hơn để debug
    console.log('[Gallery API] Response received. Result structure:', result ? Object.keys(result) : 'undefined');
    console.log('[Gallery API] Result type:', result ? (Array.isArray(result) ? 'Array' : typeof result) : 'undefined');
    if (result && typeof result === 'object') {
      console.log('[Gallery API] First level properties:', Object.keys(result));
      
      if ('data' in result) {
        console.log('[Gallery API] Data property type:', typeof result.data);
        console.log('[Gallery API] Data is array?', Array.isArray(result.data));
      }
    }
    
    // Xử lý nhiều cấu trúc dữ liệu có thể từ API
    let galleryData = [];
    
    // Case 1: Kết quả là mảng trực tiếp
    if (Array.isArray(result)) {
      console.log('[Gallery API] Processing direct array result');
      galleryData = result.filter((item: any) => checkValidGalleryObject(item));
    } 
    // Case 2: Kết quả có dạng { result: { data: [] } }
    else if (result?.result?.data && Array.isArray(result.result.data)) {
      console.log('[Gallery API] Processing result.result.data');
      galleryData = result.result.data.filter((item: any) => checkValidGalleryObject(item));
    }
    // Case 3: Kết quả có dạng { data: [] }
    else if (result?.data && Array.isArray(result.data)) {
      console.log('[Gallery API] Processing result.data array');
      galleryData = result.data.filter((item: any) => checkValidGalleryObject(item));
    }
    // Case 4: Kết quả có dạng { data: { data: [] } }
    else if (result?.data?.data && Array.isArray(result.data.data)) {
      console.log('[Gallery API] Processing result.data.data');
      galleryData = result.data.data.filter((item: any) => checkValidGalleryObject(item));
    }
    // Case 5: Kết quả đơn giản là một object với các thuộc tính
    else if (checkValidGalleryObject(result)) {
      console.log('[Gallery API] Processing single object result');
      galleryData = [result];
    }
    
    console.log('[Gallery API] Processed gallery data count:', galleryData.length);
    
    // Reset galleries trước khi gán dữ liệu mới để tránh hiển thị lặp
    galleries.value = [];
    
    // Ensure we have valid data
    if (galleryData && galleryData.length > 0) {
      console.log('[Gallery API] Valid data found, using real data');
      galleries.value = galleryData;
      useMockData.value = false;
      
      // Giới hạn số lượng gallery hiển thị
      if (galleries.value.length > maxGalleries.value) {
        galleries.value = galleries.value.slice(0, maxGalleries.value);
      }
      
      console.log('[Gallery API] Final data count:', galleries.value.length);
      
      // Update scroll values after images are loaded
      nextTick(() => {
        updateMaxScroll();
      });
    } else {
      // Hiển thị thông báo không có dữ liệu thay vì dùng mock
      console.log('[Gallery API] No valid gallery data found');
      galleries.value = [];
      useMockData.value = false;
      hasError.value = true;
    }
  } catch (error) {
    console.error('[Gallery API] Error fetching galleries:', error);
    hasError.value = true;
    
    // Hiển thị lỗi để người dùng biết có vấn đề với API
    console.log('[Gallery API] Error occurred when fetching data');
    galleries.value = [];
    useMockData.value = false;
  } finally {
    isLoading.value = false;
    isApiCallInProgress.value = false;
  }
};

// Lấy tiêu đề gallery theo locale
const getGalleryTitle = (gallery: Gallery) => {
  if (!gallery || !gallery.translations) return '';
  
  const translation = gallery.translations.find(t => t.locale === locale.value);
  return translation?.title || gallery.translations[0]?.title || '';
};

// Lấy mô tả gallery theo locale
const getGalleryDescription = (gallery: Gallery) => {
  if (!gallery || !gallery.translations) return '';
  
  const translation = gallery.translations.find(t => t.locale === locale.value);
  return translation?.description || gallery.translations[0]?.description || '';
};

// Handle image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const originalSrc = img.src;
  
  // Kiểm tra xem hình đã được gắn placeholder chưa
  if (erroredImages.value.has(originalSrc)) {
    return; // Nếu đã lỗi rồi thì không xử lý nữa để tránh vòng lặp vô hạn
  }
  
  // Thêm vào danh sách ảnh lỗi
  erroredImages.value.add(originalSrc);
  
  // Gán URL placeholder
  img.src = placeholderImageUrl;
  
  // Thêm class để nhận biết ảnh bị lỗi
  img.classList.add('image-error');
  
  console.log(`Image load failed for: ${originalSrc}, replaced with placeholder`);
};

// Load dữ liệu khi component mounted
onMounted(() => {
  fetchGalleries();
  
  if (galleryContainer.value) {
    // Add scroll event listener
    galleryContainer.value.addEventListener('scroll', onScroll);
  }
});

// Cleanup event listeners
onUnmounted(() => {
  if (galleryContainer.value) {
    galleryContainer.value.removeEventListener('scroll', onScroll);
  }
});

// Sửa lại cách watch để tránh gọi API liên tục
// Chỉ theo dõi thay đổi của locale thay vì cả locale và categoryIds
watch(locale, () => {
  console.log('Locale changed, fetching galleries again');
  fetchGalleries();
});

// Kiểm tra ảnh có hợp lệ hay không
const isValidImage = computed(() => {
  return (url: string) => {
    if (!url) return false;
    return !erroredImages.value.has(url);
  };
});
</script>

<template>
  <section :class="[backgroundColor, paddingY]">
    <div class="container mx-auto px-4">
      <!-- Tiêu đề section -->
      <div v-if="showTitle" class="text-center mb-10">
        <h2 :class="[titleColor, 'text-3xl font-bold mb-4']">{{ title }}</h2>
        <p v-if="description" :class="[textColor, 'text-lg']">{{ description }}</p>
        <!-- Hiển thị thông báo khi sử dụng dữ liệu mẫu (chỉ trong môi trường development) -->
        <div v-if="useMockData" class="mt-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md inline-flex items-center space-x-2">
          <span>Đang sử dụng dữ liệu mẫu</span>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <Loader size="lg" />
      </div>
      
      <!-- Error state -->
      <div v-else-if="hasError || galleries.length === 0" class="text-center py-8">
        <p :class="textColor">{{ t('common.noData') }}</p>
      </div>
      
      <!-- Gallery content -->
      <div v-else class="gallery-outer-container relative">
        <!-- Navigation Buttons -->
        <button 
          @click="handleScrollLeft" 
          class="nav-button left-button"
          :class="{ 'opacity-0': scrollPosition <= 0 }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span class="sr-only">Previous images</span>
        </button>

        <button 
          @click="handleScrollRight" 
          class="nav-button right-button"
          :class="{ 'opacity-0': scrollPosition >= maxScroll }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span class="sr-only">Next images</span>
        </button>

        <!-- Gallery Content -->
        <div 
          class="gallery-container cursor-grab active:cursor-grabbing" 
          ref="galleryContainer"
          @mousedown="startDragging"
          @mouseleave="stopDragging"
          @mouseup="stopDragging"
          @mousemove="onDrag"
        >
          <div class="gallery-wrapper" ref="galleryWrapper">
            <div class="gallery-grid">
              <!-- Row 1 -->
              <div class="gallery-row">
                <figure 
                  v-for="(item, itemIndex) in getRowItems(0)"
                  :key="`row0-${item.id}-${itemIndex}`"
                  class="gallery-item"
                  :style="{ width: item.width }"
                >
                  <img
                    :src="isValidImage(item.image) ? item.image : placeholderImageUrl"
                    :alt="getGalleryTitle(item)"
                    class="w-full h-full object-cover rounded-lg transition-transform duration-500 hover:scale-105"
                    :class="{ 'image-error': !isValidImage(item.image) }"
                    loading="lazy"
                    @error="handleImageError"
                  />
                </figure>
              </div>
              
              <!-- Row 2 -->
              <div class="gallery-row">
                <figure 
                  v-for="(item, itemIndex) in getRowItems(1)"
                  :key="`row1-${item.id}-${itemIndex}`"
                  class="gallery-item"
                  :style="{ width: item.width }"
                >
                  <img
                    :src="isValidImage(item.image) ? item.image : placeholderImageUrl"
                    :alt="getGalleryTitle(item)"
                    class="w-full h-full object-cover rounded-lg transition-transform duration-500 hover:scale-105"
                    :class="{ 'image-error': !isValidImage(item.image) }"
                    loading="lazy"
                    @error="handleImageError"
                  />
                </figure>
              </div>
              
              <!-- Row 3 -->
              <div class="gallery-row">
                <figure 
                  v-for="(item, itemIndex) in getRowItems(2)"
                  :key="`row2-${item.id}-${itemIndex}`"
                  class="gallery-item"
                  :style="{ width: item.width }"
                >
                  <img
                    :src="isValidImage(item.image) ? item.image : placeholderImageUrl"
                    :alt="getGalleryTitle(item)"
                    class="w-full h-full object-cover rounded-lg transition-transform duration-500 hover:scale-105"
                    :class="{ 'image-error': !isValidImage(item.image) }"
                    loading="lazy"
                    @error="handleImageError"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery-outer-container {
  position: relative;
  margin: 0;
  overflow: hidden;
  min-height: 300px;
  padding: 0 48px;
}

.gallery-container {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  cursor: grab;
  margin: 0;
  padding: 0;
  width: 100%;
  
  &:active {
    cursor: grabbing;
  }
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.gallery-wrapper {
  display: inline-flex;
  min-width: min-content;
  padding: 0 48px;
}

.gallery-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 48px; /* Add padding to ensure last items are reachable */
}

.gallery-row {
  display: flex;
  gap: 16px;
  min-height: 250px;
  
  .gallery-item {
    flex: none;
    height: 250px;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    transition: all 0.3s ease-in-out;
    
    &:hover {
      z-index: 1;
      transform: translateY(-4px);
      
      img {
        transform: scale(1.05);
      }
    }
  }
}

/* Navigation buttons */
.nav-button {
  background-color: rgb(255 255 255 / 0.8);
  backdrop-filter: blur(4px);
  color: rgb(55 65 81);
  border-radius: 9999px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgb(229 231 235);
  opacity: 1;
  pointer-events: auto;
}

.nav-button.left-button {
  left: 0;
}

.nav-button.right-button {
  right: 0;
}

.nav-button:hover {
  transform: translateY(-50%) scale(1.1);
  background-color: rgb(239 246 255);
}

.image-error {
  opacity: 0.8;
  background-color: theme('colors.gray.100');
}

@media (prefers-color-scheme: dark) {
  .nav-button {
    background-color: rgb(31 41 55 / 0.8);
    color: rgb(229 231 235);
    border-color: rgb(55 65 81);
  }
  
  .nav-button:hover {
    background-color: rgb(15 23 42 / 0.8);
  }
  
  .image-error {
    background-color: theme('colors.gray.800');
  }
}

/* Media queries for responsive design */
@media (max-width: 768px) {
  .gallery-outer-container {
    padding: 0 36px;
  }

  .gallery-container {
    margin: 0 -36px;
    padding: 0 36px;
  }

  .gallery-grid {
    flex-direction: row !important;
    gap: 12px !important;
  }

  .gallery-row {
    display: none !important;
    
    &:first-child {
      display: flex !important;
      gap: 12px;
      
      .gallery-item {
        width: 280px !important;
        min-width: 280px !important;
        height: 200px !important;
        
        &:last-child {
          width: 320px !important;
          min-width: 320px !important;
        }
      }
    }
  }

  .nav-button {
    width: 36px;
    height: 36px;
  }
  
  .nav-button svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 640px) {
  .gallery-outer-container {
    padding: 0 24px;
  }

  .gallery-container {
    margin: 0 -24px;
    padding: 0 24px;
  }

  .gallery-row:first-child .gallery-item {
    width: 240px !important;
    min-width: 240px !important;
    height: 180px !important;
  }
  
  .gallery-row:first-child .gallery-item:last-child {
    width: 280px !important;
    min-width: 280px !important;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }
  
  .nav-button svg {
    width: 16px;
    height: 16px;
  }
}
</style> 