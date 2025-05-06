<script setup lang="ts">
import { ref, reactive, onMounted, provide, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import { Palette, Layout, Plus } from 'lucide-vue-next'
import { PageType } from '@ew/shared'

// Get route params
const route = useRoute()
const router = useRouter()
const themeId = computed(() => Number(route.params.id))

// Set page title
provide('pageTitle', 'Thêm Section mới')

// State
const theme = ref<{ id: number; name: string } | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const formErrors = ref<Record<string, string>>({})

// Section types and components
const sectionTypes = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'features', label: 'Features' },
  { value: 'about', label: 'About' },
  { value: 'products', label: 'Products' },
  { value: 'news', label: 'News' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'contact', label: 'Contact' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'footer', label: 'Footer' },
  { value: 'navbar', label: 'Navigation Bar' },
  { value: 'header', label: 'Header' },
  { value: 'custom', label: 'Custom' }
]

// Component type based on section type
const componentOptions = computed(() => {
  switch (sectionForm.type) {
    case 'hero':
      return [
        { value: 'HeroWithSlider', label: 'Hero với slider' },
        { value: 'HeroWithVideo', label: 'Hero với video' },
        { value: 'HeroSimple', label: 'Hero đơn giản' }
      ]
    case 'features':
      return [
        { value: 'FeaturesGrid', label: 'Features dạng lưới' },
        { value: 'FeaturesCards', label: 'Features dạng cards' },
        { value: 'FeaturesWithIcons', label: 'Features với icons' }
      ]
    case 'navbar':
      return [
        { value: 'NavbarStandard', label: 'Navbar chuẩn' },
        { value: 'NavbarWithMegaMenu', label: 'Navbar với mega menu' }
      ]
    case 'custom':
      return [
        { value: 'CustomSection', label: 'Section tùy chỉnh' }
      ]
    default:
      return []
  }
})

// Page type options
const pageTypeOptions = [
  { value: 'home_page', label: 'Trang chủ' },
  { value: 'news_page', label: 'Trang tin tức' },
  { value: 'product_page', label: 'Trang sản phẩm' },
  { value: 'about_page', label: 'Trang giới thiệu' },
  { value: 'service_page', label: 'Trang dịch vụ' },
  { value: 'contact_page', label: 'Trang liên hệ' },
  { value: 'common', label: 'Chung' }
]

// Form
const sectionForm = reactive({
  type: 'hero',
  componentName: '',
  title: '',
  order: 0,
  pageType: 'home_page',
  settings: {},
  isActive: true
})

// Default settings based on section type
const defaultSettings = computed(() => {
  switch (sectionForm.type) {
    case 'hero':
      return {
        layout: 'split-columns',
        height: '600px',
        autoplay: true,
        interval: 5000,
        showDots: true,
        showArrows: true,
        videoWidth: '30%',
        sliderWidth: '70%',
        videoPosition: 'left',
        sliderPosition: 'right',
        overlayOpacity: '0.5',
        description: '',
        image: '',
        buttonText: 'Tìm hiểu thêm',
        buttonLink: '/about'
      }
    case 'features':
      return {
        layout: 'grid',
        columns: 3,
        features: [
          { title: 'Feature 1', description: 'Description 1', icon: 'star' },
          { title: 'Feature 2', description: 'Description 2', icon: 'heart' },
          { title: 'Feature 3', description: 'Description 3', icon: 'eye' }
        ],
        alignment: 'center'
      }
    case 'navbar':
      return {
        menuAlignment: 'center',
        showLanguageSwitcher: true,
        showThemeToggle: true,
        showCart: true,
        showHotline: false,
        mobileMenuBreakpoint: 'md',
        borderColor: '',
        topMenu: {
          leftColumn: {
            items: [],
            width: '30%',
            alignment: 'start'
          },
          centerColumn: {
            items: [],
            width: '40%',
            alignment: 'center'
          },
          rightColumn: {
            items: [],
            width: '30%',
            alignment: 'end'
          }
        }
      }
    default:
      return {}
  }
})

// Init form when type changes
const initFormFromType = () => {
  sectionForm.settings = { ...defaultSettings.value }
  
  if (componentOptions.value.length > 0) {
    sectionForm.componentName = componentOptions.value[0].value
  } else {
    sectionForm.componentName = ''
  }
}

// Watch for type changes
watch(() => sectionForm.type, () => {
  initFormFromType()
})

