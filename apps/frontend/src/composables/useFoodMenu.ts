import { ref, computed } from 'vue'
import { useLocalization } from './useLocalization'
import { useTrpc } from './useTrpc'
import type { FoodCategory, FoodItem } from '@ew/shared'

export const useFoodMenu = () => {
  const { locale } = useLocalization()
  const trpc = useTrpc()

  // State
  const categories = ref<FoodCategory[]>([])
  const items = ref<FoodItem[]>([])
  const selectedCategory = ref<string | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Helper function to get translation by locale
  const getTranslation = (translations: any[] | undefined, fallback: any) => {
    if (!translations || !Array.isArray(translations) || translations.length === 0) return fallback
    const translation = translations.find(t => t?.languageCode === locale.value)
    return translation || translations.find(t => t?.languageCode === 'en') || fallback
  }

  // Computed properties for translated content
  const translatedCategories = computed(() => {
    return categories.value.map(category => ({
      ...category,
      name: getTranslation(category.translations, category)?.name || category.name,
      description: getTranslation(category.translations, category)?.description || category.description,
    }))
  })

  const translatedItems = computed(() => {
    return items.value.map(item => ({
      ...item,
      name: getTranslation(item.translations, item)?.name || item.name,
      description: getTranslation(item.translations, item)?.description || item.description,
      ingredients: getTranslation(item.translations, item)?.ingredients || item.ingredients,
      allergens: getTranslation(item.translations, item)?.allergens || item.allergens,
    }))
  })

  const filteredItems = computed(() => {
    if (!selectedCategory.value) return translatedItems.value
    return translatedItems.value.filter(item => item.categoryId === selectedCategory.value)
  })

  // Actions
  const fetchCategories = async () => {
    try {
      isLoading.value = true
      error.value = null
      categories.value = await trpc.foodMenu.getAllActiveCategories.query()
    } catch (e) {
      console.error('Error fetching food categories:', e)
      error.value = 'Failed to load food categories'
    } finally {
      isLoading.value = false
    }
  }

  const fetchItems = async () => {
    try {
      isLoading.value = true
      error.value = null
      items.value = await trpc.foodMenu.getAllActiveItems.query()
    } catch (e) {
      console.error('Error fetching food items:', e)
      error.value = 'Failed to load food items'
    } finally {
      isLoading.value = false
    }
  }

  const fetchItemsByCategory = async (categoryId: string) => {
    try {
      isLoading.value = true
      error.value = null
      items.value = await trpc.foodMenu.getActiveItemsByCategory.query(categoryId)
    } catch (e) {
      console.error('Error fetching food items by category:', e)
      error.value = 'Failed to load food items'
    } finally {
      isLoading.value = false
    }
  }

  const selectCategory = (categoryId: string | null) => {
    selectedCategory.value = categoryId
    if (categoryId) {
      fetchItemsByCategory(categoryId)
    } else {
      fetchItems()
    }
  }

  return {
    // State
    categories: translatedCategories,
    items: filteredItems,
    selectedCategory,
    isLoading,
    error,

    // Actions
    fetchCategories,
    fetchItems,
    fetchItemsByCategory,
    selectCategory,
  }
} 