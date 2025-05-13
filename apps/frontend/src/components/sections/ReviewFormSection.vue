<script setup lang="ts">
import { useLocalization } from '../../composables/useLocalization';
import { useReviews } from '../../composables/useReviews';
import ReviewForm from '../ReviewForm.vue';

// Props cho section này
const props = defineProps({
  section: {
    type: Object,
    required: true
  }
});

const { t } = useLocalization();

// Lấy settings từ section
const settings = props.section.settings || {};

// Default values
const title = settings.title || t('reviews.shareYourExperience');
const description = settings.description || '';
const backgroundColor = settings.backgroundColor || 'bg-white dark:bg-gray-800';
const textColor = settings.textColor || 'text-gray-900 dark:text-white';
const borderColor = settings.borderColor || 'border-gray-200 dark:border-gray-700';
const shadowLevel = settings.shadowLevel || 'shadow-sm';
const padding = settings.padding || 'p-6';
const marginTop = settings.marginTop || 'mt-16';
const marginBottom = settings.marginBottom || 'mb-16';
const showTitle = settings.showTitle !== undefined ? settings.showTitle : true;
const formFields = settings.formFields || {
  showServiceType: true,
  showProfession: true,
  showVisitDate: true
};

// Từ useReviews composable
const { setupInitialData } = useReviews();

// Xử lý khi gửi form thành công
const handleSuccess = () => {
  setupInitialData();
};
</script>

<template>
  <div id="review-form" class="container mx-auto px-4" :class="[marginTop, marginBottom]">
    <div :class="[backgroundColor, shadowLevel, 'border rounded-lg', borderColor, padding]">
      <h2 v-if="showTitle" class="text-2xl font-bold mb-4" :class="textColor">
        {{ title }}
      </h2>
      <p v-if="description" class="mb-6" :class="textColor === 'text-gray-900 dark:text-white' ? 'text-gray-600 dark:text-gray-400' : textColor">
        {{ description }}
      </p>
      <ReviewForm 
        @success="handleSuccess" 
        :show-service-type="formFields.showServiceType"
        :show-profession="formFields.showProfession"
        :show-visit-date="formFields.showVisitDate"
        :show-card="false"
        :show-form-title="false"
      />
    </div>
  </div>
</template> 