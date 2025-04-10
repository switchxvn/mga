<script setup lang="ts">
import { Bell, ChevronUp, ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isExpanded = ref(true);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div>
    <div
      @click="toggleExpanded"
      class="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div class="flex items-center gap-2.5">
        <Bell class="h-5 w-5 text-primary-500" />
        <h3 class="font-medium text-gray-900 dark:text-white">
          {{ t("sidebar.subscribe") }}
        </h3>
      </div>
      <component
        :is="isExpanded ? ChevronUp : ChevronDown"
        class="h-5 w-5 text-gray-500"
      />
    </div>

    <div v-if="isExpanded" class="px-4 pb-4">
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {{ t("sidebar.subscribeDescription") }}
      </p>

      <form class="space-y-3">
        <UInput type="email" :placeholder="t('sidebar.emailPlaceholder')" size="md" />
        <UButton type="submit" color="primary" variant="solid" size="md" block>
          {{ t("sidebar.subscribeButton") }}
        </UButton>
      </form>
    </div>
  </div>
</template> 