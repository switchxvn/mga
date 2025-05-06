<script setup lang="ts">
import type { Gallery, PaginatedResponse } from '@ew/shared';
import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from '@headlessui/vue';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import {
  ImageIcon,
  ListChecksIcon,
  XCircleIcon as LucideXCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  Trash2Icon,
  ZoomInIcon,
  TagIcon,
  UploadIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};
import SearchFilter from '../../components/common/filter/SearchFilter.vue';
import StatusFilter from '../../components/common/filter/StatusFilter.vue';
import PageSizeFilter from '../../components/common/filter/PageSizeFilter.vue';
import FilterContainer from '../../components/common/filter/FilterContainer.vue';
import DataTable from '../../components/common/table/DataTable.vue';
import PageHeader from '../../components/common/header/PageHeader.vue';
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { useUpload } from "../../composables/useUpload";
import { useToast } from 'vue-toastification';

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Gallery Management - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();
const { uploadImage, isUploading } = useUpload();
const toast = useToast();

const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const activeFilter = ref<boolean | undefined>(
  route.query.active === 'true' ? true : 
  route.query.active === 'false' ? false : 
  undefined
);
const categoryId = ref<number | undefined>(
  route.query.categoryId ? Number(route.query.categoryId) : undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const galleries = ref<PaginatedResponse<Gallery>>({
  items: [],
  total: 0,
  currentPage: 1,
  limit: 10,
  totalPages: 1
});

const categories = ref<{id: number, name: string}[]>([]);
const selectedGalleries = ref<number[]>([]);
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

const selectedImage = ref<string | null>(null);
const isZoomModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const selectedCategoriesToUpdate = ref<number[]>([]);

// Thêm cho chức năng upload nhiều ảnh
const isBulkUploadModalOpen = ref(false);
const selectedCategoryForUpload = ref<number | null>(null);
const isActiveForUpload = ref(true);
const uploadingImages = ref<{
  file: File, 
  progress: number, 
  url: string, 
  error: string | null, 
  preview: string,
  previewError: boolean
}[]>([]);
const isProcessingUploads = ref(false);

const DEFAULT_IMAGE = '/images/default/default-image.jpg'; // Ảnh mặc định

// Fetch categories
const fetchCategories = async () => {
  try {
    const result = await trpc.admin.category.getByType.query({
      type: 'gallery'
    });
    categories.value = result
      .filter(cat => cat !== null)
      .map(cat => ({
        id: cat.id,
        name: cat.translations && cat.translations[0]?.name || `Category ${cat.id}`
      }));
  } catch (err: any) {
    console.error("Error loading categories:", err);
  }
};

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    active: activeFilter.value !== undefined ? activeFilter.value.toString() : undefined,
    categoryId: categoryId.value !== undefined ? categoryId.value.toString() : undefined
  };

  // Remove undefined values
  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

  router.replace({ query });
};

// Watch for changes in filters and update URL
watch([page, search, activeFilter, categoryId], () => {
  updateQueryParams();
  fetchGalleries();
}, { deep: true });

async function fetchGalleries() {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await trpc.admin.galleries.getAll.query({
      page: page.value,
      limit: pageSize.value,
      search: search.value || undefined,
      isActive: activeFilter.value,
      categoryId: categoryId.value
    });

    // Chuyển đổi dữ liệu
    if (result && typeof result === 'object' && 'items' in result && 'total' in result) {
      const formattedItems = result.items.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
      
      galleries.value = {
        items: formattedItems,
        total: result.total,
        currentPage: result.currentPage,
        limit: result.limit,
        totalPages: result.totalPages
      };
    } else {
      console.error('Unknown response structure:', result);
      error.value = 'Không thể xử lý dữ liệu từ server';
      
      galleries.value = {
        items: [],
        total: 0,
        currentPage: 1,
        limit: 10,
        totalPages: 1
      };
    }
  } catch (err: any) {
    error.value = err.message || "Failed to load galleries";
    console.error("Error loading galleries:", err);
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    const result = await Swal.fire({
      title: 'Delete Gallery Item?',
      text: 'Are you sure you want to delete this gallery item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#DC2626',
    });

    if (!result.isConfirmed) return;

    await trpc.admin.galleries.delete.mutate(id);
    await fetchGalleries();
    
    Swal.fire({
      title: 'Deleted!',
      text: 'Gallery item has been deleted successfully',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err: any) {
    error.value = err.message || "Failed to delete gallery item";
    console.error("Error deleting gallery item:", err);
    
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete gallery item',
      icon: 'error'
    });
  }
}

