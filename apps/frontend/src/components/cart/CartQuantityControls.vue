<script setup lang="ts">
import { Plus, Minus } from 'lucide-vue-next';

interface Props {
  quantity: number;
  isProcessing: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

interface Emits {
  increase: [];
  decrease: [];
  change: [quantity: number];
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  disabled: false
});

const emit = defineEmits<Emits>();

const handleIncrease = (event: MouseEvent) => {
  if (props.disabled || props.isProcessing) return;
  
  // Prevent event bubbling to avoid closing parent containers
  event.stopPropagation();
  
  emit('increase');
  emit('change', props.quantity + 1);
};

const handleDecrease = (event: MouseEvent) => {
  if (props.disabled || props.isProcessing) return;
  
  // Prevent event bubbling to avoid closing parent containers
  event.stopPropagation();
  
  emit('decrease');
  emit('change', props.quantity - 1);
};

const getSizeClasses = () => {
  switch (props.size) {
    case 'sm':
      return {
        container: 'border border-gray-300 dark:border-gray-600 rounded',
        button: 'p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        icon: 'w-3 h-3 text-gray-900 dark:text-white',
        quantity: 'px-2 py-1 text-xs font-medium min-w-[2rem] text-center text-gray-900 dark:text-white'
      };
    case 'lg':
      return {
        container: 'border border-gray-300 dark:border-gray-600 rounded-lg',
        button: 'p-3 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        icon: 'w-5 h-5 text-gray-900 dark:text-white',
        quantity: 'px-6 py-3 font-medium min-w-[4rem] text-center text-gray-900 dark:text-white'
      };
    default: // md
      return {
        container: 'border border-gray-300 dark:border-gray-600 rounded-lg',
        button: 'p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        icon: 'w-4 h-4 text-gray-900 dark:text-white',
        quantity: 'px-4 py-2 min-w-[3rem] text-center font-medium text-gray-900 dark:text-white'
      };
  }
};

const sizeClasses = getSizeClasses();
</script>

<template>
  <div :class="['flex items-center', sizeClasses.container]" @click.stop>
    <button
      @click="handleDecrease($event)"
      :disabled="disabled || isProcessing"
      :class="sizeClasses.button"
    >
      <Minus :class="sizeClasses.icon" />
    </button>
    
    <span :class="sizeClasses.quantity">
      {{ quantity }}
    </span>
    
    <button
      @click="handleIncrease($event)"
      :disabled="disabled || isProcessing"
      :class="sizeClasses.button"
    >
      <Plus :class="sizeClasses.icon" />
    </button>
  </div>
</template> 