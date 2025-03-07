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
    />
    
    <!-- Main image (hidden when error occurs) -->
    <img
      v-else
      ref="imgRef"
      data-src=""
      src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
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
  },
  methods: {
    handleError() {
      // Đánh dấu là đã có lỗi và không cố gắng tải lại ảnh
      this.hasError = true;
      this.isLoading = false;
      console.log('Image error, loading fallback:', this.fallbackSrc);
    },
    handleLoad() {
      this.isLoading = false;
    },
    setupLazyLoading() {
      // Nếu đã có lỗi, không cần thiết lập lazy loading
      if (this.hasError) return;
      
      // Kiểm tra nếu trình duyệt hỗ trợ Intersection Observer
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && this.$refs.imgRef && !this.hasError) {
              // Khi phần tử hiển thị trong viewport, tải ảnh
              this.$refs.imgRef.src = this.src;
              // Ngừng theo dõi phần tử này
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '50px', // Tải trước khi phần tử cách viewport 50px
          threshold: 0.1 // Khi 10% phần tử hiển thị
        });
        
        if (this.$refs.imgRef) {
          observer.observe(this.$refs.imgRef);
        }
      } else {
        // Fallback cho trình duyệt không hỗ trợ Intersection Observer
        if (this.$refs.imgRef && !this.hasError) {
          this.$refs.imgRef.src = this.src;
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
}
</style> 