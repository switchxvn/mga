<template>
  <div class="grid gap-2">
    <!-- Category Item -->
    <div
      class="flex items-center gap-2"
      :class="{
        'ml-6': !!category.parentId
      }"
    >
      <!-- Expand/Collapse Button -->
      <button
        v-if="hasChildren"
        type="button"
        @click="expanded = !expanded"
        class="flex h-4 w-4 items-center justify-center rounded hover:bg-slate-100"
      >
        <ChevronRightIcon
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-90': expanded }"
        />
      </button>
      <div v-else class="w-4"></div>

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
        class="flex-1 cursor-pointer text-sm"
      >
        {{ category.name }}
      </label>
    </div>

    <!-- Children -->
    <div v-if="hasChildren && expanded" class="grid gap-2">
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
import { ChevronRightIcon } from 'lucide-vue-next'

interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  children?: Category[]
}

const props = defineProps<{
  category: Category
  selectedIds: number[]
}>()

defineEmits<{
  toggle: [categoryId: number]
}>()

const expanded = ref(false)

const hasChildren = computed(() => {
  return props.category.children && props.category.children.length > 0
})

const isSelected = computed(() => {
  return props.selectedIds.includes(props.category.id)
})
</script> 