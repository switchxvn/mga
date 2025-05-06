<script setup lang="ts">
import { ref, onMounted, provide, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import { Palette, Layout, Plus, ArrowUp, ArrowDown, CheckCircle, XCircle } from 'lucide-vue-next'
import { PageType, Theme, ThemeSection } from '@ew/shared'
import PageHeader from '../../../../components/common/header/PageHeader.vue'

// Get route params
const route = useRoute()
const router = useRouter()
const themeId = computed(() => Number(route.params.id))

// Set page title
provide('pageTitle', 'Quản lý Theme Sections')

// State
const theme = ref<Theme | null>(null)
const sections = ref<ThemeSection[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedPageType = ref<string>('all')
const isReordering = ref(false)
const reorderSuccess = ref(false)

// Fetch theme and sections
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch theme info
    const themeData = await trpc.admin.theme.getTheme.query({ 
      id: themeId.value,
      withSections: true 
    })
    
    theme.value = {
      id: themeData.id,
      name: themeData.name,
      isActive: themeData.isActive
    }
    
    // Set sections
    if (themeData.sections) {
      sections.value = themeData.sections.sort((a, b) => a.order - b.order)
    }
  } catch (err: any) {
    console.error('Failed to fetch theme sections:', err)
    error.value = err.message || 'Không thể tải thông tin sections'
    
    UNotification.show({
      text: 'Không thể tải thông tin sections',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Filter sections by page type
const filteredSections = computed(() => {
  if (selectedPageType.value === 'all') {
    return sections.value
  }
  return sections.value.filter(section => section.pageType === selectedPageType.value)
})

// Get display page type
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

// Page type options for filter
const pageTypeOptions = computed(() => {
  const options = [
    { label: 'Tất cả', value: 'all' }
  ]
  
  // Add all page types from available sections
  const pageTypes = [...new Set(sections.value.map(s => s.pageType))]
  
  pageTypes.forEach(type => {
    options.push({
      label: getPageTypeLabel(type),
      value: type
    })
  })
  
  return options
})

// Navigate to create section
const navigateToCreate = () => {
  router.push(`/themes/${themeId.value}/sections/create`)
}

// Move section up or down
const moveSection = async (sectionId: number, direction: 'up' | 'down') => {
  const currentIndex = sections.value.findIndex(s => s.id === sectionId)
  if (currentIndex === -1) return
  
  // Can't move first item up or last item down
  if (
    (direction === 'up' && currentIndex === 0) || 
    (direction === 'down' && currentIndex === sections.value.length - 1)
  ) {
    return
  }
  
  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  
  // Get sections to swap
  const currentSection = sections.value[currentIndex]
  const swapSection = sections.value[swapIndex]
  
  isReordering.value = true
  
  try {
    // Update section orders
    await trpc.admin.theme.updateThemeSectionsOrder.mutate({
      updates: [
        { id: currentSection.id, order: swapSection.order },
        { id: swapSection.id, order: currentSection.order }
      ]
    })
    
    // Swap sections locally
    const newOrder = [...sections.value]
    newOrder[currentIndex] = { ...swapSection }
    newOrder[swapIndex] = { ...currentSection }
    sections.value = newOrder
    
    reorderSuccess.value = true
    setTimeout(() => {
      reorderSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to reorder sections:', error)
    UNotification.show({
      text: 'Không thể thay đổi thứ tự section',
      type: 'error'
    })
  } finally {
    isReordering.value = false
  }
}

// Toggle section active status
const toggleSectionActive = async (section: ThemeSection) => {
  try {
    await trpc.admin.theme.updateThemeSection.mutate({
      id: section.id,
      themeId: themeId.value,
      isActive: !section.isActive
    })
    
    // Update section locally
    const index = sections.value.findIndex(s => s.id === section.id)
    if (index !== -1) {
      sections.value[index] = { 
        ...sections.value[index], 
        isActive: !section.isActive 
      }
    }
    
    UNotification.show({
      text: `Section ${section.isActive ? 'đã bị ẩn' : 'đã được hiển thị'}`,
      type: 'success'
    })
  } catch (error) {
    console.error('Failed to toggle section status:', error)
    UNotification.show({
      text: 'Không thể thay đổi trạng thái section',
      type: 'error'
    })
  }
}

// Delete section
const deleteSection = async (sectionId: number) => {
  try {
    await trpc.admin.theme.deleteThemeSection.mutate({
      id: sectionId,
      themeId: themeId.value
    })
    
    // Remove section locally
    sections.value = sections.value.filter(s => s.id !== sectionId)
    
    UNotification.show({
      text: 'Xóa section thành công',
      type: 'success'
    })
  } catch (error) {
    console.error('Failed to delete section:', error)
    UNotification.show({
      text: 'Không thể xóa section',
      type: 'error'
    })
  }
}

// Load data on mount
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <PageHeader
      :title="theme ? `Sections: ${theme.name}` : 'Quản lý Theme Sections'"
      description="Quản lý các thành phần hiển thị của theme theo từng trang"
    >
      <template #actions>
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          @click="router.push(`/themes/${themeId}`)"
        >
          Quay lại
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="navigateToCreate"
        >
          Thêm Section mới
        </UButton>
      </template>
    </PageHeader>
    
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
      <UButton color="gray" variant="ghost" class="mt-2" @click="fetchData">
        Thử lại
      </UButton>
    </UCard>
    
    <!-- Filter -->
    <div v-else class="mb-6">
      <UCard>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex-1">
            <UFormGroup label="Lọc theo loại trang">
              <USelect
                v-model="selectedPageType"
                :options="pageTypeOptions"
                placeholder="Chọn loại trang"
              />
            </UFormGroup>
          </div>
          
          <!-- Reorder success message -->
          <div v-if="reorderSuccess" class="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle class="w-5 h-5 mr-2" />
            <span>Đã thay đổi thứ tự thành công</span>
          </div>
        </div>
      </UCard>
    </div>
    
    <!-- Sections list -->
    <div v-if="sections.length === 0 && !loading" class="py-20 text-center">
      <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <Layout class="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Không có Sections nào</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Theme này chưa có sections nào. Hãy thêm section đầu tiên để bắt đầu thiết kế giao diện.
      </p>
      <UButton color="primary" @click="navigateToCreate">
        Thêm Section mới
      </UButton>
    </div>
    
    <div v-else-if="filteredSections.length === 0 && !loading" class="py-20 text-center">
      <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <Layout class="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Không có Sections cho loại trang này</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Không tìm thấy sections nào cho loại trang đã chọn.
      </p>
      <UButton color="primary" @click="navigateToCreate">
        Thêm Section mới
      </UButton>
    </div>
    
    <div v-else-if="!loading" class="space-y-4">
      <UCard>
        <div class="overflow-x-auto">
          <table class="w-full text-left divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Thứ tự</th>
                <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Tiêu đề</th>
                <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Loại</th>
                <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Trang</th>
                <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</th>
                <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="section in filteredSections" :key="section.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="whitespace-nowrap px-4 py-4 text-sm font-medium">
                  <div class="flex items-center">
                    <span class="w-8 text-center">{{ section.order }}</span>
                    <div class="flex flex-col ml-2">
                      <UButton
                        color="gray"
                        variant="ghost"
                        :disabled="isReordering"
                        size="xs"
                        class="p-1"
                        @click="moveSection(section.id, 'up')"
                      >
                        <ArrowUp class="w-4 h-4" />
                      </UButton>
                      <UButton
                        color="gray"
                        variant="ghost"
                        :disabled="isReordering"
                        size="xs"
                        class="p-1"
                        @click="moveSection(section.id, 'down')"
                      >
                        <ArrowDown class="w-4 h-4" />
                      </UButton>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4">
                  <div class="flex items-center">
                    <Layout class="w-5 h-5 mr-2 text-primary-500" />
                    <span class="font-medium text-gray-900 dark:text-white">{{ section.title }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {{ section.type }}
                  <span v-if="section.componentName" class="text-xs text-gray-500 block">
                    {{ section.componentName }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                  <UBadge color="blue" variant="soft" size="sm">
                    {{ getPageTypeLabel(section.pageType) }}
                  </UBadge>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                  <UBadge
                    :color="section.isActive ? 'green' : 'gray'"
                    variant="soft"
                    size="sm"
                  >
                    {{ section.isActive ? 'Hiển thị' : 'Ẩn' }}
                  </UBadge>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-right text-sm">
                  <div class="flex justify-end space-x-2">
                    <UTooltip text="Sửa section">
                      <UButton
                        color="primary"
                        variant="ghost"
                        icon="i-heroicons-pencil"
                        size="xs"
                        @click="() => {
                          const id = Number(route.params.id)
                          console.log(`Navigating to edit section: theme=${id}, section=${section.id}`)
                          router.push(`/themes/${id}/sections/${section.id}`)
                        }"
                        class="hover:text-primary-600"
                      />
                    </UTooltip>
                    
                    <UTooltip :text="section.isActive ? 'Ẩn section' : 'Hiển thị section'">
                      <UButton
                        :color="section.isActive ? 'amber' : 'green'"
                        variant="ghost"
                        size="xs"
                        @click="toggleSectionActive(section)"
                      >
                        <template v-if="section.isActive">
                          <XCircle class="w-5 h-5" />
                        </template>
                        <template v-else>
                          <CheckCircle class="w-5 h-5" />
                        </template>
                      </UButton>
                    </UTooltip>
                    
                    <UPopover>
                      <UTooltip text="Xóa section">
                        <UButton
                          color="red"
                          variant="ghost"
                          icon="i-heroicons-trash"
                          size="xs"
                        />
                      </UTooltip>
                      
                      <template #panel>
                        <div class="p-4 max-w-sm">
                          <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Bạn có chắc chắn muốn xóa section "{{ section.title }}"?
                          </p>
                          <div class="flex justify-end space-x-2">
                            <UButton color="gray" variant="soft" size="sm" @click="() => {}">
                              Hủy
                            </UButton>
                            <UButton color="red" size="sm" @click="deleteSection(section.id)">
                              Xóa
                            </UButton>
                          </div>
                        </div>
                      </template>
                    </UPopover>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>
  </div>
</template> 