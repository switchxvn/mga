<template>
  <div class="loading-container" :class="size">
    <div class="loading-content">
      <svg
        class="loading-icon"
        viewBox="0 0 24 24"
        :style="{ width: computedSize, height: computedSize }"
      >
        <circle
          class="loading-circle"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke-width="2.5"
        />
      </svg>
      <div class="loading-text">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
});

const sizes = {
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem'
};

const computedSize = computed(() => sizes[props.size]);
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  animation: fade-in 0.3s ease-in forwards;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.loading-icon {
  animation: rotate 1.4s linear infinite;
}

.loading-circle {
  stroke: rgb(var(--primary-500));
  stroke-dasharray: 80px, 200px;
  stroke-dashoffset: 0;
  animation: dash 1.4s ease-in-out infinite;
}

.loading-text {
  opacity: 0;
  animation: fade-in 0.3s ease-in forwards;
  animation-delay: 0.1s;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }
  100% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -125px;
  }
}
</style> 