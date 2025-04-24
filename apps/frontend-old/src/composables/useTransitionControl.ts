import { onMounted, onBeforeUnmount } from 'vue';

export function useTransitionControl() {
  const disableTransitions = () => {
    document.documentElement.classList.add('disable-transitions');
  };

  const enableTransitions = () => {
    document.documentElement.classList.remove('disable-transitions');
  };

  onMounted(() => {
    if (process.client) {
      disableTransitions();
    }
  });

  onBeforeUnmount(() => {
    if (process.client) {
      enableTransitions();
    }
  });

  return {
    disableTransitions,
    enableTransitions
  };
} 