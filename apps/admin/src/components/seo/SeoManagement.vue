<template>
  <div class="space-y-6">
    <!-- Header with Stats and Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ seoStats?.total || 0 }}</div>
            <div class="text-sm text-gray-500">Total</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ seoStats?.active || 0 }}</div>
            <div class="text-sm text-gray-500">Active</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ seoStats?.inactive || 0 }}</div>
            <div class="text-sm text-gray-500">Inactive</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ seoStats?.withoutTitle || 0 }}</div>
            <div class="text-sm text-gray-500">No Title</div>
          </div>
        </div>
      </div>
      
      <UButton 
        @click="showCreateModal = true"
        color="green"
        icon="i-lucide-plus"
      >
        Add SEO Page
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex items-center space-x-4">
      <div class="flex-1">
        <UInput
          v-model="searchQuery"
          placeholder="Search pages..."
          icon="i-lucide-search"
          @input="debouncedSearch"
        />
      </div>
      
      <USelect
        v-model="activeFilter"
        :options="[
          { value: undefined, label: 'All Pages' },
          { value: true, label: 'Active Only' },
          { value: false, label: 'Inactive Only' }
        ]"
        option-attribute="label"
        value-attribute="value"
        @update:model-value="loadSeoEntries"
      />
      
      <USelect
        v-model="sortBy"
        :options="[
          { value: 'createdAt', label: 'Created Date' },
          { value: 'updatedAt', label: 'Updated Date' },
          { value: 'pagePath', label: 'Page Path' },
          { value: 'title', label: 'Title' }
        ]"
        option-attribute="label"
        value-attribute="value"
        @update:model-value="loadSeoEntries"
      />
      
      <UButton 
        @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; loadSeoEntries()"
        variant="outline"
        :icon="sortOrder === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
      >
        {{ sortOrder.toUpperCase() }}
      </UButton>
    </div>

    <!-- Error Alert -->
    <UAlert 
      v-if="error" 
      color="red" 
      variant="soft" 
      :title="'Error'"
      :description="error"
      :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
      @close="clearError"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-purple-600 mr-2" />
      <span class="text-gray-600 dark:text-gray-400">Loading SEO entries...</span>
    </div>

    <!-- SEO Entries Table -->
    <div v-else-if="seoEntries.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Page Path
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Updated
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="entry in seoEntries" :key="entry.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ entry.pagePath }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                  {{ entry.title || 'No title' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                  {{ entry.description || 'No description' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge 
                  :color="entry.isActive ? 'green' : 'red'"
                  variant="soft"
                >
                  {{ entry.isActive ? 'Active' : 'Inactive' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(entry.updatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <UButton 
                    size="xs"
                    color="blue"
                    variant="soft"
                    icon="i-lucide-edit"
                    @click="editSeoEntry(entry)"
                  >
                    Edit
                  </UButton>
                  
                  <UButton 
                    size="xs"
                    :color="entry.isActive ? 'orange' : 'green'"
                    variant="soft"
                    :icon="entry.isActive ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    @click="toggleSeoStatus(entry)"
                  >
                    {{ entry.isActive ? 'Disable' : 'Enable' }}
                  </UButton>
                  
                  <UButton 
                    size="xs"
                    color="red"
                    variant="soft"
                    icon="i-lucide-trash-2"
                    @click="deleteSeoEntry(entry.id)"
                  >
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalEntries) }} of {{ totalEntries }} entries
          </div>
          
          <div class="flex items-center space-x-2">
            <UButton 
              size="xs"
              variant="outline"
              :disabled="currentPage <= 1"
              @click="changePage(currentPage - 1)"
            >
              Previous
            </UButton>
            
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <UButton 
              size="xs"
              variant="outline"
              :disabled="currentPage >= totalPages"
              @click="changePage(currentPage + 1)"
            >
              Next
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Search class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No SEO entries found
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Get started by creating your first SEO page configuration.
      </p>
      <UButton 
        @click="showCreateModal = true"
        color="green"
        icon="i-lucide-plus"
      >
        Create SEO Page
      </UButton>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingEntry ? 'Edit SEO Entry' : 'Create SEO Entry' }}
          </h3>
        </template>

        <form @submit.prevent="saveSeoEntry" class="space-y-4">
          <UFormGroup label="Page Path" required>
            <UInput
              v-model="formData.pagePath"
              placeholder="/about, /products/[slug], etc."
              required
              :disabled="!!editingEntry"
            />
            <template #help>
              <span class="text-xs text-gray-500">The URL path this SEO configuration applies to</span>
            </template>
          </UFormGroup>

          <UFormGroup label="Title">
            <UInput
              v-model="formData.title"
              placeholder="Page title for search engines"
            />
            <template #help>
              <span class="text-xs text-gray-500">Recommended: 50-60 characters</span>
            </template>
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="formData.description"
              placeholder="Page description for search engines"
              :rows="3"
            />
            <template #help>
              <span class="text-xs text-gray-500">Recommended: 150-160 characters</span>
            </template>
          </UFormGroup>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Open Graph Title">
              <UInput
                v-model="formData.ogTitle"
                placeholder="Title for social media sharing"
              />
            </UFormGroup>

            <UFormGroup label="Open Graph Image">
              <UInput
                v-model="formData.ogImage"
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Open Graph Description">
            <UTextarea
              v-model="formData.ogDescription"
              placeholder="Description for social media sharing"
              :rows="2"
            />
          </UFormGroup>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormGroup label="Keywords">
              <UInput
                v-model="formData.keywords"
                placeholder="keyword1, keyword2, keyword3"
              />
            </UFormGroup>

            <UFormGroup label="Canonical URL">
              <UInput
                v-model="formData.canonicalUrl"
                placeholder="https://example.com/canonical-url"
                type="url"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Robots.txt">
            <UTextarea
              v-model="formData.robotsTxt"
              placeholder="index, follow"
              :rows="2"
            />
          </UFormGroup>

          <UFormGroup>
            <UCheckbox
              v-model="formData.isActive"
              label="Active (visible to search engines)"
            />
          </UFormGroup>
        </form>

        <template #footer>
          <div class="flex justify-end space-x-2">
            <UButton 
              variant="outline" 
              @click="closeModal"
            >
              Cancel
            </UButton>
            <UButton 
              color="green"
              :loading="isLoading"
              @click="saveSeoEntry"
            >
              {{ editingEntry ? 'Update' : 'Create' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search } from 'lucide-vue-next'
import { useAdminSeo } from '@/composables/useAdminSeo'
import { debounce } from 'lodash-es'

const {
  isLoading,
  error,
  seoEntries,
  seoStats,
  totalEntries,
  clearError,
  getSeoEntries,
  createSeo,
  updateSeo,
  deleteSeo,
  getSeoStats,
} = useAdminSeo()

// Local state
const showCreateModal = ref(false)
const editingEntry = ref(null)
const searchQuery = ref('')
const activeFilter = ref(undefined)
const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const currentPage = ref(1)
const pageSize = ref(10)

// Form data
const formData = ref({
  pagePath: '',
  title: '',
  description: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  keywords: '',
  canonicalUrl: '',
  robotsTxt: '',
  isActive: true,
})

// Computed
const totalPages = computed(() => Math.ceil(totalEntries.value / pageSize.value))

// Methods
const loadSeoEntries = async () => {
  await getSeoEntries({
    page: currentPage.value,
    limit: pageSize.value,
    search: searchQuery.value || undefined,
    isActive: activeFilter.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  })
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadSeoEntries()
}, 300)

