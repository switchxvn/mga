/**
 * Composable trung tâm để export các API của Vue
 * 
 * Chúng tôi đã cấu hình Nuxt để KHÔNG tự động import các API từ Vue
 * mà thay vào đó tất cả các components nên import từ file này.
 * 
 * Điều này giúp tránh cảnh báo về import trùng lặp và cung cấp một 
 * điểm truy cập nhất quán cho tất cả các Vue composables.
 */

// Import trực tiếp từ Vue - đây là cách duy nhất để import Vue composables trong dự án này
import { ref, computed, onMounted, watch, reactive, toRef, toRefs, nextTick } from 'vue';

// Re-export các composables
export { ref, computed, onMounted, watch, reactive, toRef, toRefs, nextTick }; 