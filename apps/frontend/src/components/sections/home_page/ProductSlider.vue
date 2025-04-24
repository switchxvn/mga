<template>
  <section 
    class="product-slider-section py-8"
    v-if="isMounted"
  >
    <!-- ... existing code ... -->
  </section>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';

const isMounted = ref(true);

// Thêm cleanup
onBeforeUnmount(() => {
  isMounted.value = false;
  if (swiperInstance.value) {
    try {
      swiperInstance.value.destroy(true, true);
      swiperInstance.value = undefined;
    } catch (error) {
      console.error('Error destroying swiper:', error);
    }
  }
});
</script> 