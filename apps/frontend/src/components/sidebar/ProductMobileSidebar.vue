<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import ProductSidebar from './ProductSidebar.vue';
import { SlidersHorizontal, X } from 'lucide-vue-next';

const { t } = useLocalization();

const props = defineProps<{
  initialFilters?: any;
}>();

const emit = defineEmits<{
  (e: 'filter-change', filters: any): void;
}>();

const isOpen = ref(false);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  
  // Prevent scrolling when sidebar is open
  if (isOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Handle filter changes
const handleFilterChange = (filters) => {
  emit('filter-change', filters);
};

// Close sidebar when clicking outside
const handleClickOutside = (event) => {
  const sidebar = document.getElementById('mobile-sidebar');
  if (sidebar && !sidebar.contains(event.target) && isOpen.value) {
    toggleSidebar();
  }
};

// Add event listener for outside clicks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// Remove event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="product-mobile-sidebar lg:hidden">
    <!-- Toggle Button -->
    <UButton
      @click.stop="toggleSidebar"
      variant="soft"
      color="primary"
      class="mb-4 w-full"
    >
      <template #leading>
        <SlidersHorizontal class="h-4 w-4" />
      </template>
      {{ t('products.filters') }}
    </UButton>
    
    <!-- Sidebar Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black bg-opacity-50"
        aria-hidden="true"
      ></div>
    </Transition>
    
    <!-- Sidebar -->
    <Transition name="slide">
      <div
        v-if="isOpen"
        id="mobile-sidebar"
        class="fixed bottom-0 left-0 right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white p-0 dark:bg-gray-900 sm:max-w-sm"
        @click.stop
      >
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <SlidersHorizontal class="h-5 w-5 text-primary-500" />
            {{ t('products.filters') }}
          </h2>
          <UButton
            @click="toggleSidebar"
            variant="ghost"
            color="gray"
            class="p-1"
          >
            <X class="h-5 w-5" />
          </UButton>
        </div>
        
        <div class="pb-20">
          <ProductSidebar
            :initial-filters="initialFilters"
            @filter-change="handleFilterChange"
          />
        </div>
        
        <!-- Apply button at bottom -->
        <div class="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <UButton
            @click="toggleSidebar"
            variant="solid"
            color="primary"
            block
          >
            {{ t('products.applyFilters') }}
          </UButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>