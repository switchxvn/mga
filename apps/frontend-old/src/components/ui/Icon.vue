<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next';
import { computed } from 'vue';
import { useIcon } from '~/composables/useIcon';

interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 24,
  strokeWidth: 2
});

const { getIconComponent } = useIcon();

// Convert kebab-case to PascalCase for icon names
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Get icon component dynamically
const Icon = computed(() => {
  return getIconComponent(props.name);
});
</script>

<template>
  <component 
    :is="Icon"
    :size="props.size"
    :stroke-width="props.strokeWidth"
    :class="$attrs.class"
  />
</template> 