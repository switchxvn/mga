<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Component } from 'vue';
import { deferUntilVisible } from '~/utils/deferredLoad';

interface DeferredSection {
  id: number;
  type?: string;
  componentName?: string | null;
}

const props = defineProps<{
  component: Component | null;
  section: DeferredSection;
  config?: Record<string, unknown>;
  semanticHeadingProps?: Record<string, unknown>;
  eager?: boolean;
}>();

const anchor = ref<HTMLElement | null>(null);
const isVisible = ref(Boolean(props.eager));
let stopDeferredLoad: (() => void) | null = null;

const placeholderHeight = computed(() => {
  const type = props.section.type || '';
  const componentName = props.section.componentName || '';

  if (type === 'hero' || type === 'hero_full_width' || componentName === 'HeroSection' || componentName === 'HeroSectionFullWidth') {
    return '36rem';
  }

  if (type === 'company_intro' || componentName === 'CompanyIntroSection') {
    return '24rem';
  }

  if (
    ['gallery', 'food_gallery', 'horizontal_gallery', 'video_intro'].includes(type) ||
    ['GalleryMasonrySection', 'FoodGallerySection', 'HorizontalGallerySection', 'VideoIntroSection'].includes(componentName)
  ) {
    return '28rem';
  }

  return '20rem';
});

onMounted(() => {
  if (props.eager || !anchor.value) {
    return;
  }

  stopDeferredLoad = deferUntilVisible(
    anchor.value,
    () => {
      isVisible.value = true;
    },
    { rootMargin: '800px 0px' },
  );
});

onBeforeUnmount(() => {
  stopDeferredLoad?.();
});
</script>

<template>
  <div ref="anchor" class="deferred-home-section">
    <component
      :is="component"
      v-if="component && isVisible"
      :section="section"
      :config="config"
      v-bind="semanticHeadingProps"
    />
    <div
      v-else
      class="deferred-home-section__placeholder"
      :style="{ minHeight: placeholderHeight }"
      aria-hidden="true"
    ></div>
  </div>
</template>

<style scoped>
.deferred-home-section__placeholder {
  width: 100%;
}
</style>
