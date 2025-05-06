<script setup lang="ts">
import { ref, reactive, computed, onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '../../../../composables/useTrpc'
import { useToast } from '../../../../composables/useToast'
import { 
  Layout, 
  Eye, 
  Settings, 
  Palette, 
  LayoutPanelLeft,
  Type
} from 'lucide-vue-next'
import { PageType, ThemeSection } from '@ew/shared'

// Route
const route = useRoute()
const router = useRouter()
const trpc = useTrpc()
const toast = useToast()

// Page title
provide('pageTitle', computed(() => section.value ? `Chỉnh sửa Section: ${section.value.title}` : 'Chỉnh sửa Section'))

// URL params
const themeId = computed(() => {
  console.log('Route path:', route.path);
  console.log('Route params:', route.params);
  
  // Lấy theme ID từ params, đảm bảo luôn là số hợp lệ
  const id = Number(route.params.id);
  console.log('Theme ID from params:', id);
  
  // Fallback xử lý nếu id không hợp lệ - redirect về trang themes
  if (isNaN(id) || id <= 0) {
    console.error('Invalid theme ID:', id);
    // Xử lý trong onMounted để tránh lỗi trong quá trình render
    setTimeout(() => {
      toast.error('ID theme không hợp lệ');
      router.push('/themes');
    }, 100);
    return 0;
  }
  
  return id;
});

const sectionId = computed(() => {
  // Lấy section ID từ tham số URL
  const id = Number(route.params.sectionId);
  console.log('Section ID from params:', id);
  return id;
});

// State
const section = ref<ThemeSection | null>(null)
const loading = ref(true)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

// Form data
const sectionForm = reactive({
  title: '',
  type: '',
  componentName: '',
  pageType: 'home_page' as PageType,
  order: 0,
  isActive: true,
  settings: {} as Record<string, any>
})

// Fetch section data
const fetchSection = async () => {
  loading.value = true
  error.value = null
  
  console.log(`Fetching section: themeId=${themeId.value}, sectionId=${sectionId.value}`)
  
  if (!themeId.value || themeId.value <= 0) {
    console.error('Invalid theme ID, cannot fetch section');
    error.value = 'ID theme không hợp lệ';
    loading.value = false;
    return;
  }
  
  try {
    console.log('Calling API with params:', { themeId: themeId.value, sectionId: sectionId.value });
    const data = await trpc.admin.themeSection.getById.query({
      themeId: themeId.value,
      sectionId: sectionId.value
    })
    
    console.log('Fetched section data:', data);
    section.value = data
    
    // Copy data to form
    sectionForm.title = data.title
    sectionForm.type = data.type
    sectionForm.componentName = data.componentName || ''
    sectionForm.pageType = data.pageType
    sectionForm.order = data.order
    sectionForm.isActive = data.isActive
    sectionForm.settings = data.settings || {}
  } catch (err: any) {
    console.error('Failed to fetch section:', err)
    error.value = err.message || 'Không thể tải thông tin section'
    toast.error('Không thể tải thông tin section')
  } finally {
    loading.value = false
  }
}

// Save section
const saveSection = async () => {
  isSubmitting.value = true
  
  try {
    await trpc.admin.themeSection.update.mutate({
      themeId: themeId.value,
      sectionId: sectionId.value,
      data: {
        title: sectionForm.title,
        type: sectionForm.type,
        componentName: sectionForm.componentName || undefined,
        pageType: sectionForm.pageType,
        order: sectionForm.order,
        isActive: sectionForm.isActive,
        settings: sectionForm.settings
      }
    })
    
    toast.success('Cập nhật section thành công')
    
    // Navigate back to sections list
    navigateToSections()
  } catch (err: any) {
    console.error('Failed to update section:', err)
    toast.error('Không thể cập nhật section')
  } finally {
    isSubmitting.value = false
  }
}

// Delete section
const deleteSection = async () => {
  try {
    await trpc.admin.themeSection.delete.mutate({
      themeId: themeId.value,
      sectionId: sectionId.value
    })
    
    toast.success('Xóa section thành công')
    navigateToSections()
  } catch (err: any) {
    console.error('Failed to delete section:', err)
    toast.error('Không thể xóa section')
  }
}

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get page type options
const pageTypeOptions = [
  { value: 'home_page', label: 'Trang chủ' },
  { value: 'product_page', label: 'Trang sản phẩm' },
  { value: 'news_page', label: 'Trang tin tức' },
  { value: 'about_page', label: 'Trang giới thiệu' },
  { value: 'service_page', label: 'Trang dịch vụ' },
  { value: 'contact_page', label: 'Trang liên hệ' },
  { value: 'common', label: 'Chung' }
]

// Get section type options
const sectionTypeOptions = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'featured_products', label: 'Sản phẩm nổi bật' },
  { value: 'category_grid', label: 'Lưới danh mục' },
  { value: 'testimonials', label: 'Đánh giá khách hàng' },
  { value: 'about', label: 'Giới thiệu' },
  { value: 'services', label: 'Dịch vụ' },
  { value: 'contact', label: 'Liên hệ' },
  { value: 'cta', label: 'Call-to-Action' },
  { value: 'faq', label: 'Câu hỏi thường gặp' },
  { value: 'features', label: 'Tính năng' },
  { value: 'gallery', label: 'Thư viện ảnh' },
  { value: 'newsletter', label: 'Đăng ký nhận tin' },
  { value: 'custom', label: 'Tùy chỉnh' }
]

