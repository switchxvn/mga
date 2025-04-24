<template>
  <section class="grid gap-6 p-6 bg-white shadow-sm rounded-lg border border-slate-200">
    <div class="border-b border-slate-200 pb-6">
      <h3 class="text-lg font-medium text-slate-900 flex items-center gap-2">
        <FolderIcon class="w-5 h-5" />
        Categories
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
              :checked="selectedCategories.includes(category.id)"
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
          No news categories available
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FolderIcon } from 'lucide-vue-next'
import { useTrpc } from '../../composables/useTrpc'

interface Category {
  id: number
  translations: Array<{
    locale: string
    name: string
  }>
}

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const trpc = useTrpc()
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedCategories = ref<number[]>(props.modelValue || [])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  selectedCategories.value = newValue || []
})

const fetchCategories = async () => {
  try {
    loading.value = true
    error.value = null
    categories.value = await trpc.admin.posts.getNewsCategories.query()
  } catch (err) {
    error.value = 'Failed to load categories'
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}

const toggleCategory = (categoryId: number) => {
  const index = selectedCategories.value.indexOf(categoryId)
  if (index === -1) {
    selectedCategories.value.push(categoryId)
  } else {
    selectedCategories.value.splice(index, 1)
  }
  emit('update:modelValue', selectedCategories.value)
}

const getCategoryName = (category: Category) => {
  // Get translation in current locale or fall back to first available translation
  const currentLocale = 'vi' // You might want to make this dynamic based on your app's locale
  const translation = category.translations.find(t => t.locale === currentLocale) || category.translations[0]
  return translation?.name || 'Unnamed Category'
}

onMounted(() => {
  fetchCategories()
})
</script> 