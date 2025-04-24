<script setup lang="ts">
import { computed } from 'vue';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  variant?: 'default' | 'transparent' | 'minimal';
  showHomeIcon?: boolean;
  separator?: string;
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  variant: 'default',
  showHomeIcon: true,
  separator: '/'
});

// Đổi tên component để tuân thủ quy tắc đặt tên multi-word
defineOptions({
  name: 'AppBreadcrumb'
});

// Tính toán class dựa trên variant
const breadcrumbClass = computed(() => {
  return {
    'breadcrumb': true,
    'breadcrumb--default': props.variant === 'default',
    'breadcrumb--transparent': props.variant === 'transparent',
    'breadcrumb--minimal': props.variant === 'minimal'
  };
});
</script>

<template>
  <nav aria-label="Breadcrumb" :class="breadcrumbClass">
    <ol class="breadcrumb__list flex items-center flex-wrap gap-2">
      <li class="breadcrumb__item">
        <NuxtLink to="/" class="breadcrumb__link breadcrumb__link--home inline-flex items-center text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
          <svg 
            v-if="showHomeIcon"
            xmlns="http://www.w3.org/2000/svg" 
            class="breadcrumb__home-icon h-6 w-6" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="breadcrumb__home-text ml-1">Trang chủ</span>
        </NuxtLink>
      </li>
      
      <template v-if="items && items.length">
        <li class="breadcrumb__separator" aria-hidden="true">
          <span class="breadcrumb__separator-icon text-gray-400 dark:text-gray-600 mx-2">{{ separator }}</span>
        </li>
        
        <template v-for="(item, index) in items" :key="index">
          <li 
            class="breadcrumb__item"
            :class="{ 'breadcrumb__item--active': index === items.length - 1 }"
          >
            <template v-if="index === items.length - 1 || !item.to">
              <span class="breadcrumb__text text-primary-700 dark:text-primary-300 font-semibold">{{ item.label }}</span>
            </template>
            <template v-else>
              <NuxtLink :to="item.to" class="breadcrumb__link text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
                {{ item.label }}
              </NuxtLink>
            </template>
          </li>
          
          <li v-if="index < items.length - 1" class="breadcrumb__separator" aria-hidden="true">
            <span class="breadcrumb__separator-icon text-gray-400 dark:text-gray-600 mx-2">{{ separator }}</span>
          </li>
        </template>
      </template>
      
      <slot></slot>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  @apply w-full;
}

.breadcrumb--default {
  @apply bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700;
}

.breadcrumb--transparent {
  @apply bg-transparent p-0;
}

.breadcrumb--minimal {
  @apply bg-transparent p-0;
}

.breadcrumb__list {
  @apply list-none p-0 m-0 text-base;
}

.breadcrumb__item {
  @apply inline-flex items-center text-base;
}

.breadcrumb__item--active {
  @apply font-medium text-base;
}

.breadcrumb__link {
  @apply no-underline hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base;
}

.breadcrumb__home-icon {
  @apply flex-shrink-0 h-6 w-6;
}

.breadcrumb__separator-icon {
  @apply text-gray-400 dark:text-gray-600 text-base;
}

.breadcrumb__text {
  @apply text-primary-700 dark:text-primary-300 font-semibold text-base;
}

.breadcrumb__link--home {
  @apply text-gray-600 dark:text-gray-400 text-base;
}

.breadcrumb__home-text {
  @apply text-base;
}
</style>
