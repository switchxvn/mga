import { ref } from 'vue'

interface SeoEntry {
  id: number
  title: string | null
  description: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  keywords: string | null
  canonicalUrl: string | null
  pagePath: string
  robotsTxt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SeoListResponse {
  data: SeoEntry[]
  total: number
  page: number
  limit: number
}

interface SeoStats {
  total: number
  active: number
  inactive: number
  withoutTitle: number
  withoutDescription: number
}

interface CreateSeoInput {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  keywords?: string
  canonicalUrl?: string
  pagePath: string
  robotsTxt?: string
  isActive?: boolean
}

interface UpdateSeoInput {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  keywords?: string
  canonicalUrl?: string
  pagePath?: string
  robotsTxt?: string
  isActive?: boolean
}

export const useAdminSeo = () => {
  const { $trpc } = useNuxtApp()
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const seoEntries = ref<SeoEntry[]>([])
  const currentSeo = ref<SeoEntry | null>(null)
  const seoStats = ref<SeoStats | null>(null)
  const totalEntries = ref(0)

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Get all SEO entries with pagination and filters
  const getSeoEntries = async (filters: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.getAll.query(filters)
      seoEntries.value = result.data
      totalEntries.value = result.total
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch SEO entries'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get SEO entry by ID
  const getSeoById = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.getById.query(id)
      currentSeo.value = result
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch SEO entry'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get SEO entry by page path
  const getSeoByPath = async (pagePath: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.getByPath.query(pagePath)
      currentSeo.value = result
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch SEO entry'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create new SEO entry
  const createSeo = async (data: CreateSeoInput) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.create.mutate(data)
      
      // Refresh the list if we have entries loaded
      if (seoEntries.value.length > 0) {
        await getSeoEntries()
      }
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to create SEO entry'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update SEO entry
  const updateSeo = async (id: number, data: UpdateSeoInput) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.update.mutate({ id, data })
      
      // Update current entry if it's the one being updated
      if (currentSeo.value?.id === id) {
        currentSeo.value = result
      }
      
      // Update entry in the list
      const index = seoEntries.value.findIndex(entry => entry.id === id)
      if (index !== -1) {
        seoEntries.value[index] = result
      }
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to update SEO entry'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Delete SEO entry
  const deleteSeo = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.delete.mutate(id)
      
      // Remove from list
      seoEntries.value = seoEntries.value.filter(entry => entry.id !== id)
      totalEntries.value = Math.max(0, totalEntries.value - 1)
      
      // Clear current if it was deleted
      if (currentSeo.value?.id === id) {
        currentSeo.value = null
      }
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to delete SEO entry'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Bulk update SEO entries
  const bulkUpdateSeo = async (ids: number[], data: { isActive?: boolean }) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.bulkUpdate.mutate({ ids, data })
      
      // Update entries in the list
      seoEntries.value = seoEntries.value.map(entry => 
        ids.includes(entry.id) ? { ...entry, ...data } : entry
      )
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to bulk update SEO entries'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get SEO statistics
  const getSeoStats = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await $trpc.admin.seo.getStats.query()
      seoStats.value = result
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch SEO statistics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    seoEntries: readonly(seoEntries),
    currentSeo: readonly(currentSeo),
    seoStats: readonly(seoStats),
    totalEntries: readonly(totalEntries),
    
    // Actions
    clearError,
    getSeoEntries,
    getSeoById,
    getSeoByPath,
    createSeo,
    updateSeo,
    deleteSeo,
    bulkUpdateSeo,
    getSeoStats,
  }
} 