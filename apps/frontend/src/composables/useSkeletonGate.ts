import { nextTick, onMounted, ref } from 'vue';

let hasHydratedInitialPage = false;

export function useSkeletonGate() {
  const shouldShowSkeleton = ref(import.meta.client && hasHydratedInitialPage);

  onMounted(async () => {
    hasHydratedInitialPage = true;
    await nextTick();
    shouldShowSkeleton.value = false;
  });

  return {
    shouldShowSkeleton,
  };
}
