<script setup lang="ts">
import { ref, reactive } from 'vue';
import { z } from 'zod';
import type { Form, FormError, FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';
import { useToast } from '~/composables/useToast';
import { useTrpc } from '~/composables/useTrpc';
import { useI18n } from 'vue-i18n';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const toast = useToast();
const trpc = useTrpc();
const { t } = useI18n();

// Form state and ref
const form = ref<Form<ContactForm>>();
const state = reactive<ContactForm>({
  name: '',
  email: '',
  phone: '',
  message: ''
});

// Phone input state
const phoneCode = ref('+84');
const phoneValid = ref(true);
const phoneErrorMessage = ref('');

// Form validation schema
const schema = z.object({
  name: z.string().min(1, t('validation.required')),
  email: z.string().email(t('validation.email')),
  phone: z.string().min(1, t('validation.required')),
  message: z.string().min(1, t('validation.required'))
});

const isLoading = ref(false);

// Handle phone validation
const handlePhoneValidation = ({ valid, message }: { valid: boolean; message?: string }) => {
  phoneValid.value = valid;
  phoneErrorMessage.value = message || '';
  
  if (!valid && form.value) {
    form.value.setErrors([{
      path: 'phone',
      message: message || t('validation.phoneInvalid')
    }]);
  }
};

const resetForm = () => {
  if (form.value) {
    form.value.clear();
  }
  state.name = '';
  state.email = '';
  state.phone = '';
  state.message = '';
  phoneCode.value = '+84';
  phoneValid.value = true;
  phoneErrorMessage.value = '';
};

const handleSubmit = async (event: FormSubmitEvent<ContactForm>) => {
  if (!phoneValid.value) {
    if (form.value) {
      form.value.setErrors([{
        path: 'phone',
        message: phoneErrorMessage.value || t('validation.phoneInvalid')
      }]);
    }
    return;
  }

  isLoading.value = true;
  
  try {
    const response = await trpc.contact.create.mutate({
      ...event.data,
      phone: `${phoneCode.value}${event.data.phone}`
    });

    if (response.success) {
      toast.success(response.message);
      resetForm();
    } else {
      toast.error(response.message);
    }
  } catch (error) {
    console.error('Contact form error:', error);
    toast.error(t('common.error'));
  } finally {
    isLoading.value = false;
  }
};

const handleError = (error: FormError[]) => {
  toast.error(t('validation.required'));
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">{{ t('contact') }}</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Contact Form -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <UForm
          ref="form"
          :schema="schema"
          :state="state"
          class="space-y-8"
          @submit="handleSubmit"
          @error="handleError"
        >
          <UFormGroup
            :label="t('priceRequest.fullName')"
            name="name"
            required
          >
            <UInput
              v-model="state.name"
              type="text"
              :placeholder="t('priceRequest.fullNamePlaceholder')"
              color="gray"
              variant="outline"
              size="lg"
              :ui="{
                base: 'h-[42px] text-base',
                input: 'h-[42px] text-base'
              }"
            />
          </UFormGroup>

          <UFormGroup
            :label="t('auth.email')"
            name="email"
            required
          >
            <UInput
              v-model="state.email"
              type="email"
              :placeholder="t('priceRequest.emailPlaceholder')"
              color="gray"
              variant="outline"
              size="lg"
              :ui="{
                base: 'h-[42px] text-base',
                input: 'h-[42px] text-base'
              }"
            />
          </UFormGroup>

          <UFormGroup
            :label="t('priceRequest.phone')"
            name="phone"
            required
            :error="!phoneValid ? phoneErrorMessage : undefined"
          >
            <div class="phone-input-wrapper">
              <PhoneInput
                v-model="state.phone"
                v-model:phoneCode="phoneCode"
                :placeholder="t('priceRequest.phonePlaceholder')"
                :error="!phoneValid"
                :showErrorMessage="true"
                @validation="handlePhoneValidation"
              />
            </div>
          </UFormGroup>

          <UFormGroup
            :label="t('priceRequest.message')"
            name="message"
            required
          >
            <UTextarea
              v-model="state.message"
              :placeholder="t('priceRequest.messagePlaceholder')"
              :rows="4"
              color="gray"
              variant="outline"
              size="lg"
              :ui="{
                base: 'text-base',
                input: 'text-base resize-none'
              }"
            />
          </UFormGroup>

          <div class="flex justify-center">
            <UButton
              type="submit"
              color="primary"
              :loading="isLoading"
              class="w-full md:w-auto h-[42px] text-base font-medium px-8"
              variant="solid"
            >
              {{ isLoading ? t('common.loading') : t('common.submit') }}
            </UButton>
          </div>
        </UForm>
      </div>

      <!-- Contact Information -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">{{ t('products.customerSupport') }}</h2>
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-map-pin" class="text-primary w-5 h-5" />
              <span>37/6 Khu Phố Tây, Phường Vĩnh Phú, Thị Xã Thuận An, Tỉnh Bình Dương</span>
            </div>
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-phone" class="text-primary w-5 h-5" />
              <span>{{ t('products.hotline') }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-envelope" class="text-primary w-5 h-5" />
              <span>admin@mgavietnam.com</span>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone-input-wrapper :deep(.phone-input-container) {
  @apply relative;

  .phone-code-selector button {
    @apply h-[42px] text-base border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 transition-colors duration-200;
  }

  .u-input {
    @apply h-[42px] text-base;
  }

  &.error {
    .phone-code-selector button,
    .u-input {
      @apply border-red-500;
    }
  }
}

/* Fix border radius for phone input */
.phone-input-wrapper :deep(.phone-code-selector button) {
  @apply rounded-l-md border-r-0;
}

.phone-input-wrapper :deep(.u-input) {
  @apply rounded-l-none;
}

/* Consistent hover states */
.phone-input-wrapper :deep(.phone-code-selector button:hover) {
  @apply bg-gray-100 dark:bg-gray-600;
}

/* Fix dropdown styling */
.phone-input-wrapper :deep(.phone-code-selector .absolute) {
  @apply mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-50;
}

:deep(.form-group) {
  @apply mb-6;
}

:deep(.form-label) {
  @apply mb-2 text-sm font-medium text-gray-700 dark:text-gray-200;
}

:deep(.u-input),
:deep(.u-textarea) {
  @apply relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm;
}

:deep(.u-input.error),
:deep(.u-textarea.error) {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

:deep(.dark .u-input),
:deep(.dark .u-textarea) {
  @apply bg-gray-700 border-gray-600 text-white placeholder-gray-400;
}

:deep(.error-message) {
  @apply mt-1 text-sm text-red-500;
}
</style> 