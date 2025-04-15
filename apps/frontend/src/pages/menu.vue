<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useLocalization } from '../composables/useLocalization'
import { useFoodMenu } from '../composables/useFoodMenu'
import { Menu } from 'lucide-vue-next'
import FoodMenuItem from '../../components/menu/FoodMenuItem.vue'

const { t, locale } = useLocalization()
const {
  categories,
  items,
  selectedCategory,
  isLoading,
  error,
  fetchCategories,
  fetchItems,
  selectCategory,
} = useFoodMenu()

// Initial data fetch
onMounted(() => {
  fetchCategories()
  fetchItems()
})

// Watch for locale changes and refetch data
watch(locale, () => {
  fetchCategories()
  fetchItems()
})
</script>

<template>
  <div class="food-menu">
    <div class="food-menu__container">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="food-menu__title">
          {{ t('menu.title') }}
        </h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="food-menu__loading">
        <div class="food-menu__loading-spinner"></div>
        <p class="food-menu__loading-text">{{ t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="food-menu__error">
        {{ error }}
      </div>

      <template v-else>
        <!-- Categories -->
        <div class="food-menu__categories" v-if="categories.length > 1">
          <button
            class="food-menu__category-btn"
            :class="{ 'food-menu__category-btn--active': !selectedCategory }"
            @click="selectCategory(null)"
          >
            {{ t('menu.all') }}
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            class="food-menu__category-btn"
            :class="{ 'food-menu__category-btn--active': selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Menu Items Grid -->
        <div v-if="items.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FoodMenuItem
            v-for="item in items"
            :key="item.id"
            :imageUrl="item.image?.url || '/images/default-food.jpg'"
            :name="item.name"
            :price="item.price || 0"
          />
        </div>

        <!-- No Items State -->
        <div v-else class="text-center py-12 text-gray-300">
          {{ t('menu.noItems') }}
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
@import '@/assets/styles/components/food-menu';
</style> 