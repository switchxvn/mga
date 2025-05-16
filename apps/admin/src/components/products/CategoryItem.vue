<template>
  <div class="grid gap-2">
    <!-- Category Item -->
    <div
      class="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-50 transition-colors"
      :class="{
        'ml-8': !!category.parentId
      }"
    >
      <!-- Expand/Collapse Button -->
      <button
        v-if="hasChildren"
        type="button"
        @click="expanded = !expanded"
        class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-200"
      >
        <ChevronRightIcon
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-90': expanded }"
        />
      </button>
      <div v-else class="w-6 flex items-center justify-center">
        <FolderIcon class="h-4 w-4 text-slate-400" />
      </div>

      <!-- Checkbox -->
      <div class="flex items-center">
        <input
          type="checkbox"
          :id="'category-' + category.id"
          :checked="isSelected"
          @change="$emit('toggle', category.id)"
          class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        />
      </div>

      <!-- Category Name -->
      <label
        :for="'category-' + category.id"
        class="flex-1 cursor-pointer text-sm font-medium"
      >
        {{ category.translations[0]?.name || t('products.categories.unnamedCategory') }}
        
        <span v-if="!category.active" class="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
          {{ t('products.categories.draft') }}
        </span>
      </label>
    </div>

    <!-- Children -->
    <div v-if="hasChildren && expanded" class="grid gap-1 pl-2 ml-4 border-l-2 border-slate-100">
      <CategoryItem
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :selected-ids="selectedIds"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRightIcon, FolderIcon } from 'lucide-vue-next'
import { useLocalization } from '@/composables/useLocalization'

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
  createdAt?: string
  updatedAt?: string
}

const props = defineProps<{
  category: Category
  selectedIds: number[]
}>()

defineEmits<{
  toggle: [categoryId: number]
}>()

const { t } = useLocalization()

const expanded = ref(false)

const hasChildren = computed(() => {
  return props.category.children && props.category.children.length > 0
})

const isSelected = computed(() => {
  return props.selectedIds.includes(props.category.id)
})
</script> 