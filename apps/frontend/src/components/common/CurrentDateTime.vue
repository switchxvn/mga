<!-- Current Date Time component -->
<script setup lang="ts">
import { useNow, useDateFormat } from '@vueuse/core';
import Icon from '~/components/ui/Icon.vue';

// Time
const now = useNow();
const formattedTime = useDateFormat(now, 'HH:mm:ss - DD/MM/YYYY');
</script>

<template>
  <div class="flex items-center gap-2">
    <Icon 
      name="Clock" 
      class="nav-icon text-white w-6 h-6"
    />
    <span class="text-[18px] font-medium text-white whitespace-nowrap w-[200px] inline-block">
      {{ formattedTime }}
    </span>
  </div>
</template>

<style scoped>
.nav-icon {
  @apply flex-shrink-0;
  width: auto;
  height: auto;
}
</style> 