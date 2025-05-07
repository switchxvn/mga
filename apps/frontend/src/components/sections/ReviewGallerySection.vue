<script setup lang="ts">
import { useLocalization } from '../../composables/useLocalization';
import { useTrpc } from '../../composables/useTrpc';
import { ref, computed, onMounted, watch } from '../../composables/useVueComposables';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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
  useSlider: true,
  sliderPerView: 3,
  sliderAutoplay: true,
  sliderDelay: 3000,
  maxGalleries: 12,
  columns: 4,
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
const useSlider = computed(() => settings.value.useSlider);
const sliderPerView = computed(() => settings.value.sliderPerView);
const sliderAutoplay = computed(() => settings.value.sliderAutoplay);
const sliderDelay = computed(() => settings.value.sliderDelay);
const maxGalleries = computed(() => settings.value.maxGalleries);
const columns = computed(() => settings.value.columns);
const showTitle = computed(() => settings.value.showTitle);

// State
const galleries = ref<Gallery[]>([]);
const isLoading = ref(true);
const hasError = ref(false);

// Mẫu data giả cho trường hợp API không trả về dữ liệu
const mockGalleries: Gallery[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    isActive: true,
    sequence: 1,
    translations: [
      {
        id: 1,
        locale: 'vi',
        title: 'Khách hàng checkin tại nhà hàng',
        description: 'Khách hàng thưởng thức món ăn ngon'
      }
    ]
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    isActive: true,
    sequence: 2,
    translations: [
      {
        id: 2,
        locale: 'vi',
        title: 'Bữa tiệc gia đình',
        description: 'Thưởng thức các món ăn cùng người thân'
      }
    ]
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1539066070536-063381e744e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=874&q=80',
    isActive: true,
    sequence: 3,
    translations: [
      {
        id: 3,
        locale: 'vi',
        title: 'Kỷ niệm sinh nhật',
        description: 'Bữa tối sinh nhật đáng nhớ'
      }
    ]
  }
];

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

// Tạo dynamic class cho grid columns
const gridClass = computed(() => {
  return {
    [`grid-cols-2 md:grid-cols-3 lg:grid-cols-${columns.value}`]: true
  };
});

// Swiper options
const swiperOptions = computed(() => ({
  modules: [Navigation, Pagination, Autoplay],
  spaceBetween: 16,
  slidesPerView: sliderPerView.value,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  autoplay: sliderAutoplay.value ? {
    delay: sliderDelay.value,
    disableOnInteraction: false
  } : false,
  breakpoints: {
    320: {
      slidesPerView: 1,
    },
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: sliderPerView.value,
    }
  }
}));

// Thêm một URL placeholder từ một nguồn có sẵn trên internet
const placeholderImageUrl = 'https://placehold.co/600x400/e2e8f0/a0aec0?text=Image+Not+Found';

// Thêm vào một Set để theo dõi những ảnh đã bị lỗi
const erroredImages = ref(new Set());

// Biến để kiểm soát việc xử lý lỗi ảnh
const processingImageErrors = ref(false);

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
});

// Sửa lại cách watch để tránh gọi API liên tục
// Chỉ theo dõi thay đổi của locale thay vì cả locale và categoryIds
watch(locale, () => {
  console.log('Locale changed, fetching galleries again');
  fetchGalleries();
});

