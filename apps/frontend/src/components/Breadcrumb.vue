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
    <ol class="breadcrumb__list">
      <li class="breadcrumb__item">
        <NuxtLink to="/" class="breadcrumb__link breadcrumb__link--home">
          <svg 
            v-if="showHomeIcon"
            xmlns="http://www.w3.org/2000/svg" 
            class="breadcrumb__home-icon" 
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
          <span class="breadcrumb__home-text">Trang chủ</span>
        </NuxtLink>
      </li>
      
      <template v-if="items && items.length">
        <li 
          v-for="(item, index) in items" 
          :key="index"
          class="breadcrumb__item"
          :class="{ 'breadcrumb__item--active': index === items.length - 1 }"
        >
          <template v-if="index === items.length - 1 || !item.to">
            <span class="breadcrumb__text">{{ item.label }}</span>
          </template>
          <template v-else>
            <NuxtLink :to="item.to" class="breadcrumb__link">
              {{ item.label }}
            </NuxtLink>
          </template>
        </li>
      </template>
      
      <!-- Slot cho phép thêm các mục tùy chỉnh -->
      <slot></slot>
    </ol>
  </nav>
</template>

<style scoped>
/* Định nghĩa biến CSS cho light mode và dark mode */
:root {
  --breadcrumb-bg-color: #f9fafb;
  --breadcrumb-text-color: #4b5563;
  --breadcrumb-text-hover: #1d4ed8;
  --breadcrumb-separator-color: #9ca3af;
  --breadcrumb-active-color: #111827;
  --breadcrumb-inactive-color: #6b7280;
  --breadcrumb-border-color: #e5e7eb;
}

/* Dark mode variables */
.dark, :root.dark {
  --breadcrumb-bg-color: #1f2937;
  --breadcrumb-text-color: #d1d5db;
  --breadcrumb-text-hover: #60a5fa;
  --breadcrumb-separator-color: #6b7280;
  --breadcrumb-active-color: #f3f4f6;
  --breadcrumb-inactive-color: #9ca3af;
  --breadcrumb-border-color: #374151;
}

.breadcrumb {
  margin-bottom: 1.5rem;
}

/* Variant: default */
.breadcrumb--default {
  background-color: var(--breadcrumb-bg-color);
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid var(--breadcrumb-border-color);
}

/* Variant: transparent */
.breadcrumb--transparent {
  background-color: transparent;
  padding: 0.5rem 0;
}

/* Variant: minimal */
.breadcrumb--minimal {
  background-color: transparent;
  padding: 0;
  margin-bottom: 1rem;
}

.breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
}

.breadcrumb__item {
  display: flex;
  align-items: center;
}

.breadcrumb__item:not(:last-child)::after {
  content: v-bind('`${props.separator}`');
  margin: 0 0.5rem;
  color: var(--breadcrumb-separator-color);
}

.breadcrumb__link {
  color: var(--breadcrumb-text-color);
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 500;
}

.breadcrumb__link:hover {
  color: var(--breadcrumb-text-hover);
  text-decoration: underline;
}

.breadcrumb__link--home {
  display: flex;
  align-items: center;
}

.breadcrumb__home-icon {
  margin-right: 0.25rem;
}

.breadcrumb__text {
  color: var(--breadcrumb-inactive-color);
  font-weight: 500;
}

.breadcrumb__item--active .breadcrumb__text {
  color: var(--breadcrumb-active-color);
  font-weight: 600;
}

@media (max-width: 640px) {
  .breadcrumb--default {
    padding: 0.5rem 0.75rem;
  }
  
  .breadcrumb__list {
    font-size: 0.875rem;
  }
  
  .breadcrumb__home-text {
    display: none;
  }
  
  .breadcrumb__home-icon {
    margin-right: 0;
  }
}

/* Hỗ trợ cho các framework CSS phổ biến */
/* Tailwind dark mode */
:global(.dark) .breadcrumb--default {
  background-color: var(--breadcrumb-bg-color);
  border-color: var(--breadcrumb-border-color);
}

:global(.dark) .breadcrumb__link {
  color: var(--breadcrumb-text-color);
}

:global(.dark) .breadcrumb__link:hover {
  color: var(--breadcrumb-text-hover);
}

:global(.dark) .breadcrumb__text {
  color: var(--breadcrumb-inactive-color);
}

:global(.dark) .breadcrumb__item--active .breadcrumb__text {
  color: var(--breadcrumb-active-color);
}

:global(.dark) .breadcrumb__item:not(:last-child)::after {
  color: var(--breadcrumb-separator-color);
}
</style> 