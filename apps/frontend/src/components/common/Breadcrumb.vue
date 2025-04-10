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
        <li class="breadcrumb__separator" aria-hidden="true">
          <span class="breadcrumb__separator-icon">{{ separator }}</span>
        </li>
        
        <template v-for="(item, index) in items" :key="`${item.to}-${item.label}`">
          <li 
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
          
          <li v-if="index < items.length - 1" class="breadcrumb__separator" aria-hidden="true">
            <span class="breadcrumb__separator-icon">{{ separator }}</span>
          </li>
        </template>
      </template>
      
      <!-- Slot cho phép thêm các mục tùy chỉnh -->
      <slot></slot>
    </ol>
  </nav>
</template>
