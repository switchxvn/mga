<script setup lang="ts">
import { ref, computed } from 'vue';
import ServiceCard from '../ui/card/ServiceCard.vue';
import { useLocalization } from '../../composables/useLocalization';
import { useI18n } from 'vue-i18n';

type ButtonVariant = 'solid' | 'outline' | 'soft' | 'ghost' | 'link';

interface ServiceTranslation {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  locale: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  serviceId: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Service {
  id: number;
  icon: string;
  order: number;
  isActive: boolean;
  translations: ServiceTranslation[];
  currentTranslation?: ServiceTranslation;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ServicesConfig {
  layout: 'grid';
  columns: number;
  maxItems: number;
  showIcon: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showPrice: boolean;
  showButton: boolean;
  descriptionLength: number;
  gap: string;
  backgroundGradient: {
    from: string;
    to: string;
    direction: string;
  };
  overlayOpacity: string;
  padding: {
    top: string;
    bottom: string;
  };
  buttonText: string;
  buttonStyle: ButtonVariant;
  cardStyle: {
    background: string;
    shadow: string;
    border: string;
    rounded: string;
    padding: string;
    transition: string;
  };
  iconStyle: {
    size: string;
    background: string;
    color: string;
    rounded: string;
    padding: string;
  };
  titleStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
  descriptionStyle: {
    size: string;
    color: string;
    margin: string;
  };
  priceStyle: {
    size: string;
    weight: string;
    color: string;
    margin: string;
  };
}

interface Props {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  config?: ServicesConfig;
}

const props = defineProps<Props>();
const { locale } = useLocalization();
const { t } = useI18n();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

const handleRetry = () => {
  emit('retry');
};

const buttonVariant = computed<ButtonVariant>(() => {
  return props.config?.buttonStyle || 'solid';
});

// Computed để lấy số cột dựa trên config hoặc responsive default
const gridColumns = computed(() => {
  if (props.config?.columns) {
    return props.config.columns;
  }
  return 3; // default columns
});

// Computed để lấy gap từ config hoặc default
const gridGap = computed(() => {
  return props.config?.gap || '2rem';
});

// Computed để tạo grid styles
const gridStyles = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${gridColumns.value}, minmax(0, 1fr))`,
  gap: gridGap.value
}));

</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="flex justify-center items-center py-12">
    <div class="spinner"></div>
  </div>
  
  <!-- Error state -->
  <div v-else-if="error" class="text-center text-red-500 py-8">
    <p>{{ error }}</p>
    <Button 
      @click="handleRetry" 
      variant="destructive"
      class="mt-4"
    >
      {{ t('common.retry') }}
    </Button>
  </div>
  
  <!-- Services Grid -->
  <div 
    v-else-if="services.length > 0" 
    class="grid"
    :style="gridStyles"
  >
    <ServiceCard
      v-for="service in services.slice(0, config?.maxItems || services.length)"
      :key="service.id"
      :service="service"
      :show-icon="config?.showIcon"
      :show-title="config?.showTitle"
      :show-description="config?.showDescription"
      :show-button="config?.showButton"
      :button-text="config?.buttonText"
      :button-variant="buttonVariant"
      :card-style="config?.cardStyle"
      :icon-style="config?.iconStyle"
      :title-style="config?.titleStyle"
      :description-style="config?.descriptionStyle"
    />
  </div>
  
  <!-- Empty state -->
  <div v-else class="text-center text-gray-500 dark:text-gray-400 py-8">
    <p>{{ t('services.no_services') }}</p>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr !important;
  }
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(var(--color-primary-500), 0.2);
  border-top-color: rgb(var(--color-primary-500));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 