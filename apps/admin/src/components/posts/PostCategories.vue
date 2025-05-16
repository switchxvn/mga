<template>
  <section class="grid gap-6 p-6 bg-white shadow-sm rounded-lg border border-slate-200">
    <div class="border-b border-slate-200 pb-6">
      <h3 class="text-lg font-medium text-slate-900 flex items-center gap-2">
        <FolderIcon class="w-5 h-5" />
        {{ t('posts.tabs.categories') }}
      </h3>
    </div>
    
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary border-r-transparent"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-500 text-sm">
        {{ error }}
      </div>

      <!-- Categories List -->
      <div v-else class="space-y-2">
        <div v-for="category in categories" :key="category.id" class="flex items-start">
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              :value="category.id"
              v-model="localSelectedCategories"
              class="form-checkbox h-4 w-4 text-primary border-slate-300 rounded"
            />
            <span class="text-sm font-medium text-slate-700">
              {{ getCategoryName(category) }}
            </span>
          </label>
        </div>

        <!-- No Categories Message -->
        <p v-if="categories.length === 0" class="text-sm text-slate-500">
          {{ t('posts.noCategories') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, watchEffect } from 'vue'
import { FolderIcon } from 'lucide-vue-next'
import { useLocalization } from '@/composables/useLocalization'
import { useCategory } from '@/composables/useCategory'

const { t } = useLocalization()
const { loading: categoryLoading, fetchNewsCategoriesByLocale } = useCategory()

interface Category {
  id: number
  parent?: Category | null
  type?: string
  active?: boolean
  icon?: string
  translations: Array<{
    locale: string
    name: string
  }>
  createdAt?: string
  updatedAt?: string
  children?: Category[]
}

const props = defineProps<{
  modelValue: number[]
  selectedLanguage?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Sử dụng biến cục bộ để theo dõi danh sách categories đã chọn
const localSelectedCategories = ref<number[]>([])

// Cập nhật localSelectedCategories khi modelValue thay đổi
watchEffect(() => {
  if (props.modelValue && Array.isArray(props.modelValue)) {
    localSelectedCategories.value = [...props.modelValue]
  }
})

// Emit sự kiện khi localSelectedCategories thay đổi
watch(localSelectedCategories, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// Watching selectedLanguage changes to reload categories with the new locale
watch(() => props.selectedLanguage, (newLocale) => {
  if (newLocale) {
    fetchCategories(newLocale)
  }
})

const fetchCategories = async (locale: string = props.selectedLanguage || 'en') => {
  try {
    loading.value = true
    error.value = null
    categories.value = await fetchNewsCategoriesByLocale(locale)
  } catch (err) {
    error.value = 'Failed to load categories'
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}

const getCategoryName = (category: Category) => {
  // Get translation in current locale or fall back to first available translation
  const locale = props.selectedLanguage || 'en'
  const translation = category.translations.find(t => t.locale === locale) || category.translations[0]
  return translation?.name || 'Unnamed Category'
}

onMounted(() => {
  fetchCategories()
})
</script> 