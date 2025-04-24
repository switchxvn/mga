<script setup lang="ts">
import { ref, provide } from 'vue'
import { useToast } from '@/composables/useToast'
import Swal from 'sweetalert2'
import { 
  PlusCircleIcon,
  PencilIcon,
  Trash2Icon,
  ListChecksIcon
} from 'lucide-vue-next'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { TransitionRoot } from '@headlessui/vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import PageHeader from '../../components/ui/PageHeader.vue'
import SearchFilter from '../../components/categories/SearchFilter.vue'
import PaginationComponent from '../../components/ui/Pagination.vue'

provide('pageTitle', ref('Categories'))

const trpc = useTrpc()

interface CategoryResponse {
  id: number
  type: string
  active: boolean
  translations: Array<{
    name: string
    locale: string
  }>
  createdAt: string
  updatedAt: string
}

interface Category {
  id: number
  name: string
  type: string
  active: boolean
  createdAt: string
  updatedAt: string
}

const isLoading = ref(false)
const error = ref<string | null>(null)
const categories = ref<Category[]>([])
const totalItems = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const statusFilter = ref<string>('all')
const selectedCategories = ref<number[]>([])
const sortBy = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const columns = [
  {
    key: 'id',
    label: 'ID',
    sortable: true
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true
  },
  {
    key: 'active',
    label: 'Status',
    sortable: true
  },
  {
    key: 'createdAt',
    label: 'Created At',
    sortable: true
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false
  }
]

