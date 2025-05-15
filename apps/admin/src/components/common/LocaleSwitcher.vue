<script setup lang="ts">
import { useLocalization } from '@/composables/useLocalization';
import { ref, onMounted } from 'vue';

const { currentLocale, availableLocales, setLocale, initLocale } = useLocalization();
const isOpen = ref(false);

// Khởi tạo ngôn ngữ từ localStorage khi component được mount
onMounted(() => {
  initLocale();
});

// Đóng dropdown khi click ra ngoài
const closeDropdown = () => {
  isOpen.value = false;
};

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Chọn ngôn ngữ
const selectLocale = (code: 'en' | 'vi') => {
  setLocale(code);
  isOpen.value = false;
};
</script>

<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Change language"
    >
      <img 
        :src="currentLocale.flag" 
        :alt="currentLocale.name" 
        class="w-5 h-5 rounded-sm object-cover"
      />
      <span class="text-sm hidden sm:inline">{{ currentLocale.code.toUpperCase() }}</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 min-w-[120px] z-50"
    >
      <button
        v-for="locale in availableLocales"
        :key="locale.code"
        @click="selectLocale(locale.code)"
        class="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="{ 'bg-gray-50 dark:bg-gray-700': locale.code === currentLocale.code }"
      >
        <img 
          :src="locale.flag" 
          :alt="locale.name" 
          class="w-5 h-5 rounded-sm object-cover mr-2"
        />
        <span>{{ locale.name }}</span>
      </button>
    </div>

    <!-- Overlay to capture clicks outside -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template> 