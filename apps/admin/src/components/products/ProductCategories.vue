<template>
  <div class="rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 px-6 py-4 bg-slate-50">
      <h3 class="text-lg font-medium flex items-center gap-2">
        <FolderTreeIcon class="h-5 w-5 text-slate-600" />
        Product Categories
      </h3>
      <p class="text-sm text-slate-500">Select categories for your product</p>
    </div>
    <div class="p-6">
      <div class="grid gap-6">
        <!-- Search Categories -->
        <div class="relative">
          <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search categories..."
            v-model="searchQuery"
            class="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <!-- Categories Tree -->
        <div class="flex-1 overflow-y-auto max-h-[400px] rounded-md border border-slate-100">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <LoadingIcon class="h-6 w-6 animate-spin text-primary" />
          </div>
          <div v-else-if="categories.length === 0" class="p-8 text-center">
            <FolderXIcon class="h-12 w-12 mx-auto text-slate-300 mb-2" />
            <p class="text-slate-500">No categories found</p>
            <p class="text-sm text-slate-400 mt-1">Try adjusting your search or create new categories</p>
          </div>
          <div v-else class="grid gap-1 py-2">
            <CategoryItem
              v-for="category in filteredCategories"
              :key="category.id"
              :category="category"
              :selected-ids="modelValue"
              @toggle="toggleCategory"
            />
          </div>
        </div>

        <!-- Selected Categories -->
        <div v-if="selectedCategories.length > 0" class="border-t border-slate-200 pt-4">
          <h4 class="text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircleIcon class="h-4 w-4 text-emerald-500" />
            Selected Categories <span class="text-xs bg-slate-100 rounded-full px-2 py-0.5 ml-1">{{ selectedCategories.length }}</span>
          </h4>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="category in selectedCategories"
              :key="category.id"
              class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm hover:bg-slate-200 transition-colors group"
            >
              <FolderIcon class="h-3.5 w-3.5 text-slate-500" />
              <span>{{ category.translations[0]?.name || 'Unnamed category' }}</span>
              <button
                type="button"
                @click="toggleCategory(category.id)"
                class="rounded-full p-0.5 hover:bg-slate-300 transition-colors ml-0.5 group-hover:text-rose-500"
              >
                <XIcon class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Loader2Icon as LoadingIcon, 
  SearchIcon, 
  XIcon, 
  FolderIcon, 
  FolderTreeIcon, 
  CheckCircleIcon,
  FolderXIcon
} from 'lucide-vue-next'
import { useTrpc } from '../../composables/useTrpc'
import CategoryItem from './CategoryItem.vue'

interface CategoryTranslation {
  id: number
  name: string
  description?: string
  locale: string
}

interface Category {
  id: number
  type: string
  active: boolean
  parentId?: number | null
  parent?: Category | null
  slug?: string
  translations: CategoryTranslation[]
  children?: Category[]
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const trpc = useTrpc()
const loading = ref(true)
const categories = ref<Category[]>([])
const searchQuery = ref('')

// Fetch categories
onMounted(async () => {
  try {
    loading.value = true
    console.log('Fetching product categories...')
    const response = await trpc.admin.category.getAllCategories.query({
      type: 'product'
    })
    console.log('API Response:', response)
    
    if (response && response.categories) {
      categories.value = buildCategoryTree(response.categories)
      console.log('Built category tree:', categories.value)
    } else {
      console.error('Invalid response format:', response)
      categories.value = []
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
})

// Build category tree from flat array
const buildCategoryTree = (flatCategories: any[]): Category[] => {
  console.log('Building category tree from:', flatCategories)
  
  const categoryMap = new Map<number, Category>()
  const tree: Category[] = []

  // First pass: create map of id to category
  flatCategories.forEach(category => {
    if (category) {
      categoryMap.set(category.id, { ...category, children: [] } as Category)
    }
  })

  // Second pass: build tree structure
  flatCategories.forEach(category => {
    if (!category) return
    
    const node = categoryMap.get(category.id)!
    if (!category.parentId) {
      tree.push(node)
    } else {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      } else {
        // If parent doesn't exist, add to root
        tree.push(node)
      }
    }
  })

  return tree
}

// Filter categories based on search query
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value

  const query = searchQuery.value.toLowerCase()
  return filterCategoriesByQuery(categories.value, query)
})

const filterCategoriesByQuery = (categories: Category[], query: string): Category[] => {
  return categories.filter(category => {
    const matchesQuery = category.translations.some(
      translation => translation.name.toLowerCase().includes(query)
    )
    const hasMatchingChildren = category.children?.length
      ? filterCategoriesByQuery(category.children, query).length > 0
      : false
    return matchesQuery || hasMatchingChildren
  }).map(category => ({
    ...category,
    children: category.children?.length
      ? filterCategoriesByQuery(category.children, query)
      : []
  }))
}

// Get flat list of selected categories
const selectedCategories = computed(() => {
  const selected: Category[] = []
  const findCategory = (categories: Category[], id: number): Category | undefined => {
    for (const category of categories) {
      if (category.id === id) return category
      if (category.children?.length) {
        const found = findCategory(category.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  props.modelValue.forEach(id => {
    const category = findCategory(categories.value, id)
    if (category) selected.push(category)
  })

  return selected
})

// Toggle category selection
const toggleCategory = (categoryId: number) => {
  const newValue = props.modelValue.includes(categoryId)
    ? props.modelValue.filter(id => id !== categoryId)
    : [...props.modelValue, categoryId]
  emit('update:modelValue', newValue)
}
</script> 