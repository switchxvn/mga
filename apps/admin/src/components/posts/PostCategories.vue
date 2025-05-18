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
              :checked="isSelected(category.id)"
              @change="toggleCategory(category.id)"
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
import { ref, onMounted, watch } from 'vue'
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

const categories = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Thay đổi cách kiểm tra categories đã chọn để tránh vòng lặp với v-model
const isSelected = (categoryId: number) => {
  return props.modelValue.includes(categoryId)
}

// Thay đổi cách cập nhật danh sách categories đã chọn
const toggleCategory = (categoryId: number) => {
  const newSelected = [...props.modelValue]
  const index = newSelected.indexOf(categoryId)
  
  if (index === -1) {
    newSelected.push(categoryId)
  } else {
    newSelected.splice(index, 1)
  }
  
  emit('update:modelValue', newSelected)
}

// Định nghĩa hàm fetchCategories trước khi sử dụng nó trong watch
const fetchCategories = async (locale: string = props.selectedLanguage || 'en') => {
  if (!locale) return
  
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

// Watching selectedLanguage changes to reload categories with the new locale
let previousLocale = ''
watch(() => props.selectedLanguage, (newLocale) => {
  if (newLocale && newLocale !== previousLocale) {
    previousLocale = newLocale
    fetchCategories(newLocale)
  }
}, { immediate: true })

// Tải categories ban đầu nếu cần thiết
onMounted(() => {
  if (!categories.value.length && !loading.value) {
    fetchCategories()
  }
})
</script> 