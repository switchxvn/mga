<script setup lang="ts">
import { AlertTriangle, Info, X } from 'lucide-vue-next';

interface Props {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface Emits {
  confirm: [];
  cancel: [];
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger'
});

const emit = defineEmits<Emits>();

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleCancel();
  }
};

const getVariantClasses = () => {
  switch (props.variant) {
    case 'danger':
      return {
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
        confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      };
    case 'warning':
      return {
        icon: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
        confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
      };
    case 'info':
      return {
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
      };
    default:
      return {
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
        confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      };
  }
};

const variantClasses = getVariantClasses();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <!-- Dialog -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isVisible"
            class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <!-- Close button -->
            <button
              @click="handleCancel"
              class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>

            <!-- Content -->
            <div class="flex items-start space-x-4">
              <!-- Icon -->
              <div :class="[variantClasses.iconBg, 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center']">
                <AlertTriangle v-if="variant === 'danger' || variant === 'warning'" :class="[variantClasses.icon, 'w-5 h-5']" />
                <Info v-else :class="[variantClasses.icon, 'w-5 h-5']" />
              </div>

              <!-- Text content -->
              <div class="flex-1 pt-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  {{ message }}
                </p>

                <!-- Action buttons -->
                <div class="flex space-x-3 justify-end">
                  <button
                    @click="handleCancel"
                    class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {{ cancelText }}
                  </button>
                  <button
                    @click="handleConfirm"
                    :class="[variantClasses.confirmBtn, 'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2']"
                  >
                    {{ confirmText }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template> 