// Không theo dõi categoryIds vì nó không thay đổi sau khi component mounted
// Chỉ gọi API một lần khi component mounted thay vì theo dõi nhiều giá trị

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
      <div v-else>
        <!-- Mobile Swiper View (Small screens) -->
        <div class="md:hidden">
          <swiper v-bind="swiperOptions" class="gallery-swiper">
            <swiper-slide v-for="(gallery, index) in galleries" :key="`mobile-${gallery.id}-${index}`" class="h-full">
              <div :class="['overflow-hidden rounded-lg h-full', borderColor, 'border']">
                <div class="relative aspect-square overflow-hidden">
                  <img 
                    :src="isValidImage(gallery.image) ? gallery.image : placeholderImageUrl"
                    :alt="getGalleryTitle(gallery)"
                    class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    :class="{ 'image-error': !isValidImage(gallery.image) }"
                    loading="lazy"
                    @error="handleImageError"
                  />
                </div>
                <div v-if="getGalleryTitle(gallery)" class="p-4">
                  <h3 :class="[textColor, 'font-medium text-lg mb-1']">{{ getGalleryTitle(gallery) }}</h3>
                  <p v-if="getGalleryDescription(gallery)" :class="[textColor === 'text-gray-900 dark:text-white' ? 'text-gray-600 dark:text-gray-400' : '', 'text-sm']">
                    {{ getGalleryDescription(gallery) }}
                  </p>
                </div>
              </div>
            </swiper-slide>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
          </swiper>
        </div>
        
        <!-- Desktop View (Slider or Grid) -->
        <div v-if="useSlider" class="hidden md:block">
          <swiper v-bind="swiperOptions" class="gallery-swiper">
            <swiper-slide v-for="(gallery, index) in galleries" :key="`desktop-${gallery.id}-${index}`" class="h-full">
              <div :class="['overflow-hidden rounded-lg h-full', borderColor, 'border']">
                <div class="relative aspect-square overflow-hidden">
                  <img 
                    :src="isValidImage(gallery.image) ? gallery.image : placeholderImageUrl"
                    :alt="getGalleryTitle(gallery)"
                    class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    :class="{ 'image-error': !isValidImage(gallery.image) }"
                    loading="lazy"
                    @error="handleImageError"
                  />
                </div>
                <div v-if="getGalleryTitle(gallery)" class="p-4">
                  <h3 :class="[textColor, 'font-medium text-lg mb-1']">{{ getGalleryTitle(gallery) }}</h3>
                  <p v-if="getGalleryDescription(gallery)" :class="[textColor === 'text-gray-900 dark:text-white' ? 'text-gray-600 dark:text-gray-400' : '', 'text-sm']">
                    {{ getGalleryDescription(gallery) }}
                  </p>
                </div>
              </div>
            </swiper-slide>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-pagination"></div>
          </swiper>
        </div>
        
        <!-- Grid view -->
        <div v-else-if="!useSlider" class="hidden md:grid gap-6" :class="gridClass">
          <div v-for="(gallery, index) in galleries" :key="`grid-${gallery.id}-${index}`" :class="['overflow-hidden rounded-lg', borderColor, 'border']">
            <div class="relative aspect-square overflow-hidden">
              <img 
                :src="isValidImage(gallery.image) ? gallery.image : placeholderImageUrl"
                :alt="getGalleryTitle(gallery)"
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                :class="{ 'image-error': !isValidImage(gallery.image) }"
                loading="lazy"
                @error="handleImageError"
              />
            </div>
            <div v-if="getGalleryTitle(gallery)" class="p-4">
              <h3 :class="[textColor, 'font-medium text-lg mb-1']">{{ getGalleryTitle(gallery) }}</h3>
              <p v-if="getGalleryDescription(gallery)" :class="[textColor === 'text-gray-900 dark:text-white' ? 'text-gray-600 dark:text-gray-400' : '', 'text-sm']">
                {{ getGalleryDescription(gallery) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery-swiper {
  padding-bottom: 3rem;
}

.swiper-button-next,
.swiper-button-prev {
  color: theme('colors.primary.600');
}

.swiper-pagination-bullet-active {
  background-color: theme('colors.primary.600');
}

.image-error {
  opacity: 0.8;
  background-color: theme('colors.gray.100');
}

@media (prefers-color-scheme: dark) {
  .swiper-button-next,
  .swiper-button-prev {
    color: theme('colors.primary.400');
  }

  .swiper-pagination-bullet-active {
    background-color: theme('colors.primary.400');
  }
  
  .image-error {
    background-color: theme('colors.gray.800');
  }
}
</style> 