<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const isDarkMode = ref(false);

// Kiểm tra chế độ dark/light từ localStorage hoặc prefers-color-scheme
onMounted(() => {
  // Kiểm tra localStorage trước
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
  } else {
    // Nếu không có trong localStorage, kiểm tra prefers-color-scheme
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  // Áp dụng chế độ dark/light
  applyTheme();
});

// Theo dõi thay đổi của isDarkMode để cập nhật theme
watch(isDarkMode, () => {
  applyTheme();
});

// Áp dụng chế độ dark/light
function applyTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

// Chuyển đổi chế độ dark/light
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
}
</script>

<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle"
    :title="isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'"
    aria-label="Toggle theme"
  >
    <!-- Sun icon (light mode) -->
    <svg 
      v-if="!isDarkMode" 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-5 w-5" 
      viewBox="0 0 20 20" 
      fill="currentColor"
    >
      <path 
        fill-rule="evenodd" 
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
        clip-rule="evenodd" 
      />
    </svg>
    
    <!-- Moon icon (dark mode) -->
    <svg 
      v-else 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-5 w-5" 
      viewBox="0 0 20 20" 
      fill="currentColor"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  @apply p-2 rounded-full transition-colors;
  
  /* Light mode */
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  
  /* Dark mode */
  .dark & {
    @apply bg-gray-700 text-gray-200 hover:bg-gray-600;
  }
}
</style> 