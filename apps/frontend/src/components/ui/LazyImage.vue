<template>
  <div class="lazy-image-container relative" :style="width || height ? { width, height } : {}">
    <!-- Skeleton loader -->
    <div 
      v-if="isLoading && !hasError" 
      class="absolute inset-0 bg-gray-200 animate-pulse dark:bg-gray-700"
    ></div>
    
    <!-- Fallback image (shown when error occurs) -->
    <img
      v-if="hasError"
      :src="fallbackSrc"
      :alt="alt"
      class="w-full h-full object-cover"
      :class="[customClass]"
      @error="handleFallbackError"
    />
    
    <!-- Main image (hidden when error occurs) -->
    <img
      v-else
      ref="imgRef"
      :data-src="src"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover transition-opacity duration-300"
      :class="{ 'opacity-0': isLoading, 'opacity-100': !isLoading, [customClass]: !!customClass }"
      @error="handleError"
      @load="handleLoad"
    />
  </div>
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    fallbackSrc: {
      type: String,
      default: '/images/default-image.jpg'
    },
    customClass: {
      type: String,
      default: ''
    },
    width: {
      type: [String, Number],
      default: null
    },
    height: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      isLoading: true,
      hasError: false
    }
  },
  mounted() {
    this.setupLazyLoading();
    console.log('LazyImage mounted:', {
      src: this.src,
      fallbackSrc: this.fallbackSrc
    });
  },
  methods: {
    handleError() {
      console.error('Image failed to load:', this.src);
      this.hasError = true;
      this.isLoading = false;
    },
    handleFallbackError() {
      console.error('Fallback image failed to load:', this.fallbackSrc);
      this.isLoading = false;
    },
    handleLoad() {
      console.log('Image loaded successfully:', this.src);
      this.isLoading = false;
    },
    setupLazyLoading() {
      if (this.hasError) return;
      
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && this.$refs.imgRef && !this.hasError) {
              const img = this.$refs.imgRef;
              if (img.dataset.src) {
                img.src = img.dataset.src;
              }
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '50px',
          threshold: 0.1
        });
        
        if (this.$refs.imgRef) {
          observer.observe(this.$refs.imgRef);
        }
      } else {
        if (this.$refs.imgRef && !this.hasError) {
          const img = this.$refs.imgRef;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.lazy-image-container {
  overflow: hidden;
  position: relative;
  min-height: 100px;
}
</style> 