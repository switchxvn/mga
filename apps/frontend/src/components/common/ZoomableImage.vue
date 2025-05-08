<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useLocalization } from '../../composables/useLocalization';

const { t } = useLocalization();

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  maxScale: {
    type: Number,
    default: 2
  }
});

const imageContainer = ref<HTMLElement | null>(null);
const scale = ref(1);
const panning = ref(false);
const pointX = ref(0);
const pointY = ref(0);
const start = ref({ x: 0, y: 0 });

// Đặt transform cho container
const setTransform = () => {
  if (!imageContainer.value) return;
  imageContainer.value.style.transform = `translate(${pointX.value}px, ${pointY.value}px) scale(${scale.value})`;
};

// Xử lý sự kiện double click
const onDoubleClick = (e: MouseEvent) => {
  e.preventDefault();
  
  // Nếu đang zoom in, thì zoom out về mức ban đầu
  if (scale.value > 1) {
    // Reset về kích thước và vị trí ban đầu
    scale.value = 1;
    pointX.value = 0;
    pointY.value = 0;
  } else {
    // Zoom in với mức cố định
    scale.value = props.maxScale;
    
    // Tính toán vị trí mới để giữ điểm click ở trung tâm
    const rect = imageContainer.value?.getBoundingClientRect();
    if (rect) {
      const centerX = (e.clientX - rect.left) / scale.value;
      const centerY = (e.clientY - rect.top) / scale.value;
      
      pointX.value = e.clientX - centerX * scale.value;
      pointY.value = e.clientY - centerY * scale.value;
    }
  }
  
  setTransform();
};

// Xử lý sự kiện pointer down (bắt đầu kéo)
const onPointerDown = (e: PointerEvent) => {
  // Chỉ cho phép kéo khi đã zoom in
  if (scale.value <= 1) return;
  
  e.preventDefault();
  panning.value = true;
  
  start.value = {
    x: e.clientX - pointX.value,
    y: e.clientY - pointY.value
  };
  
  if (imageContainer.value) {
    imageContainer.value.style.cursor = 'grabbing';
  }
};

// Xử lý sự kiện pointer up (kết thúc kéo)
const onPointerUp = () => {
  panning.value = false;
  
  if (imageContainer.value) {
    imageContainer.value.style.cursor = 'grab';
  }
};

// Xử lý sự kiện pointer move (đang kéo)
const onPointerMove = (e: PointerEvent) => {
  if (!panning.value) return;
  
  e.preventDefault();
  
  // Cập nhật vị trí khi kéo
  pointX.value = e.clientX - start.value.x;
  pointY.value = e.clientY - start.value.y;
  
  setTransform();
};

// Khởi tạo các event listener
onMounted(() => {
  if (imageContainer.value) {
    imageContainer.value.addEventListener('dblclick', onDoubleClick);
    imageContainer.value.addEventListener('pointerdown', onPointerDown);
    imageContainer.value.addEventListener('pointerup', onPointerUp);
    imageContainer.value.addEventListener('pointerleave', onPointerUp);
    imageContainer.value.addEventListener('pointermove', onPointerMove);
  }
});

// Xóa các event listener khi unmount
onBeforeUnmount(() => {
  if (imageContainer.value) {
    imageContainer.value.removeEventListener('dblclick', onDoubleClick);
    imageContainer.value.removeEventListener('pointerdown', onPointerDown);
    imageContainer.value.removeEventListener('pointerup', onPointerUp);
    imageContainer.value.removeEventListener('pointerleave', onPointerUp);
    imageContainer.value.removeEventListener('pointermove', onPointerMove);
  }
});
</script>

<template>
  <div class="zoomable-container">
    <div class="zoom-instructions">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
        </svg>
        {{ t('map.zoom.doubleClick') }}
      </span>
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 9.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm8-1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
        </svg>
        {{ t('map.zoom.drag') }}
      </span>
    </div>
    <div ref="imageContainer" class="image-container">
      <img :src="src" :alt="alt" class="zoomable-image" draggable="false" />
    </div>
  </div>
</template>

<style scoped>
.zoomable-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f8f8f8;
  border-radius: 0.5rem;
  min-height: 300px;
}

.image-container {
  width: 100%;
  height: 100%;
  transform-origin: center center;
  cursor: grab;
  transition: transform 0.3s ease;
}

.image-container:active {
  cursor: grabbing;
}

.zoomable-image {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

.zoom-instructions {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  display: flex;
  gap: 1rem;
  z-index: 30;
  font-size: 0.875rem;
  color: #4b5563;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
}

.zoom-instructions span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .zoom-instructions {
    flex-direction: column;
    gap: 0.25rem;
    top: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .zoomable-container {
    min-height: 200px;
    border-radius: 0.25rem;
  }
}
</style> 