// Add bulk actions handler
async function handleBulkAction(action: string) {
  const selectedCount = selectedGalleries.value.length;
  if (!selectedCount) return;

  let confirmConfig: any = {
    icon: 'question' as const,
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    title: '',
    text: '',
    confirmButtonColor: ''
  };

  switch (action) {
    case 'activate':
      confirmConfig = {
        ...confirmConfig,
        title: 'Activate Selected Items?',
        text: `Are you sure you want to activate ${selectedCount} selected gallery items?`,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Yes, activate them'
      };
      break;
    case 'deactivate':
      confirmConfig = {
        ...confirmConfig,
        title: 'Deactivate Selected Items?',
        text: `Are you sure you want to deactivate ${selectedCount} selected gallery items?`,
        confirmButtonColor: '#6B7280',
        confirmButtonText: 'Yes, deactivate them'
      };
      break;
    case 'delete':
      confirmConfig = {
        ...confirmConfig,
        title: 'Delete Selected Items?',
        text: `Are you sure you want to permanently delete ${selectedCount} selected gallery items? This action cannot be undone.`,
        confirmButtonColor: '#DC2626',
        confirmButtonText: 'Yes, delete them',
        icon: 'warning' as const
      };
      break;
    case 'updateCategories':
      isCategoryModalOpen.value = true;
      return;
  }

  const result = await Swal.fire(confirmConfig);
  if (!result.isConfirmed) return;

  try {
    isLoading.value = true;

    switch (action) {
      case 'activate':
      case 'deactivate':
        await Promise.all(
          selectedGalleries.value.map(galleryId => {
            return trpc.admin.galleries.update.mutate({
              id: galleryId,
              isActive: action === 'activate'
            });
          })
        );
        break;
      case 'delete':
        await Promise.all(
          selectedGalleries.value.map(galleryId => 
            trpc.admin.galleries.delete.mutate(galleryId)
          )
        );
        break;
    }

    // Refresh galleries list
    await fetchGalleries();
    selectedGalleries.value = [];

    Swal.fire({
      title: 'Success!',
      text: `Successfully performed ${action} on ${selectedCount} gallery items`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err: any) {
    error.value = err.message || `Failed to ${action} gallery items`;
    console.error(`Error performing ${action} on gallery items:`, err);
    
    Swal.fire({
      title: 'Error!',
      text: err.message || `Failed to ${action} gallery items`,
      icon: 'error' as const
    });
  } finally {
    isLoading.value = false;
  }
}

// New function to handle bulk category update
async function handleBulkCategoryUpdate() {
  if (!selectedGalleries.value.length || !selectedCategoriesToUpdate.value.length) {
    isCategoryModalOpen.value = false;
    return;
  }

  const selectedCount = selectedGalleries.value.length;
  
  try {
    isLoading.value = true;
    isCategoryModalOpen.value = false;
    
    // Update each gallery with the selected categories
    await Promise.all(
      selectedGalleries.value.map(galleryId => {
        return trpc.admin.galleries.update.mutate({
          id: galleryId,
          categoryIds: selectedCategoriesToUpdate.value
        });
      })
    );

    // Refresh galleries list
    await fetchGalleries();
    
    // Reset selected galleries and categories after update
    selectedGalleries.value = [];
    selectedCategoriesToUpdate.value = [];

    Swal.fire({
      title: 'Success!',
      text: `Successfully updated categories for ${selectedCount} gallery items`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err: any) {
    error.value = err.message || 'Failed to update categories';
    console.error('Error updating categories:', err);
    
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to update categories',
      icon: 'error' as const
    });
  } finally {
    isLoading.value = false;
  }
}

// Function to close the category modal
function closeCategoryModal() {
  isCategoryModalOpen.value = false;
  selectedCategoriesToUpdate.value = [];
}

// Debounced search
let searchTimeout: NodeJS.Timeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
  }, 300);
}

