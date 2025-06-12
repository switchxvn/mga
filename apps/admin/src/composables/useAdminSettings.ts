import { ref, reactive, computed, readonly } from 'vue'
import { useTrpc } from './useTrpc'
import type { Settings, CreateSettingInput, UpdateSettingInput } from '@ew/shared'

export const useAdminSettings = () => {
  const trpc = useTrpc()
  
  // State management
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const settings = ref<Settings[]>([])
  const currentSetting = ref<Settings | null>(null)
  
  // Filter state
  const filterState = reactive({
    group: '',
    search: '',
    isPublic: null as boolean | null,
  })
  
  // Computed for filtered settings
  const filteredSettings = computed(() => {
    let filtered = settings.value
    
    if (filterState.group) {
      filtered = filtered.filter(setting => setting.group === filterState.group)
    }
    
    if (filterState.search) {
      const search = filterState.search.toLowerCase()
      filtered = filtered.filter(setting => 
        setting.key.toLowerCase().includes(search) ||
        setting.description?.toLowerCase().includes(search) ||
        setting.value.toLowerCase().includes(search)
      )
    }
    
    if (filterState.isPublic !== null) {
      filtered = filtered.filter(setting => setting.is_public === filterState.isPublic)
    }
    
    return filtered
  })
  
  // Get all available groups
  const availableGroups = computed(() => {
    const groups = new Set<string>()
    settings.value.forEach(setting => {
      if (setting.group) {
        groups.add(setting.group)
      }
    })
    return Array.from(groups).sort()
  })
  
  /**
   * Fetch all settings from the backend
   */
  const fetchAllSettings = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await trpc.settings.getAllSettings.query()
      settings.value = result || []
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch settings'
      console.error('Error fetching settings:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Get setting by key
   */
  const getSettingByKey = async (key: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await trpc.settings.getSettingByKey.query(key)
      currentSetting.value = result
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch setting'
      console.error('Error fetching setting by key:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Get settings by group
   */
  const getSettingsByGroup = async (group: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await trpc.settings.getSettingsByGroup.query(group)
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch settings by group'
      console.error('Error fetching settings by group:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Create a new setting
   */
  const createSetting = async (input: CreateSettingInput) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await trpc.settings.createSetting.mutate(input)
      
      // Add to local state
      settings.value.push(result)
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to create setting'
      console.error('Error creating setting:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Update a setting by ID
   */
  const updateSetting = async (input: UpdateSettingInput) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await trpc.settings.updateSetting.mutate(input)
      
      // Update local state
      const index = settings.value.findIndex(s => s.id === input.id)
      if (index !== -1) {
        settings.value[index] = result
      }
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to update setting'
      console.error('Error updating setting:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Update a setting by key (quick value update)
   */
  const updateSettingByKey = async (key: string, value: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await trpc.settings.updateSettingByKey.mutate({ key, value })
      
      // Update local state
      const index = settings.value.findIndex(s => s.key === key)
      if (index !== -1) {
        settings.value[index] = result
      }
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to update setting'
      console.error('Error updating setting by key:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Delete a setting
   */
  const deleteSetting = async (id: number) => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await trpc.settings.deleteSetting.mutate(id)
      
      // Remove from local state
      settings.value = settings.value.filter(s => s.id !== id)
      
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to delete setting'
      console.error('Error deleting setting:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }
  
  /**
   * Reset filter state
   */
  const resetFilters = () => {
    filterState.group = ''
    filterState.search = ''
    filterState.isPublic = null
  }
  
  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    settings: readonly(settings),
    currentSetting: readonly(currentSetting),
    filterState,
    filteredSettings,
    availableGroups,
    
    // Methods
    fetchAllSettings,
    getSettingByKey,
    getSettingsByGroup,
    createSetting,
    updateSetting,
    updateSettingByKey,
    deleteSetting,
    clearError,
    resetFilters,
  }
} 