const changePage = (page: number) => {
  currentPage.value = page
  loadSeoEntries()
}

const editSeoEntry = (entry: any) => {
  editingEntry.value = entry
  formData.value = {
    pagePath: entry.pagePath,
    title: entry.title || '',
    description: entry.description || '',
    ogTitle: entry.ogTitle || '',
    ogDescription: entry.ogDescription || '',
    ogImage: entry.ogImage || '',
    keywords: entry.keywords || '',
    canonicalUrl: entry.canonicalUrl || '',
    robotsTxt: entry.robotsTxt || '',
    isActive: entry.isActive,
  }
  showCreateModal.value = true
}

const saveSeoEntry = async () => {
  try {
    if (editingEntry.value) {
      await updateSeo(editingEntry.value.id, formData.value)
    } else {
      await createSeo(formData.value)
    }
    
    closeModal()
    await loadSeoEntries()
    await getSeoStats()
  } catch (error) {
    console.error('Error saving SEO entry:', error)
  }
}

const toggleSeoStatus = async (entry: any) => {
  try {
    await updateSeo(entry.id, { isActive: !entry.isActive })
    await loadSeoEntries()
    await getSeoStats()
  } catch (error) {
    console.error('Error toggling SEO status:', error)
  }
}

const deleteSeoEntry = async (id: number) => {
  if (confirm('Are you sure you want to delete this SEO entry?')) {
    try {
      await deleteSeo(id)
      await loadSeoEntries()
      await getSeoStats()
    } catch (error) {
      console.error('Error deleting SEO entry:', error)
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingEntry.value = null
  formData.value = {
    pagePath: '',
    title: '',
    description: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    keywords: '',
    canonicalUrl: '',
    robotsTxt: '',
    isActive: true,
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    loadSeoEntries(),
    getSeoStats(),
  ])
})
</script> 