onMounted(async () => {
  try {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    await fetchCategories();
    await fetchGalleries();
  } catch (err: any) {
    error.value = err.message || "Failed to initialize galleries page";
    console.error("Error initializing galleries page:", err);
    isLoading.value = false;
  }
});

const formatDate = (date: string | Date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString();
};

// Add bulk selection handling
const toggleSelectAll = () => {
  if (selectedGalleries.value.length === galleries.value.items.length) {
    selectedGalleries.value = [];
  } else {
    selectedGalleries.value = galleries.value.items.map((gallery: Gallery) => gallery.id);
  }
};

const toggleGallerySelection = (galleryId: number) => {
  const index = selectedGalleries.value.indexOf(galleryId);
  if (index === -1) {
    selectedGalleries.value.push(galleryId);
  } else {
    selectedGalleries.value.splice(index, 1);
  }
};

// Add sorting function
const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortOrder.value = 'asc';
  }
  fetchGalleries();
};

const openZoomModal = (image: string) => {
  selectedImage.value = image;
  isZoomModalOpen.value = true;
};

const closeZoomModal = () => {
  selectedImage.value = null;
  isZoomModalOpen.value = false;
};

// Toggle active status
async function toggleActive(gallery: Gallery) {
  const newStatus = !gallery.isActive;
  
  const result = await Swal.fire({
    title: `${newStatus ? 'Activate' : 'Deactivate'} Gallery Item?`,
    text: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this gallery item?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Yes, ${newStatus ? 'activate' : 'deactivate'} it!`,
    cancelButtonText: 'Cancel',
    confirmButtonColor: newStatus ? '#10B981' : '#6B7280',
  });

  if (!result.isConfirmed) return;

  try {
    await trpc.admin.galleries.update.mutate({
      id: gallery.id,
      isActive: newStatus
    });
    
    gallery.isActive = newStatus;

    Swal.fire({
      title: 'Success!',
      text: `Gallery item ${newStatus ? 'activated' : 'deactivated'} successfully`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err: any) {
    const errorMessage = err.message || "Failed to update gallery status";
    error.value = errorMessage;
    console.error("Error updating gallery status:", err);
    
    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error' as const
    });
  }
}

// Helper to get category name
const getCategoryNames = (gallery: Gallery) => {
  if (!gallery.categories || gallery.categories.length === 0) {
    return '-';
  }
  
  return gallery.categories
    .map(cat => categories.value.find(c => c.id === cat.id)?.name || `Category ${cat.id}`)
    .join(', ');
};

// Mở modal upload hàng loạt
const openBulkUploadModal = () => {
  if (categories.value.length === 0) {
    fetchCategories().then(() => {
      isBulkUploadModalOpen.value = true;
    });
  } else {
    isBulkUploadModalOpen.value = true;
  }
  uploadingImages.value = [];
};

// Đóng modal upload hàng loạt
const closeBulkUploadModal = () => {
  if (isProcessingUploads.value) {
    Swal.fire({
      title: 'Đang tải lên',
      text: 'Vui lòng đợi quá trình tải lên hoàn tất',
      icon: 'warning',
      showConfirmButton: false
    });
    return;
  }
  
  // Không cần revoke object URL vì đã sử dụng FileReader với Data URL
  isBulkUploadModalOpen.value = false;
  uploadingImages.value = [];
};

// Sau khi upload thành công, thêm chức năng gỡ lỗi
const debugImageFile = (file: File) => {
  console.table({
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024).toFixed(2)} KB`,
    lastModified: new Date(file.lastModified).toLocaleString()
  });
  
  // Thông tin thêm về định dạng ảnh
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    console.log('JPEG/JPG file được phát hiện - định dạng ảnh phổ biến nhất');
  } else if (file.type === 'image/png') {
    console.log('PNG file được phát hiện - định dạng phổ biến hỗ trợ độ trong suốt');
  } else if (file.type === 'image/gif') {
    console.log('GIF file được phát hiện - định dạng hỗ trợ animation');
  } else if (file.type === 'image/webp') {
    console.log('WebP file được phát hiện - định dạng mới, có thể không được hỗ trợ trên mọi trình duyệt');
  } else if (file.type === 'image/svg+xml') {
    console.log('SVG file được phát hiện - định dạng vector, có thể không hoạt động với API upload ảnh');
  } else if (file.type === 'image/heic' || file.type === 'image/heif') {
    console.log('HEIC/HEIF file được phát hiện - định dạng của Apple, thường không được hỗ trợ trên web');
  } else {
    console.log(`Định dạng không phổ biến: ${file.type}`);
  }
  
  return file;
};

