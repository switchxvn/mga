<template>
  <div class="rounded-lg border border-slate-200 bg-white">
    <div class="border-b border-slate-200 px-6 py-4">
      <h3 class="text-lg font-medium">Product Categories</h3>
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
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <LoadingIcon class="h-6 w-6 animate-spin" />
          </div>
          <div v-else class="grid gap-2 p-4">
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
          <h4 class="text-sm font-medium mb-2">Selected Categories:</h4>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="category in selectedCategories"
              :key="category.id"
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm"
            >
              <span>{{ category.name }}</span>
              <button
                type="button"
                @click="toggleCategory(category.id)"
                class="rounded-full p-0.5 hover:bg-slate-200 transition-colors"
              >
                <XIcon class="w-3 h-3" />
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
import { LoadingIcon, SearchIcon, XIcon } from 'lucide-vue-next'
import { useTrpc } from '../../../composables/useTrpc'
import CategoryItem from './CategoryItem.vue'

interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  children?: Category[]
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
    const response = await trpc.admin.categories.getCategories.query()
    categories.value = buildCategoryTree(response)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  } finally {
    loading.value = false
  }
})

// Build category tree from flat array
const buildCategoryTree = (flatCategories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category>()
  const tree: Category[] = []

  // First pass: create map of id to category
  flatCategories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Second pass: build tree structure
  flatCategories.forEach(category => {
    const node = categoryMap.get(category.id)!
    if (category.parentId === null) {
      tree.push(node)
    } else {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
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
    const matchesQuery = category.name.toLowerCase().includes(query)
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