// Fetch theme info
const fetchTheme = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await trpc.admin.theme.getTheme.query({ id: themeId.value })
    theme.value = {
      id: data.id,
      name: data.name
    }
    
    // Get the highest order to set new section order
    if (data.sections && data.sections.length > 0) {
      const maxOrder = Math.max(...data.sections.map(s => s.order))
      sectionForm.order = maxOrder + 1
    } else {
      sectionForm.order = 1
    }
    
    initFormFromType()
  } catch (err: any) {
    console.error('Failed to fetch theme:', err)
    error.value = err.message || 'Không thể tải thông tin theme'
    
    UNotification.show({
      text: 'Không thể tải thông tin theme',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Validate form
const validateForm = () => {
  const errors: Record<string, string> = {}
  
  if (!sectionForm.title.trim()) {
    errors.title = 'Tiêu đề không được để trống'
  }
  
  if (!sectionForm.type) {
    errors.type = 'Loại section không được để trống'
  }
  
  if (!sectionForm.pageType) {
    errors.pageType = 'Loại trang không được để trống'
  }
  
  if (sectionForm.order < 0) {
    errors.order = 'Thứ tự phải lớn hơn hoặc bằng 0'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

// Submit form
const submitForm = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    await trpc.admin.theme.createThemeSection.mutate({
      themeId: themeId.value,
      type: sectionForm.type,
      componentName: sectionForm.componentName,
      title: sectionForm.title,
      order: sectionForm.order,
      pageType: sectionForm.pageType,
      settings: sectionForm.settings,
      isActive: sectionForm.isActive
    })
    
    UNotification.show({
      text: 'Tạo section thành công',
      type: 'success'
    })
    
    // Navigate back to sections list
    router.push(`/themes/${themeId.value}/sections`)
  } catch (error) {
    console.error('Failed to create section:', error)
    UNotification.show({
      text: 'Không thể tạo section',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Cancel and go back
const cancelForm = () => {
  router.push(`/themes/${themeId.value}/sections`)
}

// Load data on mount
onMounted(() => {
  fetchTheme()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center">
        <Layout class="mr-2 w-7 h-7 text-primary-500" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Thêm Section mới
          <template v-if="theme">
            - {{ theme.name }}
          </template>
        </h1>
      </div>
      <div class="flex gap-2">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          @click="cancelForm"
        >
          Quay lại
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
      <UButton color="gray" variant="ghost" class="mt-2" @click="fetchTheme">
        Thử lại
      </UButton>
    </UCard>
    
    <!-- Create form -->
    <div v-else class="grid grid-cols-1 gap-6">
      <UCard>
        <form @submit.prevent="submitForm">
          <div class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin cơ bản</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Title -->
                <UFormGroup
                  label="Tiêu đề"
                  required
                  help="Nhập tiêu đề cho section"
                  :error="formErrors.title"
                >
                  <UInput
                    v-model="sectionForm.title"
                    placeholder="Ví dụ: Hero Section, Footer, ..."
                    :error="!!formErrors.title"
                  />
                </UFormGroup>
                
                <!-- Type -->
                <UFormGroup
                  label="Loại section"
                  required
                  help="Chọn loại section"
                  :error="formErrors.type"
                >
                  <USelect
                    v-model="sectionForm.type"
                    :options="sectionTypes"
                    :error="!!formErrors.type"
                  />
                </UFormGroup>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <!-- Component Name -->
                <UFormGroup
                  label="Component"
                  help="Chọn component tương ứng với loại section"
                  :disabled="componentOptions.length === 0"
                >
                  <USelect
                    v-if="componentOptions.length > 0"
                    v-model="sectionForm.componentName"
                    :options="componentOptions"
                  />
                  <UInput
                    v-else
                    v-model="sectionForm.componentName"
                    placeholder="Tên component hoặc để trống"
                    class="w-full"
                  />
                </UFormGroup>
                
                <!-- Page Type -->
                <UFormGroup
                  label="Loại trang"
                  required
                  help="Chọn loại trang hiển thị section này"
                  :error="formErrors.pageType"
                >
                  <USelect
                    v-model="sectionForm.pageType"
                    :options="pageTypeOptions"
                    :error="!!formErrors.pageType"
                  />
                </UFormGroup>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <!-- Order -->
                <UFormGroup
                  label="Thứ tự"
                  help="Thứ tự hiển thị của section (thấp hiển thị trước)"
                  :error="formErrors.order"
                >
                  <UInput
                    v-model.number="sectionForm.order"
                    type="number"
                    min="0"
                    :error="!!formErrors.order"
                  />
                </UFormGroup>
                
                <!-- Active Status -->
                <UFormGroup>
                  <UToggle
                    v-model="sectionForm.isActive"
                    label="Kích hoạt section"
                    description="Section sẽ được hiển thị trên website khi được kích hoạt"
                    color="primary"
                  />
                </UFormGroup>
              </div>
            </div>
            
            <!-- Advanced Settings -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Cài đặt nâng cao</h3>
              
              <UAlert
                type="info"
                title="Cài đặt tự động"
                class="mb-4"
                description="Các cài đặt mặc định đã được thiết lập dựa trên loại section bạn chọn. Bạn có thể chỉnh sửa chi tiết sau khi tạo section."
              />
              
              <!-- Settings will be edited in detail page -->
              <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Các cài đặt chi tiết sẽ được hiển thị trong trang chỉnh sửa section sau khi bạn tạo section này.
                </p>
              </div>
            </div>
            
            <!-- Form Actions -->
            <div class="flex justify-end space-x-2">
              <UButton
                variant="ghost"
                @click="cancelForm"
                :disabled="saving"
              >
                Hủy
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="saving"
                :disabled="saving"
              >
                Tạo Section
              </UButton>
            </div>
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template> 