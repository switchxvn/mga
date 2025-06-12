<script setup lang="ts">
import { ref, reactive, onMounted, provide, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '../../../composables/useTrpc'
import { useToast } from '../../../composables/useToast'
import { Palette, Layout, Plus, Layers, Settings, Trash, CheckCircle, XCircle } from 'lucide-vue-next'
import { PageType, ColorMode, Theme, ThemeSection } from '@ew/shared'
import PageHeader from '../../../components/common/header/PageHeader.vue'

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
const selectedSections = ref<number[]>([])
const isDeleting = ref(false)
const activeTab = ref<string>(route.query.tab as string || 'all')

// Watch active tab change and update URL
watch(activeTab, (newTab) => {
  // Update URL without refreshing the page
  router.replace({
    query: { 
      ...route.query,
      tab: newTab === 'all' ? undefined : newTab 
    }
  })
})

// Watch route query change to update active tab
watch(() => route.query.tab, (newTab) => {
  if (newTab !== activeTab.value) {
    activeTab.value = newTab as string || 'all'
  }
}, { immediate: true })

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
    
    // Reset selected sections
    selectedSections.value = []
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

// Get all unique page types
const getPageTypes = computed(() => {
  if (!theme.value || !theme.value.sections) return []
  
  const types = new Set<string>()
  types.add('all') // Add 'all' as default option
  
  theme.value.sections.forEach(section => {
    if (section.pageType) {
      types.add(section.pageType)
    }
  })
  
  return Array.from(types)
})

// Get tab items
const tabItems = computed(() => {
  return getPageTypes.value.map(type => ({
    id: type,
    label: type === 'all' ? 'Tất cả' : getPageTypeLabel(type),
    slot: type
  }))
})

// Get filtered sections
const filteredSections = computed(() => {
  if (!theme.value || !theme.value.sections) {
    return []
  }
  
  if (activeTab.value === 'all') {
    return [...theme.value.sections] // Return a copy to ensure reactivity
  }
  
  const filtered = theme.value.sections.filter(section => section.pageType === activeTab.value)
  return filtered
})

// Delete section
const deleteSection = async (sectionId: number) => {
  if (!theme.value) return
  
  isDeleting.value = true
  try {
    await trpc.admin.theme.deleteThemeSection.mutate({
      id: sectionId,
      themeId: themeId.value
    })
    
    // Remove section locally
    if (theme.value.sections) {
      theme.value.sections = theme.value.sections.filter(s => s.id !== sectionId)
    }
    
    // Remove from selected sections if present
    if (selectedSections.value.includes(sectionId)) {
      selectedSections.value = selectedSections.value.filter(id => id !== sectionId)
    }
    
    toast.success('Xóa section thành công')
  } catch (error) {
    console.error('Failed to delete section:', error)
    toast.error('Không thể xóa section')
  } finally {
    isDeleting.value = false
  }
}

// Toggle selection of a section
const toggleSelectSection = (sectionId: number) => {
  if (selectedSections.value.includes(sectionId)) {
    selectedSections.value = selectedSections.value.filter(id => id !== sectionId)
  } else {
    selectedSections.value.push(sectionId)
  }
}

// Select all sections (filtered by current tab)
const selectAllSections = () => {
  if (!filteredSections.value.length) return
  
  if (selectedSections.value.length === filteredSections.value.length) {
    // If all filtered sections are selected, deselect them
    const filteredIds = filteredSections.value.map(s => s.id)
    selectedSections.value = selectedSections.value.filter(id => !filteredIds.includes(id))
  } else {
    // Select all filtered sections
    const currentSelected = new Set(selectedSections.value)
    filteredSections.value.forEach(section => {
      if (!currentSelected.has(section.id)) {
        selectedSections.value.push(section.id)
      }
    })
  }
}

// Check if all sections in current tab are selected
const allSectionsSelected = computed(() => {
  if (!filteredSections.value.length) return false
  
  return filteredSections.value.every(section => 
    selectedSections.value.includes(section.id)
  )
})

// Delete multiple sections
const deleteSelectedSections = async () => {
  if (!theme.value || selectedSections.value.length === 0) return
  
  isDeleting.value = true
  const count = selectedSections.value.length
  
  try {
    // Delete each selected section
    for (const sectionId of selectedSections.value) {
      await trpc.admin.theme.deleteThemeSection.mutate({
        id: sectionId,
        themeId: themeId.value
      })
    }
    
    // Remove sections locally
    if (theme.value.sections) {
      theme.value.sections = theme.value.sections.filter(s => !selectedSections.value.includes(s.id))
    }
    
    // Clear selection
    selectedSections.value = []
    
    toast.success(`Đã xóa ${count} section thành công`)
  } catch (error) {
    console.error('Failed to delete sections:', error)
    toast.error('Không thể xóa các section đã chọn')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <PageHeader
      :title="theme ? theme.name : 'Chi tiết Theme'"
      description="Xem thông tin chi tiết và quản lý theme"
    >
      <template #actions>
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
      </template>
    </PageHeader>
    
    <!-- Status badge display -->
    <div v-if="theme && !loading" class="mb-6 flex items-center">
      <UBadge
        :color="theme.isActive ? 'green' : 'gray'"
        variant="soft"
        size="md"
        class="mr-2"
      >
        {{ theme.isActive ? 'Hoạt động' : 'Không hoạt động' }}
      </UBadge>
      <span class="text-sm text-gray-500">ID: {{ theme.id }}</span>
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
              <div class="flex items-center gap-2">
                <UButton
                  v-if="selectedSections.length > 0"
                  color="red"
                  variant="soft"
                  size="sm"
                  :loading="isDeleting"
                  :disabled="isDeleting"
                  @click="deleteSelectedSections"
                >
                  <Trash class="w-4 h-4 mr-1" />
                  Xóa {{ selectedSections.length }} section
                </UButton>
                <UButton
                  color="primary"
                  icon="i-heroicons-plus"
                  size="sm"
                  @click="navigateToSectionCreate"
                >
                  Thêm Section
                </UButton>
              </div>
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
          
          <!-- Section list with tabs -->
          <template v-else>
            <div>
           
              <!-- Tab buttons -->
              <div class="mb-4 flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  v-for="type in getPageTypes"
                  :key="type"
                  class="flex-1 py-2 px-4 text-center"
                  :class="activeTab === type ? 'bg-primary-50 text-primary-600 font-medium' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'"
                  @click="activeTab = type"
                >
                  {{ type === 'all' ? 'Tất cả' : getPageTypeLabel(type) }}
                </button>
              </div>
              
              <!-- Simple direct display of filtered sections -->
              <UCard class="mb-4">
                <template #header>
                  <div class="flex justify-between items-center">
                    <div>
                      {{ activeTab === 'all' ? 'Tất cả sections' : `Sections cho ${getPageTypeLabel(activeTab)}` }}
                      ({{ filteredSections.length }})
                    </div>
                    <div v-if="selectedSections.length > 0" class="flex items-center gap-2">
                      <span class="text-sm">Đã chọn: {{ selectedSections.length }}</span>
                      <UButton
                        color="red"
                        variant="soft"
                        size="sm"
                        @click="deleteSelectedSections"
                      >
                        <Trash class="w-4 h-4 mr-1" />
                        Xóa
                      </UButton>
                    </div>
                  </div>
                </template>
                
                <!-- Empty state -->
                <div v-if="filteredSections.length === 0" class="py-8 text-center">
                  <p class="text-gray-500">Không có section nào được tìm thấy.</p>
                </div>
                
                <!-- Direct display of sections -->
                <div v-else>
                  <div class="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
                    <UCheckbox 
                      :model-value="allSectionsSelected" 
                      @change="selectAllSections"
                    >
                      <span class="ml-2 text-sm">Chọn tất cả</span>
                    </UCheckbox>
                  </div>
                  
                  <table class="w-full">
                    <tbody>
                      <tr 
                        v-for="section in filteredSections" 
                        :key="section.id"
                        class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td class="py-3 px-4 w-10">
                          <UCheckbox 
                            :model-value="selectedSections.includes(section.id)" 
                            @change="toggleSelectSection(section.id)"
                          />
                        </td>
                        <td class="py-3 px-4">
                          <div class="flex items-center">
                            <Layout class="w-5 h-5 mr-2 text-primary-500" />
                            <div>
                              <div class="font-medium">{{ section.title }}</div>
                              <div class="text-sm text-gray-500">
                                {{ section.type }} 
                                <span v-if="activeTab === 'all'" class="ml-2">
                                  • {{ getPageTypeLabel(section.pageType) }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="py-3 px-4 w-24 text-center">
                          <UBadge
                            :color="section.isActive ? 'green' : 'gray'"
                            variant="soft"
                          >
                            {{ section.isActive ? 'Hiển thị' : 'Ẩn' }}
                          </UBadge>
                        </td>
                        <td class="py-3 px-4 w-24 text-center">
                          <div class="text-sm">Thứ tự: {{ section.order }}</div>
                        </td>
                        <td class="py-3 px-4 w-20 text-right">
                          <div class="flex justify-end space-x-2">
                            <UButton
                              color="gray"
                              variant="ghost"
                              icon="i-heroicons-pencil"
                              size="xs"
                              @click="router.push(`/themes/${themeId}/sections/${section.id}`)"
                            />
                            <UButton
                              color="red"
                              variant="soft"
                              size="xs"
                              @click="deleteSection(section.id)"
                            >
                              <Trash class="w-4 h-4" />
                            </UButton>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </UCard>
            </div>
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