// Get section type label
const getSectionTypeLabel = (type: string) => {
  const option = sectionTypeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

// Load data on mount
onMounted(() => {
  fetchSection()
})

// Navigate back to sections list
const navigateToSections = () => {
  const id = themeId.value || 0;
  if (id <= 0) {
    console.warn('Invalid theme ID, navigating to themes list');
    router.push('/themes');
    return;
  }
  console.log(`Navigating to sections list: /themes/${id}/sections`);
  router.push(`/themes/${id}/sections`);
};

// Navigate back to theme detail
const navigateToTheme = () => {
  const id = themeId.value || 0;
  if (id <= 0) {
    console.warn('Invalid theme ID, navigating to themes list');
    router.push('/themes');
    return;
  }
  console.log(`Navigating to theme detail: /themes/${id}`);
  router.push(`/themes/${id}`);
};
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center">
        <Layout class="mr-2 w-8 h-8 text-primary-500" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <template v-if="section">
            {{ section.title }}
            <UBadge
              :color="section.isActive ? 'green' : 'gray'"
              variant="soft"
              size="sm"
              class="ml-2"
            >
              {{ section.isActive ? 'Hiển thị' : 'Ẩn' }}
            </UBadge>
          </template>
          <template v-else>
            Chỉnh sửa Section
          </template>
        </h1>
      </div>
      
      <div class="mt-4 flex flex-wrap gap-2 lg:mt-0">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          @click="navigateToSections"
        >
          Quay lại danh sách
        </UButton>
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-home"
          @click="navigateToTheme"
        >
          Về trang Theme
        </UButton>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <ULoading class="w-8 h-8 text-primary-500" />
      <span class="ml-2 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
    </div>
    
    <!-- Error state -->
    <UCard v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50">
      <div class="flex items-center text-red-600 dark:text-red-400">
        <i class="i-heroicons-exclamation-circle mr-2 text-xl"></i>
        <span>{{ error }}</span>
      </div>
      <UButton color="gray" variant="ghost" class="mt-2" @click="fetchSection">
        Thử lại
      </UButton>
    </UCard>
    
    <!-- Section form -->
    <div v-else-if="section" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="font-medium">Thông tin Section</div>
          </template>
          
          <form @submit.prevent="saveSection" class="space-y-6">
            <!-- Title -->
            <UFormGroup label="Tiêu đề" required>
              <UInput
                v-model="sectionForm.title"
                placeholder="Nhập tiêu đề cho section"
              />
            </UFormGroup>
            
            <!-- Section Type -->
            <UFormGroup label="Loại Section" required>
              <USelect
                v-model="sectionForm.type"
                :options="sectionTypeOptions"
                option-attribute="label"
                value-attribute="value"
                placeholder="Chọn loại section"
              />
            </UFormGroup>
            
            <!-- Component Name -->
            <UFormGroup label="Tên Component" help="Tên component sẽ được sử dụng để render section này">
              <UInput
                v-model="sectionForm.componentName"
                placeholder="Ví dụ: HeroSection, ProductsGrid, ..."
              />
            </UFormGroup>
            
            <!-- Page Type -->
            <UFormGroup label="Thuộc trang" required>
              <USelect
                v-model="sectionForm.pageType"
                :options="pageTypeOptions"
                option-attribute="label"
                value-attribute="value"
                placeholder="Chọn trang để hiển thị section này"
              />
            </UFormGroup>
            
            <!-- Order -->
            <UFormGroup label="Thứ tự" help="Thứ tự hiển thị của section trong trang">
              <UInput
                v-model.number="sectionForm.order"
                type="number"
                min="0"
                placeholder="Thứ tự hiển thị"
              />
            </UFormGroup>
            
            <!-- Active Status -->
            <UFormGroup>
              <UToggle
                v-model="sectionForm.isActive"
                label="Hiển thị section này"
                color="primary"
              />
            </UFormGroup>
            
            <!-- Settings -->
            <UFormGroup label="Cài đặt Section" help="Các cài đặt tùy chỉnh cho section này">
              <UTextarea
                v-model="sectionForm.settings"
                placeholder='{}'
                rows="10"
                class="font-mono text-sm"
              />
            </UFormGroup>
            
            <!-- Form Actions -->
            <div class="flex justify-between">
              <UButton
                color="red"
                variant="soft"
                icon="i-heroicons-trash"
                @click="deleteSection"
                type="button"
              >
                Xóa Section
              </UButton>
              
              <div class="space-x-2">
                <UButton
                  color="gray"
                  variant="soft"
                  @click="navigateToSections"
                  type="button"
                >
                  Hủy
                </UButton>
                <UButton
                  color="primary"
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                >
                  Lưu thay đổi
                </UButton>
              </div>
            </div>
          </form>
        </UCard>
      </div>
      
      <!-- Info Panel -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <div class="font-medium">Thông tin</div>
          </template>
          
          <div class="space-y-4">
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">ID</div>
              <div>{{ section.id }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Loại</div>
              <div>{{ getSectionTypeLabel(section.type) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Thuộc Theme</div>
              <div>{{ themeId }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Thuộc trang</div>
              <UBadge
                color="blue"
                variant="soft"
              >
                {{ pageTypeOptions.find(o => o.value === section?.pageType)?.label || section?.pageType }}
              </UBadge>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo</div>
              <div>{{ formatDate(section.createdAt) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Cập nhật lần cuối</div>
              <div>{{ formatDate(section.updatedAt) }}</div>
            </div>
          </div>
        </UCard>
        
        <!-- Preview Card -->
        <UCard class="mt-4">
          <template #header>
            <div class="font-medium">Xem trước</div>
          </template>
          
          <div class="p-4 border rounded-lg dark:border-gray-700 text-center">
            <LayoutPanelLeft class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Xem trước chưa được hỗ trợ cho section này.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template> 