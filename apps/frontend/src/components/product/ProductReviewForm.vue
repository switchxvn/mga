<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Star } from 'lucide-vue-next';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';

const props = defineProps<{
  productId: number;
  locale?: string;
}>();

const emit = defineEmits<{
  (e: 'success', review: any): void;
  (e: 'error', error: unknown): void;
}>();

const { t, locale } = useLocalization();
const trpc = useTrpc();

const inputRef = ref<HTMLInputElement | null>(null);
const isSubmitting = ref(false);
const formData = reactive({
  authorName: '',
  profession: '',
  rating: 5,
  title: '',
  content: '',
});

const formErrors = reactive({
  authorName: '',
  rating: '',
  title: '',
  content: '',
});

const currentLocale = computed(() => props.locale || locale.value);
const displayRating = ref(0);

const resetErrors = () => {
  formErrors.authorName = '';
  formErrors.rating = '';
  formErrors.title = '';
  formErrors.content = '';
};

const validateForm = () => {
  resetErrors();
  let isValid = true;

  if (!formData.authorName.trim()) {
    formErrors.authorName = t('validation.required');
    isValid = false;
  } else if (formData.authorName.trim().length < 2) {
    formErrors.authorName = t('validation.minLength').replace('{min}', '2');
    isValid = false;
  }

  if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
    formErrors.rating = t('validation.required');
    isValid = false;
  }

  if (!formData.title.trim()) {
    formErrors.title = t('validation.required');
    isValid = false;
  } else if (formData.title.trim().length < 4) {
    formErrors.title = t('validation.minLength').replace('{min}', '4');
    isValid = false;
  }

  if (!formData.content.trim()) {
    formErrors.content = t('validation.required');
    isValid = false;
  } else if (formData.content.trim().length < 10) {
    formErrors.content = t('validation.minLength').replace('{min}', '10');
    isValid = false;
  }

  return isValid;
};

const setRating = (rating: number) => {
  formData.rating = rating;
};

const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 5:
      return t('reviews.ratingExcellent');
    case 4:
      return t('reviews.ratingGood');
    case 3:
      return t('reviews.ratingAverage');
    case 2:
      return t('reviews.ratingPoor');
    case 1:
      return t('reviews.ratingBad');
    default:
      return '';
  }
};

const resetForm = () => {
  formData.authorName = '';
  formData.profession = '';
  formData.rating = 5;
  formData.title = '';
  formData.content = '';
  displayRating.value = 0;
  resetErrors();
};

const focusFirstField = () => {
  inputRef.value?.focus();
};

const submitForm = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await trpc.review.submitReview.mutate({
      authorName: formData.authorName.trim(),
      profession: formData.profession.trim() || undefined,
      rating: formData.rating,
      productId: props.productId,
      translations: [
        {
          locale: currentLocale.value,
          title: formData.title.trim(),
          content: formData.content.trim(),
        },
      ],
    });

    resetForm();
    emit('success', response);
  } catch (error) {
    emit('error', error);
  } finally {
    isSubmitting.value = false;
  }
};

defineExpose({
  focusFirstField,
});
</script>

<template>
  <form class="space-y-5" @submit.prevent="submitForm">
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {{ t('reviews.authorName') }}
        </label>
        <input
          ref="inputRef"
          v-model="formData.authorName"
          type="text"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          :placeholder="t('reviews.authorNamePlaceholder')"
        />
        <p v-if="formErrors.authorName" class="mt-2 text-sm text-red-600 dark:text-red-400">
          {{ formErrors.authorName }}
        </p>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {{ t('reviews.professionLabel') }}
        </label>
        <input
          v-model="formData.profession"
          type="text"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          :placeholder="t('reviews.professionPlaceholder')"
        />
      </div>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {{ t('reviews.rating') }}
      </label>
      <div class="flex items-center gap-2">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="rounded-full p-1 transition hover:scale-105"
          @click="setRating(star)"
          @mouseenter="displayRating = star"
          @mouseleave="displayRating = 0"
        >
          <Star
            class="h-6 w-6"
            :class="(displayRating || formData.rating) >= star ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-300 dark:text-gray-600'"
          />
        </button>
        <span class="ml-2 text-sm text-gray-600 dark:text-gray-300">
          {{ getRatingLabel(displayRating || formData.rating) }}
        </span>
      </div>
      <p v-if="formErrors.rating" class="mt-2 text-sm text-red-600 dark:text-red-400">
        {{ formErrors.rating }}
      </p>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {{ t('reviews.reviewTitle') }}
      </label>
      <input
        v-model="formData.title"
        type="text"
        class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        :placeholder="t('reviews.reviewTitlePlaceholder')"
      />
      <p v-if="formErrors.title" class="mt-2 text-sm text-red-600 dark:text-red-400">
        {{ formErrors.title }}
      </p>
    </div>

    <div>
      <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {{ t('reviews.reviewContent') }}
      </label>
      <textarea
        v-model="formData.content"
        rows="5"
        class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        :placeholder="t('reviews.reviewContentPlaceholder')"
      />
      <p v-if="formErrors.content" class="mt-2 text-sm text-red-600 dark:text-red-400">
        {{ formErrors.content }}
      </p>
    </div>

    <div class="flex items-center justify-between gap-4 rounded-2xl bg-primary-50 px-4 py-3 text-sm text-primary-800 dark:bg-primary-950/40 dark:text-primary-200">
      <p>{{ t('reviews.moderationNotice') }}</p>
      <UButton type="submit" color="primary" :loading="isSubmitting">
        {{ t('reviews.submitReview') }}
      </UButton>
    </div>
  </form>
</template>
