/**
 * Composable để export các API của Vue để sử dụng trong Nuxt 3
 * Trong Nuxt 3, chúng ta không cần import trực tiếp từ 'vue'
 * vì Nuxt 3 tự động import các API này
 */

// Import các composables từ Vue
import { ref, computed, onMounted, watch, reactive, toRef, toRefs, nextTick } from 'vue';

// Re-export các composables từ Vue
// Không cần phải định nghĩa lại các composables này vì Nuxt 3 đã tự động import chúng
// Chỉ cần export lại để các component có thể import từ file này

export { ref, computed, onMounted, watch, reactive, toRef, toRefs, nextTick }; 