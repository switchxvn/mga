<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next';
import { computed } from 'vue';
import { useLocalization } from '../../composables/useLocalization';

const { t } = useLocalization();

const props = defineProps({
  requiredPermissions: {
    type: Array as () => string[],
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
});

// Create a default description if not provided
const defaultDescription = computed(() => {
  if (!props.requiredPermissions.length) {
    return t('components.common.accessDenied.defaultMessage');
  }

  if (props.requiredPermissions.length === 1) {
    return t('components.common.accessDenied.missingPermission', {
      permission: props.requiredPermissions[0]
    });
  }

  return t('components.common.accessDenied.requiredPermissions', {
    permissions: props.requiredPermissions.join(', ')
  });
});

const componentTitle = computed(() => {
  return props.title || t('components.common.accessDenied.title');
});
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <ShieldAlert class="h-8 w-8 text-amber-500" />
      </div>
      <div class="ml-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ componentTitle }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ description || defaultDescription }}
        </p>
      </div>
    </div>
  </div>
</template> 