// Tạo preview cho file ảnh
const createImagePreview = async (file: File): Promise<string> => {
  try {
    // Debug thông tin về file ảnh
    debugImageFile(file);
    
    // Kiểm tra xem file có phải là ảnh không
    if (!file.type.startsWith('image/')) {
      console.error('File không phải là ảnh:', file.type);
      return DEFAULT_IMAGE;
    }
    
    // Kiểm tra kích thước file
    if (file.size > 10 * 1024 * 1024) { // > 10MB
      console.warn('File ảnh quá lớn:', file.size);
      // Vẫn tạo preview nhưng ghi log cảnh báo
    }
    
    // Log thông tin file để debug
    console.log('Đang tạo preview cho file:', file.name, file.type, file.size);
    
    // Sử dụng FileReader thay vì URL.createObjectURL để tránh vấn đề CORS
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('FileReader đã tạo preview thành công');
        resolve(result || DEFAULT_IMAGE);
      };
      
      reader.onerror = () => {
        console.error('Lỗi khi tạo preview với FileReader:', reader.error);
        resolve(DEFAULT_IMAGE);
      };
      
      // Đọc file dưới dạng Data URL
      reader.readAsDataURL(file);
      
      // Đặt timeout phòng trường hợp onload/onerror không được gọi
      setTimeout(() => {
        if (!reader.result) {
          console.warn('Timeout khi tạo preview với FileReader');
          resolve(DEFAULT_IMAGE);
        }
      }, 3000);
    });
  } catch (error) {
    console.error('Lỗi khi tạo preview:', error);
    return DEFAULT_IMAGE;
  }
};

// Xử lý kéo thả - các sự kiện
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (isProcessingUploads.value) return;

  const dropzone = event.currentTarget as HTMLElement;
  dropzone.classList.add('border-indigo-300', 'bg-indigo-50', 'dark:border-indigo-700', 'dark:bg-indigo-900/30');
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  
  const dropzone = event.currentTarget as HTMLElement;
  dropzone.classList.remove('border-indigo-300', 'bg-indigo-50', 'dark:border-indigo-700', 'dark:bg-indigo-900/30');
};

// Xử lý chọn nhiều file
const handleBulkImageSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const files = Array.from(input.files);
  
  // Thêm hiệu ứng đang tải
  const processingImages = files.map(file => ({
    file,
    progress: 0,
    url: '',
    error: null,
    preview: '',
    previewError: false
  }));
  
  uploadingImages.value = processingImages;
  
  // Tạo preview cho từng ảnh
  for (let i = 0; i < files.length; i++) {
    try {
      const preview = await createImagePreview(files[i]);
      uploadingImages.value[i].preview = preview;
      uploadingImages.value[i].previewError = !preview;
    } catch (error) {
      console.error(`Lỗi tạo preview cho ảnh ${i}:`, error);
      uploadingImages.value[i].previewError = true;
    }
  }
};

// Xử lý kéo thả file
const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (isProcessingUploads.value) return;
  
  const dropzone = event.currentTarget as HTMLElement;
  dropzone.classList.remove('border-indigo-300', 'bg-indigo-50', 'dark:border-indigo-700', 'dark:bg-indigo-900/30');
  
  if (!event.dataTransfer?.files.length) return;
  
  const files = Array.from(event.dataTransfer.files).filter(file => {
    return file.type.startsWith('image/');
  });
  
  if (files.length === 0) {
    toast.warning('Vui lòng chỉ kéo thả các file ảnh');
    return;
  }
  
  // Thêm hiệu ứng đang tải
  const processingImages = files.map(file => ({
    file,
    progress: 0,
    url: '',
    error: null,
    preview: '',
    previewError: false
  }));
  
  uploadingImages.value = processingImages;
  
  // Tạo preview cho từng ảnh
  for (let i = 0; i < files.length; i++) {
    try {
      const preview = await createImagePreview(files[i]);
      uploadingImages.value[i].preview = preview;
      uploadingImages.value[i].previewError = !preview;
    } catch (error) {
      console.error(`Lỗi tạo preview cho ảnh ${i}:`, error);
      uploadingImages.value[i].previewError = true;
    }
  }
};

