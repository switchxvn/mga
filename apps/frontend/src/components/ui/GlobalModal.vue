<template>
  <Teleport to="body">
    <div v-if="show" class="global-modal-wrapper">
      <div class="global-modal-overlay" @click="$emit('close')"></div>
      <div class="global-modal-container">
        <div class="global-modal-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  show: boolean
}>();

const emit = defineEmits<{
  (e: 'close'): void
}>();

// Handle ESC key
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    emit('close');
  }
};

// Add/remove event listener based on show prop
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscKey);
  } else {
    document.removeEventListener('keydown', handleEscKey);
  }
});

// Clean up event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
});
</script>

<style scoped>
.global-modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999999;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(2px);
}

.global-modal-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 2rem;
  z-index: 99999999;
}

.global-modal-content {
  position: relative;
  width: 100%;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* Dark mode support */
:root.dark .global-modal-content {
  background: #1f2937;
}

/* Prevent body scroll when modal is open */
:global(body.modal-open) {
  overflow: hidden;
}
</style> 