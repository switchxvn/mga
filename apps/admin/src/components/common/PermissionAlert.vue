<script setup lang="ts">
import { computed } from 'vue';
import { ShieldAlert } from 'lucide-vue-next';
import { useLocalization } from '../../composables/useLocalization';

const { t } = useLocalization();

const props = defineProps({
  /**
   * List of required permissions
   */
  requiredPermissions: {
    type: Array as () => string[],
    default: () => []
  },
  /**
   * Custom title 
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * Custom description
   */
  description: {
    type: String,
    default: ''
  },
  /**
   * Alert type (error, warning, info)
   */
  type: {
    type: String,
    default: 'warning',
    validator: (value: string) => ['error', 'warning', 'info'].includes(value)
  }
});

// Determine color based on type
const alertColor = computed(() => {
  switch (props.type) {
    case 'error': return 'text-red-500';
    case 'info': return 'text-blue-500';
    default: return 'text-amber-500';
  }
});

// Default title
const defaultTitle = computed(() => {
  switch (props.type) {
    case 'error': return t('components.common.permissionAlert.accessDenied');
    case 'info': return t('components.common.permissionAlert.accessInfo');
    default: return t('components.common.permissionAlert.accessRequired');
  }
});

// Default description
const defaultDescription = computed(() => {
  if (!props.requiredPermissions.length) {
    return t('components.common.permissionAlert.noAccess');
  }

  if (props.requiredPermissions.length === 1) {
    return t('components.common.permissionAlert.permissionRequired', {
      permission: props.requiredPermissions[0]
    });
  }

  return t('components.common.permissionAlert.permissionsRequired', {
    permissions: props.requiredPermissions.join(', ')
  });
});
</script>

<template>
  <div class="rounded-md border bg-opacity-20 p-4 mb-6"
       :class="{
         'bg-amber-50 border-amber-200 dark:bg-amber-900 dark:bg-opacity-10 dark:border-amber-800': type === 'warning',
         'bg-red-50 border-red-200 dark:bg-red-900 dark:bg-opacity-10 dark:border-red-800': type === 'error',
         'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:bg-opacity-10 dark:border-blue-800': type === 'info'
       }">
    <div class="flex">
      <div class="flex-shrink-0">
        <ShieldAlert class="h-5 w-5" :class="alertColor" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium"
            :class="{
              'text-amber-800 dark:text-amber-300': type === 'warning',
              'text-red-800 dark:text-red-300': type === 'error',
              'text-blue-800 dark:text-blue-300': type === 'info'
            }">
          {{ title || defaultTitle }}
        </h3>
        <div class="mt-2 text-sm"
             :class="{
              'text-amber-700 dark:text-amber-200': type === 'warning',
              'text-red-700 dark:text-red-200': type === 'error',
              'text-blue-700 dark:text-blue-200': type === 'info'
             }">
          <p>{{ description || defaultDescription }}</p>
        </div>
      </div>
    </div>
  </div>
</template> 