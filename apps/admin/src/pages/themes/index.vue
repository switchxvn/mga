<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { PlusCircle, Edit, Trash2, Eye, Check, X, Palette } from 'lucide-vue-next'
import { useTrpc } from '../../composables/useTrpc'
import { useToast } from '../../composables/useToast'
import { Theme } from '@ew/shared'
import PageHeader from '../../components/common/header/PageHeader.vue'

// Set page title
provide('pageTitle', 'Quản lý Theme')

// Data types
interface ThemeWithCount extends Theme {
  sectionsCount?: number
}

const themes = ref<ThemeWithCount[]>([])
const loading = ref(true)
const router = useRouter()
const trpc = useTrpc()
const toast = useToast()
const isConfirmingDelete = ref<number | null>(null)
const searchQuery = ref('')
const totalThemes = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Fetch themes
const fetchThemes = async () => {
  loading.value = true
  
  try {
    // Gọi endpoint trpc để lấy danh sách theme
    const response = await trpc.admin.theme.getAll.query()
    
    themes.value = response
    totalThemes.value = response.length
  } catch (error) {
    console.error('Failed to fetch themes:', error)
    toast.error('Không thể tải danh sách theme')
  } finally {
    loading.value = false
  }
}

// Delete a theme
const deleteTheme = async (id: number) => {
  try {
    await trpc.admin.theme.delete.mutate(id)
    await fetchThemes()
    toast.success('Xóa theme thành công')
  } catch (error) {
    console.error('Failed to delete theme:', error)
    toast.error('Không thể xóa theme')
  } finally {
    isConfirmingDelete.value = null
  }
}

// Toggle theme active status
const toggleThemeActive = async (theme: ThemeWithCount) => {
  try {
    await trpc.admin.theme.update.mutate({
      id: theme.id,
      data: {
        isActive: !theme.isActive
      }
    })
    
    // Refresh the list
    await fetchThemes()
    
    toast.success(`Theme ${theme.isActive ? 'deactivated' : 'activated'} successfully`)
  } catch (error) {
    console.error('Failed to toggle theme status:', error)
    toast.error('Could not update theme status')
  }
}

// Load data on component mount
onMounted(() => {
  fetchThemes()
})

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchThemes()
}

// Handle pagination
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchThemes()
}

const navigateToTheme = (themeId: number) => {
  router.push(`/themes/${themeId}`)
}

const navigateToCreate = () => {
  router.push('/themes/create')
}

const onCancelDelete = () => {
  isConfirmingDelete.value = null
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div>
    <PageHeader 
      title="Quản lý Theme"
      description="Quản lý các giao diện và bố cục cho website của bạn"
    >
      <template #actions>
        <UInput
          v-model="searchQuery"
          placeholder="Tìm kiếm theme..."
          icon="i-heroicons-magnifying-glass-20-solid"
          @keyup.enter="handleSearch"
          class="md:w-64"
        />
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="navigateToCreate"
        >
          Thêm Theme mới
        </UButton>
      </template>
    </PageHeader>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <ULoading class="w-8 h-8 text-primary-500" />
      <span class="ml-2 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
    </div>

    <!-- Empty state -->
    <UCard v-else-if="themes.length === 0" class="flex flex-col items-center justify-center py-16">
      <Palette class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Không có Theme nào</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        Bạn chưa tạo Theme nào. Hãy tạo Theme đầu tiên để bắt đầu tùy chỉnh giao diện website.
      </p>
      <UButton color="primary" @click="navigateToCreate">
        Thêm Theme mới
      </UButton>
    </UCard>

    <!-- Data table -->
    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-left divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">ID</th>
              <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Tên</th>
              <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Số section</th>
              <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</th>
              <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo</th>
              <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400">Ngày cập nhật</th>
              <th scope="col" class="px-4 py-3.5 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="theme in themes" :key="theme.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ theme.id }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <div class="flex items-center">
                  <Palette class="w-5 h-5 mr-2 text-primary-500" />
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ theme.name }}</span>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ theme.sectionsCount || 0 }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm">
                <UBadge
                  :color="theme.isActive ? 'green' : 'gray'"
                  variant="soft"
                  size="sm"
                >
                  {{ theme.isActive ? 'Hoạt động' : 'Không hoạt động' }}
                </UBadge>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(theme.createdAt) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ formatDate(theme.updatedAt) }}
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-right text-sm">
                <div class="flex justify-end space-x-2">
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-eye"
                    size="xs"
                    @click="navigateToTheme(theme.id)"
                    class="hover:text-primary-600"
                    :aria-label="`Xem theme ${theme.name}`"
                  />
                  <UButton
                    :color="theme.isActive ? 'red' : 'green'"
                    variant="ghost"
                    :icon="theme.isActive ? 'i-heroicons-x-mark' : 'i-heroicons-check'"
                    size="xs"
                    @click="toggleThemeActive(theme)"
                    :aria-label="`${theme.isActive ? 'Tắt' : 'Bật'} theme ${theme.name}`"
                  />
                  <UButton
                    v-if="isConfirmingDelete !== theme.id"
                    color="red"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    size="xs"
                    @click="isConfirmingDelete = theme.id"
                    :aria-label="`Xóa theme ${theme.name}`"
                  />
                  <div v-else class="flex space-x-1">
                    <UButton
                      color="red"
                      size="xs"
                      @click="deleteTheme(theme.id)"
                      aria-label="Xác nhận xóa"
                    >
                      Xóa
                    </UButton>
                    <UButton
                      color="gray"
                      variant="ghost"
                      size="xs"
                      @click="onCancelDelete"
                      aria-label="Hủy xóa"
                    >
                      Hủy
                    </UButton>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          Hiển thị <span class="font-medium mx-1">{{ themes.length }}</span> 
          trên <span class="font-medium mx-1">{{ totalThemes }}</span> theme
        </div>
        <UPagination
          v-model="currentPage"
          :total="totalThemes"
          :page-count="5"
          :per-page="itemsPerPage"
          @change="handlePageChange"
        />
      </div>
    </UCard>
  </div>
</template> 