const fetchCategories = async () => {
  try {
    isLoading.value = true
    const result = await trpc.admin.category.getAllCategories.query({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      active: statusFilter.value === 'active' ? true : statusFilter.value === 'inactive' ? false : null,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    
    // Map the categories to match the interface
    categories.value = result.categories.map((category: CategoryResponse) => ({
      id: category.id,
      name: category.translations?.[0]?.name || '',
      type: category.type,
      active: category.active,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))
    totalItems.value = result.total
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch categories'
    console.error('Error fetching categories:', err)
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchCategories()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchCategories()
}

const handleDelete = async (id: number) => {
  const result = await Swal.fire({
    title: 'Delete Category',
    text: 'Are you sure you want to delete this category? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#DC2626',
  });

  if (result.isConfirmed) {
    try {
      await trpc.admin.category.deleteCategory.mutate(id)
      
      Swal.fire({
        title: 'Success!',
        text: 'Category deleted successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      fetchCategories()
    } catch (err: any) {
      console.error('Error deleting category:', err)
      
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to delete category',
        icon: 'error'
      });
    }
  }
}

const handleStatusFilter = (status: string) => {
  statusFilter.value = status
  currentPage.value = 1
  fetchCategories()
}

const toggleSelectAll = () => {
  if (selectedCategories.value.length === categories.value.length) {
    selectedCategories.value = []
  } else {
    selectedCategories.value = categories.value.map(cat => cat.id)
  }
}

const toggleCategorySelection = (categoryId: number) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index === -1) {
    selectedCategories.value.push(categoryId)
  } else {
    selectedCategories.value.splice(index, 1)
  }
}

const handleBulkAction = async (action: string) => {
  const selectedCount = selectedCategories.value.length
  if (!selectedCount) return

  let confirmConfig: any = {
    icon: 'question' as const,
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    title: '',
    text: '',
    confirmButtonColor: ''
  }

  switch (action) {
    case 'activate':
      confirmConfig = {
        ...confirmConfig,
        title: 'Activate Selected Categories?',
        text: `Are you sure you want to activate ${selectedCount} selected categories?`,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Yes, activate them'
      }
      break
    case 'deactivate':
      confirmConfig = {
        ...confirmConfig,
        title: 'Deactivate Selected Categories?',
        text: `Are you sure you want to deactivate ${selectedCount} selected categories?`,
        confirmButtonColor: '#6B7280',
        confirmButtonText: 'Yes, deactivate them'
      }
      break
    case 'delete':
      confirmConfig = {
        ...confirmConfig,
        title: 'Delete Selected Categories?',
        text: `Are you sure you want to permanently delete ${selectedCount} selected categories? This action cannot be undone.`,
        confirmButtonColor: '#DC2626',
        confirmButtonText: 'Yes, delete them',
        icon: 'warning' as const
      }
      break
  }

  const result = await Swal.fire(confirmConfig)
  if (!result.isConfirmed) return

  try {
    isLoading.value = true

    switch (action) {
      case 'activate':
      case 'deactivate':
        await Promise.all(
          selectedCategories.value.map(categoryId => 
            trpc.admin.category.updateCategory.mutate({
              id: categoryId,
              data: {
                active: action === 'activate'
              }
            })
          )
        )
        break
      case 'delete':
        await Promise.all(
          selectedCategories.value.map(categoryId => 
            trpc.admin.category.deleteCategory.mutate(categoryId)
          )
        )
        break
    }

    await fetchCategories()
    selectedCategories.value = []

    Swal.fire({
      title: 'Success!',
      text: `Successfully performed ${action} on ${selectedCount} categories`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (err: any) {
    const errorMessage = err.message || `Failed to ${action} categories`
    error.value = errorMessage
    console.error(`Error performing ${action} on categories:`, err)
    
    Swal.fire({
      title: 'Error!',
      text: errorMessage,
      icon: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  fetchCategories()
}

// Initial fetch
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Categories Management"
      description="Manage and organize your categories efficiently"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Menu as="div" class="relative" v-if="selectedCategories.length">
            <MenuButton class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              <ListChecksIcon class="h-4 w-4" />
              Bulk Actions ({{ selectedCategories.length }})
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
                    <PlusCircleIcon class="h-4 w-4" :class="active ? 'text-emerald-700' : 'text-gray-500'" />
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
                    <XMarkIcon class="h-4 w-4" :class="active ? 'text-slate-700' : 'text-gray-500'" />
                    Deactivate Selected
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

          <NuxtLink
            to="/categories/create"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusCircleIcon class="h-4 w-4" />
            Create Category
          </NuxtLink>
        </div>
      </template>
    </PageHeader>

    <!-- Search and Filter -->
    <SearchFilter
      v-model:search="searchQuery"
      v-model:status-filter="statusFilter"
      v-model:page-size="itemsPerPage"
      search-placeholder="Search categories..."
      @search="handleSearch"
    />

    <!-- Enhanced Error Alert -->
    <TransitionRoot as="template" :show="!!error">
      <div class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <XMarkIcon class="h-5 w-5 text-red-400" />
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

    <!-- Enhanced Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg p-6">
      <div class="animate-pulse space-y-4">
        <div v-for="i in 5" :key="i" class="flex space-x-4">
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Categories Table -->
    <div v-else class="bg-white dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  class="checkbox rounded"
                  :checked="selectedCategories.length === categories.length"
                  :indeterminate="selectedCategories.length > 0 && selectedCategories.length < categories.length"
                  @change="toggleSelectAll"
                />
              </th>
              <th 
                v-for="column in columns" 
                :key="column.key"
                scope="col" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-600"
                @click="column.sortable && handleSort(column.key)"
              >
                <div class="flex items-center gap-2">
                  {{ column.label }}
                  <template v-if="column.sortable">
                    <ChevronDownIcon v-if="sortBy !== column.key" class="h-4 w-4" />
                    <ChevronUpIcon v-else-if="sortOrder === 'asc'" class="h-4 w-4" />
                    <ChevronDownIcon v-else class="h-4 w-4" />
                  </template>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr 
              v-for="category in categories" 
              :key="category.id"
              class="hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors duration-150 ease-in-out"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  class="checkbox rounded"
                  :checked="selectedCategories.includes(category.id)"
                  @change="toggleCategorySelection(category.id)"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ category.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ category.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ category.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': category.active,
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': !category.active
                  }"
                >
                  {{ category.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(category.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <NuxtLink
                    :to="`/categories/edit/${category.id}`"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Edit category"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </NuxtLink>
                  <button
                    @click="handleDelete(category.id)"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Delete category"
                  >
                    <Trash2Icon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <PaginationComponent
        :current-page="currentPage"
        :total-pages="Math.ceil(totalItems / itemsPerPage)"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.checkbox:indeterminate {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3 8h10'/%3e%3c/svg%3e");
}
</style> 