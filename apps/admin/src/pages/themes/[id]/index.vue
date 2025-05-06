<script setup lang="ts">
import { ref, reactive, onMounted, provide, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '../../../composables/useTrpc'
import { useToast } from '../../../composables/useToast'
import { Palette, Layout, Plus, Layers, Settings } from 'lucide-vue-next'
import { PageType, ColorMode, Theme, ThemeSection } from '@ew/shared'

// Get route params
const route = useRoute()
const router = useRouter()
const trpc = useTrpc()
const toast = useToast()
const themeId = computed(() => Number(route.params.id))

// Set page title dynamically
provide('pageTitle', computed(() => theme.value ? `Theme: ${theme.value.name}` : 'Chi tiết Theme'))

// State
const theme = ref<Theme | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isEditing = ref(false)
const showSectionCreate = ref(false)

// Form
const themeForm = reactive({
  name: '',
  colors: {
    light: {
      primary: {},
      secondary: {},
      tertiary: {}
    },
    dark: {
      primary: {},
      secondary: {},
      tertiary: {}
    }
  },
  isActive: false
})

// Fetch theme data
const fetchTheme = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await trpc.admin.theme.getById.query(themeId.value)
    theme.value = data
    
    // Copy data to form
    themeForm.name = data.name
    themeForm.colors = data.colors
    themeForm.isActive = data.isActive
  } catch (err: any) {
    console.error('Failed to fetch theme:', err)
    error.value = err.message || 'Không thể tải thông tin theme'
    
    toast.error('Không thể tải thông tin theme')
  } finally {
    loading.value = false
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

// Load data on mount
onMounted(() => {
  fetchTheme()
})

// Navigate to theme edit
const navigateToThemeEdit = () => {
  router.push(`/themes/${themeId.value}/edit`)
}

// Navigate to section list
const navigateToSections = () => {
  router.push(`/themes/${themeId.value}/sections`)
}

// Navigate to section create
const navigateToSectionCreate = () => {
  router.push(`/themes/${themeId.value}/sections/create`)
}

// Get page type label
const getPageTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'home_page': 'Trang chủ',
    'news_page': 'Trang tin tức',
    'product_page': 'Trang sản phẩm',
    'about_page': 'Trang giới thiệu',
    'service_page': 'Trang dịch vụ',
    'contact_page': 'Trang liên hệ',
    'common': 'Chung'
  }
  
  return types[type] || type
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center">
        <Palette class="mr-2 w-8 h-8 text-primary-500" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <template v-if="theme">
            {{ theme.name }}
            <UBadge
              :color="theme.isActive ? 'green' : 'gray'"
              variant="soft"
              size="sm"
              class="ml-2"
            >
              {{ theme.isActive ? 'Hoạt động' : 'Không hoạt động' }}
            </UBadge>
          </template>
          <template v-else>
            Chi tiết Theme
          </template>
        </h1>
      </div>
      
      <div class="mt-4 flex flex-wrap gap-2 sm:mt-0">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          @click="router.push('/themes')"
        >
          Quay lại
        </UButton>
        <UButton
          color="primary"
          variant="soft"
          icon="i-heroicons-pencil"
          @click="navigateToThemeEdit"
        >
          Chỉnh sửa Theme
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-squares-plus"
          @click="navigateToSections"
        >
          Quản lý Sections
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
    
    <!-- Theme details -->
    <div v-else-if="theme" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main theme info -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <div class="font-medium">Thông tin Theme</div>
          </template>
          
          <div class="space-y-4">
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">ID</div>
              <div>{{ theme.id }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Tên</div>
              <div>{{ theme.name }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</div>
              <UBadge
                :color="theme.isActive ? 'green' : 'gray'"
                variant="soft"
              >
                {{ theme.isActive ? 'Hoạt động' : 'Không hoạt động' }}
              </UBadge>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo</div>
              <div>{{ formatDate(theme.createdAt) }}</div>
            </div>
            
            <div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Cập nhật lần cuối</div>
              <div>{{ formatDate(theme.updatedAt) }}</div>
            </div>
          </div>
          
          <template #footer>
            <div class="flex justify-end">
              <UButton
                color="primary"
                @click="navigateToThemeEdit"
                icon="i-heroicons-pencil"
              >
                Chỉnh sửa
              </UButton>
            </div>
          </template>
        </UCard>
        
        <!-- Color palette preview -->
        <UCard class="mt-6">
          <template #header>
            <div class="font-medium">Màu sắc</div>
          </template>
          
          <div class="space-y-6">
            <!-- Light mode colors -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Light Mode</h3>
              <div class="grid grid-cols-3 gap-2">
                <div class="space-y-1">
                  <div class="w-full h-10 rounded-md" 
                    :style="{ backgroundColor: theme.colors.light.primary['500'] }"></div>
                  <div class="text-xs text-center">Primary</div>
                </div>
                <div class="space-y-1">
                  <div class="w-full h-10 rounded-md" 
                    :style="{ backgroundColor: theme.colors.light.secondary['500'] }"></div>
                  <div class="text-xs text-center">Secondary</div>
                </div>
                <div class="space-y-1">
                  <div class="w-full h-10 rounded-md" 
                    :style="{ backgroundColor: theme.colors.light.tertiary['500'] }"></div>
                  <div class="text-xs text-center">Tertiary</div>
                </div>
              </div>
            </div>
            
            <!-- Dark mode colors -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dark Mode</h3>
              <div class="grid grid-cols-3 gap-2">
                <div class="space-y-1">
                  <div class="w-full h-10 rounded-md" 
                    :style="{ backgroundColor: theme.colors.dark.primary['500'] }"></div>
                  <div class="text-xs text-center">Primary</div>
                </div>
                <div class="space-y-1">
                  <div class="w-full h-10 rounded-md" 
                    :style="{ backgroundColor: theme.colors.dark.secondary['500'] }"></div>
                  <div class="text-xs text-center">Secondary</div>
                </div>
                <div class="space-y-1">
                  <div class="w-full h-10 rounded-md" 
                    :style="{ backgroundColor: theme.colors.dark.tertiary['500'] }"></div>
                  <div class="text-xs text-center">Tertiary</div>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      
      <!-- Theme sections -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-medium">Theme Sections</div>
              <UButton
                color="primary"
                icon="i-heroicons-plus"
                size="sm"
                @click="navigateToSectionCreate"
              >
                Thêm Section
              </UButton>
            </div>
          </template>
          
          <!-- Empty state -->
          <template v-if="!theme.sections || theme.sections.length === 0">
            <div class="flex flex-col items-center justify-center py-16">
              <Layout class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có Section nào</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                Theme này chưa có section nào. Hãy thêm các section mới để xây dựng giao diện website.
              </p>
              <UButton color="primary" @click="navigateToSectionCreate">
                Thêm Section
              </UButton>
            </div>
          </template>
          
          <!-- Section list -->
          <template v-else>
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
              <li v-for="section in theme.sections" :key="section.id" class="py-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center mb-1">
                      <Layout class="w-5 h-5 mr-2 text-primary-500" />
                      <span class="font-medium text-gray-900 dark:text-white">{{ section.title }}</span>
                      <UBadge
                        :color="section.isActive ? 'green' : 'gray'"
                        variant="soft"
                        size="xs"
                        class="ml-2"
                      >
                        {{ section.isActive ? 'Hiển thị' : 'Ẩn' }}
                      </UBadge>
                      <UBadge
                        color="blue"
                        variant="soft"
                        size="xs"
                        class="ml-2"
                      >
                        {{ getPageTypeLabel(section.pageType) }}
                      </UBadge>
                    </div>
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div class="mr-4">
                        <span class="font-medium text-gray-700 dark:text-gray-300">Loại:</span>
                        {{ section.type }}
                      </div>
                      <div>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Thứ tự:</span>
                        {{ section.order }}
                      </div>
                    </div>
                  </div>
                  <div class="flex space-x-2 ml-4">
                    <UButton
                      color="gray"
                      variant="ghost"
                      icon="i-heroicons-pencil"
                      size="xs"
                      @click="() => {
                        const id = Number(route.params.id)
                        console.log(`Navigating to section edit page: theme=${id}, section=${section.id}`)
                        router.push(`/themes/${id}/sections/${section.id}`)
                      }"
                      class="hover:text-primary-600"
                      :aria-label="`Chỉnh sửa section ${section.title}`"
                    />
                  </div>
                </div>
              </li>
            </ul>
          </template>
          
          <template #footer>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ theme.sections?.length || 0 }} section
              </span>
              <UButton
                color="primary"
                @click="navigateToSections"
              >
                Quản lý tất cả Sections
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template> 