// Xóa một file khỏi danh sách
const removeFileFromUpload = (index: number) => {
  // Không cần revoke object URL vì đã sử dụng FileReader với Data URL
  uploadingImages.value.splice(index, 1);
};

// Tải lên tất cả các ảnh đã chọn
const processImageUploads = async () => {
  if (uploadingImages.value.length === 0) {
    toast.warning('Vui lòng chọn ít nhất một ảnh để tải lên');
    return;
  }
  
  if (!selectedCategoryForUpload.value) {
    toast.warning('Vui lòng chọn danh mục cho các ảnh');
    return;
  }
  
  isProcessingUploads.value = true;
  
  try {
    // Tải lên từng ảnh
    for (let i = 0; i < uploadingImages.value.length; i++) {
      const item = uploadingImages.value[i];
      
      // Bỏ qua các file đã tải lên thành công
      if (item.url && item.progress === 100) continue;
      
      try {
        // Cập nhật trạng thái bắt đầu tải lên
        item.progress = 10;
        item.error = null;
        
        // Tạo một delay ngắn để hiển thị tiến trình tải lên với người dùng
        await new Promise(resolve => setTimeout(resolve, 300));
        item.progress = 30;
        
        // Tải lên ảnh
        const url = await uploadImage(item.file, 'gallery');
        item.progress = 70;
        item.url = url;
        
        // Tạo gallery item với ảnh này
        await trpc.admin.galleries.create.mutate({
          image: url,
          isActive: isActiveForUpload.value,
          categoryIds: [selectedCategoryForUpload.value],
          translations: [
            {
              locale: 'vi',
              title: item.file.name.split('.')[0], // Lấy tên file làm tiêu đề
              description: ''
            }
          ]
        });
        
        // Hoàn thành
        item.progress = 100;
        
      } catch (err: any) {
        console.error(`Error uploading image ${i}:`, err);
        item.error = err.message || 'Lỗi tải lên ảnh';
        item.progress = 0;
      }
    }
    
    // Làm mới danh sách galleries
    await fetchGalleries();
    
    const successCount = uploadingImages.value.filter(item => item.progress === 100).length;
    const errorCount = uploadingImages.value.filter(item => item.error !== null).length;
    
    if (successCount > 0) {
      Swal.fire({
        title: 'Hoàn tất!',
        text: `Đã tải lên thành công ${successCount} ảnh${errorCount > 0 ? `, ${errorCount} ảnh bị lỗi` : ''}`,
        icon: 'success'
      });
      
      // Đóng modal nếu tất cả thành công
      if (errorCount === 0) {
        // Không cần revoke object URL vì đã sử dụng FileReader với Data URL
        isBulkUploadModalOpen.value = false;
        uploadingImages.value = [];
      }
    } else {
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không có ảnh nào được tải lên thành công',
        icon: 'error'
      });
    }
  } catch (err: any) {
    console.error('Bulk upload error:', err);
    Swal.fire({
      title: 'Lỗi!',
      text: err.message || 'Đã xảy ra lỗi khi tải lên ảnh',
      icon: 'error'
    });
  } finally {
    isProcessingUploads.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Gallery Management"
      description="Manage your image gallery collection efficiently"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Menu as="div" class="relative" v-if="selectedGalleries.length">
            <MenuButton class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              <ListChecksIcon class="h-4 w-4" />
              Bulk Actions ({{ selectedGalleries.length }})
              <ChevronDownIcon class="h-4 w-4" />
            </MenuButton>

            <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div class="p-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleBulkAction('activate')"
                    :class="[
                      active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2'
                    ]"
                  >
                    <ImageIcon class="h-4 w-4" :class="active ? 'text-emerald-700' : 'text-gray-500'" />
                    Activate Selected
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleBulkAction('deactivate')"
                    :class="[
                      active ? 'bg-slate-50 text-slate-700' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2'
                    ]"
                  >
                    <ImageIcon class="h-4 w-4" :class="active ? 'text-slate-700' : 'text-gray-500'" />
                    Deactivate Selected
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleBulkAction('updateCategories')"
                    :class="[
                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2'
                    ]"
                  >
                    <TagIcon class="h-4 w-4" :class="active ? 'text-blue-700' : 'text-gray-500'" />
                    Update Categories
                  </button>
                </MenuItem>
              </div>
              <div class="p-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleBulkAction('delete')"
                    :class="[
                      active ? 'bg-red-50 text-red-700' : 'text-gray-900',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2'
                    ]"
                  >
                    <Trash2Icon class="h-4 w-4" :class="active ? 'text-red-700' : 'text-gray-500'" />
                    Delete Selected
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>

          <!-- Thêm nút Upload Bulk -->
          <button
            @click="openBulkUploadModal"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <UploadIcon class="h-4 w-4" />
            Upload Nhiều Ảnh
          </button>

          <NuxtLink
            to="/galleries/create"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusCircleIcon class="h-4 w-4" />
            Add Gallery Item
          </NuxtLink>
        </div>
      </template>
    </PageHeader>

    <!-- Search and Filter -->
    <div class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col gap-1 md:w-80 lg:w-96">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
          <div class="relative rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="search"
              type="text"
              placeholder="Search gallery items..."
              class="block w-full pl-10 pr-3 py-2 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
              @input="handleSearch"
            />
          </div>
        </div>
        
        <div class="flex flex-col gap-1 w-48">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
            <select
              v-model="activeFilter"
              class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
            >
              <option :value="undefined">All Items</option>
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
        </div>
        
        <div class="flex flex-col gap-1 w-48">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
            <select
              v-model="categoryId"
              class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
            >
              <option :value="undefined">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex flex-col gap-1 w-48">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Items per page</label>
          <div class="rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
            <select
              v-model="pageSize"
              class="block w-full px-3 py-2 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 rounded-lg bg-transparent"
            >
              <option :value="10">10 per page</option>
              <option :value="25">25 per page</option>
              <option :value="50">50 per page</option>
              <option :value="100">100 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Error Alert -->
    <TransitionRoot as="template" :show="!!error">
      <div class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <LucideXCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
          <div class="ml-auto pl-3">
            <button
              type="button"
              class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              @click="error = null"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </TransitionRoot>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
      <div class="animate-pulse space-y-4">
        <div v-for="i in 5" :key="i" class="flex space-x-4">
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/5"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/5"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/5"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/5"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/5"></div>
        </div>
      </div>
    </div>

    <!-- Gallery Items Table -->
    <DataTable
      :items="galleries.items"
      :loading="isLoading"
      :error="error"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      :selected-items="selectedGalleries"
      :pagination="{
        currentPage: page,
        totalPages: galleries.totalPages,
        total: galleries.total,
        pageSize: pageSize
      }"
      @update:selected-items="selectedGalleries = $event"
      @sort="handleSort"
      @page-change="(newPage) => { page = newPage; fetchGalleries(); }"
      @clear-error="error = null"
    >
      <!-- Selection slot -->
      <template #selection="{ item, isSelected, toggleSelection }">
        <input
          type="checkbox"
          class="checkbox rounded"
          :checked="isSelected"
          @change="toggleSelection(item.id)"
        />
      </template>

      <!-- Header slot -->
      <template #header="{ sortBy, sortOrder, handleSort }">
        <th scope="col" class="px-6 py-3 text-left">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</span>
        </th>
        <th 
          v-for="column in ['Title', 'Categories', 'Status', 'Created At', 'Actions']" 
          :key="column"
          scope="col" 
          class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
          @click="handleSort(column.toLowerCase())"
        >
          <div class="flex items-center gap-2">
            {{ column }}
            <ChevronDownIcon v-if="sortBy !== column.toLowerCase()" class="h-4 w-4" />
            <ChevronUpIcon v-else-if="sortOrder === 'asc'" class="h-4 w-4" />
            <ChevronDownIcon v-else class="h-4 w-4" />
          </div>
        </th>
      </template>

      <!-- Row slot -->
      <template #row="{ item: gallery }">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div 
              class="h-16 w-16 flex-shrink-0 cursor-pointer group relative rounded-lg overflow-hidden"
              @click="openZoomModal(gallery.image)"
            >
              <img 
                :src="gallery.image" 
                class="h-full w-full object-cover transition-transform group-hover:scale-105"
                alt=""
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                <ZoomInIcon class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ gallery.translations?.[0]?.title || 'Untitled' }}
            <p v-if="gallery.translations?.[0]?.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] truncate">
              {{ gallery.translations?.[0]?.description }}
            </p>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="category in gallery.categories"
              :key="category.id"
              class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {{ categories.find(c => c.id === category.id)?.name || `Category ${category.id}` }}
            </span>
            <span v-if="!gallery.categories || gallery.categories.length === 0" class="text-gray-400">-</span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button
            @click="toggleActive(gallery)"
            :class="{
              'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 cursor-pointer transition-colors duration-200': true,
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800': gallery.isActive,
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600': !gallery.isActive
            }"
          >
            <div class="w-2 h-2 rounded-full"
              :class="{
                'bg-green-500': gallery.isActive,
                'bg-gray-500': !gallery.isActive
              }"
            ></div>
            {{ gallery.isActive ? 'Active' : 'Inactive' }}
          </button>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {{ formatDate(gallery.createdAt) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex justify-end gap-2">
            <NuxtLink
              :to="`/galleries/edit/${gallery.id}`"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="Edit gallery item"
            >
              <PencilIcon class="h-5 w-5" />
            </NuxtLink>
            <button
              @click="handleDelete(gallery.id)"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title="Delete gallery item"
            >
              <Trash2Icon class="h-5 w-5" />
            </button>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Image Zoom Modal -->
    <TransitionRoot as="template" :show="isZoomModalOpen">
      <div class="fixed inset-0 z-50 overflow-y-auto" @click="closeZoomModal">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          
          <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all max-w-4xl w-full" @click.stop>
            <div class="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                class="rounded-md bg-white dark:bg-neutral-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                @click="closeZoomModal"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div class="mt-6">
              <swiper
                :modules="[Navigation, Pagination, Zoom]"
                :navigation="true"
                :pagination="{ clickable: true }"
                :zoom="true"
                class="h-[60vh]"
              >
                <swiper-slide v-if="selectedImage">
                  <div class="swiper-zoom-container">
                    <img :src="selectedImage" class="w-full h-full object-contain" alt="" />
                  </div>
                </swiper-slide>
              </swiper>
            </div>
          </div>
        </div>
      </div>
    </TransitionRoot>
    
    <!-- Category Update Modal -->
    <TransitionRoot as="template" :show="isCategoryModalOpen">
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          
          <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:max-w-lg sm:w-full sm:p-6">
            <div class="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                class="rounded-md bg-white dark:bg-neutral-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                @click="closeCategoryModal"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div class="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                Update Categories for {{ selectedGalleries.length }} Items
              </h3>
              
              <div class="mt-4">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Select the categories you want to apply to all selected gallery items.
                  This will replace their existing categories.
                </p>
                
                <div class="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div class="space-y-2">
                    <div 
                      v-for="category in categories" 
                      :key="category.id"
                      class="flex items-center"
                    >
                      <input
                        type="checkbox"
                        :id="`category-${category.id}`"
                        :value="category.id"
                        v-model="selectedCategoriesToUpdate"
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label :for="`category-${category.id}`" class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        {{ category.name }}
                      </label>
                    </div>
                    <div v-if="categories.length === 0" class="text-gray-500 dark:text-gray-400 text-sm py-2">
                      No categories available
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                @click="handleBulkCategoryUpdate"
              >
                Update Categories
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                @click="closeCategoryModal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionRoot>

    <!-- Modal upload nhiều ảnh -->
    <TransitionRoot as="template" :show="isBulkUploadModalOpen">
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          
          <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-neutral-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all max-w-4xl w-full">
            <div class="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                class="rounded-md bg-white dark:bg-neutral-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                @click="closeBulkUploadModal"
                :disabled="isProcessingUploads"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>
            
            <div class="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                Upload nhiều ảnh vào thư viện
              </h3>
              
              <div class="mt-4 space-y-4">
                <!-- Chọn danh mục -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Danh mục <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="selectedCategoryForUpload"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    :disabled="isProcessingUploads"
                  >
                    <option :value="null">-- Chọn danh mục --</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                
                <!-- Trạng thái -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng thái
                  </label>
                  <div class="mt-1 flex items-center">
                    <input
                      type="checkbox"
                      id="isActiveUpload"
                      v-model="isActiveForUpload"
                      class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :disabled="isProcessingUploads"
                    />
                    <label for="isActiveUpload" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Kích hoạt các ảnh ngay sau khi tải lên
                    </label>
                  </div>
                </div>
                
                <!-- Upload form -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chọn các ảnh để tải lên <span class="text-red-500">*</span>
                  </label>
                  
                  <div 
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center transition-colors duration-200"
                    :class="{ 'opacity-50 pointer-events-none': isProcessingUploads }"
                    @dragover="handleDragOver"
                    @dragleave="handleDragLeave"
                    @drop="handleDrop"
                  >
                    <div v-if="uploadingImages.length === 0">
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Kéo và thả ảnh vào đây hoặc
                        <label class="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          chọn từ thiết bị
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            class="hidden"
                            @change="handleBulkImageSelect"
                            :disabled="isProcessingUploads"
                          />
                        </label>
                      </p>
                      <p class="text-xs text-gray-500 mt-2">PNG, JPG, GIF tối đa 10MB</p>
                    </div>
                    
                    <div v-else class="max-h-60 overflow-y-auto">
                      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                        <li v-for="(item, index) in uploadingImages" :key="index" class="py-3 flex justify-between items-center">
                          <div class="flex items-center space-x-3">
                            <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                              <img
                                v-if="item.url || (item.preview && !item.previewError)"
                                :src="item.url || item.preview"
                                class="w-full h-full object-cover"
                                alt=""
                                @error="item.previewError = true"
                              />
                              <img
                                v-else-if="item.previewError"
                                :src="DEFAULT_IMAGE"
                                class="w-full h-full object-cover"
                                alt="Ảnh mặc định"
                              />
                              <div v-else class="w-full h-full flex items-center justify-center">
                                <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                                {{ item.file.name }}
                              </p>
                              <p class="text-xs text-gray-500">
                                {{ (item.file.size / 1024).toFixed(1) }} KB
                              </p>
                              <div v-if="item.error" class="text-xs text-red-500 mt-1">
                                {{ item.error }}
                              </div>
                              <div v-else-if="item.progress > 0 && item.progress < 100" class="mt-1">
                                <div class="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    class="h-full bg-indigo-600 transition-all duration-300"
                                    :style="{ width: `${item.progress}%` }"
                                  ></div>
                                </div>
                                <p class="text-xs text-gray-500 mt-0.5">
                                  {{ item.progress }}% hoàn thành
                                </p>
                              </div>
                              <p v-else-if="item.url" class="text-xs text-green-500 mt-1">
                                Đã tải lên thành công
                              </p>
                            </div>
                          </div>
                          
                          <button
                            v-if="!isProcessingUploads"
                            @click="removeFileFromUpload(index)"
                            class="ml-2 text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon class="h-5 w-5" />
                          </button>
                        </li>
                      </ul>
                      
                      <div class="mt-4 flex justify-center">
                        <label class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                          :class="{ 'opacity-50 pointer-events-none': isProcessingUploads }">
                          <PlusCircleIcon class="h-4 w-4" />
                          Thêm ảnh
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            class="hidden"
                            @change="handleBulkImageSelect"
                            :disabled="isProcessingUploads"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                @click="processImageUploads"
                :disabled="isProcessingUploads || uploadingImages.length === 0"
                :class="{ 'opacity-50 cursor-not-allowed': isProcessingUploads || uploadingImages.length === 0 }"
              >
                <span v-if="isProcessingUploads" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
                <span v-else>Tải lên</span>
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                @click="closeBulkUploadModal"
                :disabled="isProcessingUploads"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionRoot>
  </div>
</template>

<style scoped>
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.swiper-button-next,
.swiper-button-prev {
  color: theme('colors.indigo.600');
}

.swiper-pagination-bullet-active {
  background: theme('colors.indigo.600');
}

/* Dark mode */
:dark .swiper-button-next,
:dark .swiper-button-prev {
  color: theme('colors.indigo.400');
}

:dark .swiper-pagination-bullet-active {
  background: theme('colors.indigo.400');
}
</style> 