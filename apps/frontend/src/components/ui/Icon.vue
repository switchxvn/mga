<script setup lang="ts">
import { type Icon as LucideIcon, type LucideProps } from 'lucide-vue-next'
import * as lucideIcons from 'lucide-vue-next'
import { computed } from 'vue'

export interface IconProps {
  name: keyof typeof lucideIcons
  size?: number
  strokeWidth?: number
}

const props = withDefaults(defineProps<IconProps>(), {
  size: 24,
  strokeWidth: 2,
})

const Icon = computed(() => lucideIcons[props.name])
</script>

<template>
  <component
    :is="Icon"
    :size="props.size"
    :stroke-width="props.strokeWidth"
    :class="$attrs.class"
  />
</template> 