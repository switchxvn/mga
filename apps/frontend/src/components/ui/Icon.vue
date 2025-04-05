<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next';
import { computed } from 'vue';

interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 24,
  strokeWidth: 2
});

// Convert kebab-case to PascalCase for icon names
const toPascalCase = (str: string) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Get icon component dynamically
const Icon = computed(() => {
  // Try direct match first (for static icons)
  const directIcon = LucideIcons[props.name as keyof typeof LucideIcons];
  if (directIcon) return directIcon;
  
  // Try PascalCase conversion (for kebab-case static icons)
  const pascalCaseName = toPascalCase(props.name);
  const pascalIcon = LucideIcons[pascalCaseName as keyof typeof LucideIcons];
  if (pascalIcon) return pascalIcon;
  
  // If not found, return HelpCircle
  console.warn(`Icon "${props.name}" not found, using HelpCircle`);
  return LucideIcons.HelpCircle;
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