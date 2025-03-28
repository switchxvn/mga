<script setup lang="ts">
import { ref, reactive } from 'vue';
import { z } from 'zod';
import type { Form, FormError, FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';
import { useToast } from '~/composables/useToast';
import { useTrpc } from '~/composables/useTrpc';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const toast = useToast();
const trpc = useTrpc();

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
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  message: z.string().min(1, 'Vui lòng nhập nội dung')
});

const isLoading = ref(false);

// Handle phone validation
const handlePhoneValidation = ({ valid, message }: { valid: boolean; message?: string }) => {
  phoneValid.value = valid;
  phoneErrorMessage.value = message || '';
  
  if (!valid && form.value) {
    form.value.setErrors([{
      name: 'phone',
      message: message || 'Số điện thoại không hợp lệ'
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
        name: 'phone',
        message: phoneErrorMessage.value || 'Số điện thoại không hợp lệ'
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
    toast.error('Có lỗi xảy ra, vui lòng thử lại!');
  } finally {
    isLoading.value = false;
  }
};

const handleError = (error: FormError[]) => {
  toast.error('Vui lòng kiểm tra lại thông tin!');
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Liên hệ</h1>
    
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
            label="Họ tên"
            name="name"
            required
          >
            <UInput
              v-model="state.name"
              type="text"
              placeholder="Nhập họ tên"
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
            label="Email"
            name="email"
            required
          >
            <UInput
              v-model="state.email"
              type="email"
              placeholder="Nhập email"
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
            label="Số điện thoại"
            name="phone"
            required
            :error="!phoneValid ? phoneErrorMessage : undefined"
          >
            <div class="phone-input-wrapper">
              <PhoneInput
                v-model="state.phone"
                v-model:phoneCode="phoneCode"
                placeholder="Nhập số điện thoại"
                :error="!phoneValid"
                :showErrorMessage="true"
                @validation="handlePhoneValidation"
              />
            </div>
          </UFormGroup>

          <UFormGroup
            label="Nội dung"
            name="message"
            required
          >
            <UTextarea
              v-model="state.message"
              placeholder="Nhập nội dung"
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

          <UButton
            type="submit"
            color="primary"
            :loading="isLoading"
            class="w-full h-[42px] text-base font-medium"
            variant="solid"
          >
            {{ isLoading ? 'Đang gửi...' : 'Gửi liên hệ' }}
          </UButton>
        </UForm>
      </div>

      <!-- Contact Information -->
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-map-pin" class="text-primary w-5 h-5" />
              <span>123 Đường ABC, Quận 1, TP.HCM</span>
            </div>
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-phone" class="text-primary w-5 h-5" />
              <span>+84 123 456 789</span>
            </div>
            <div class="flex items-center space-x-3">
              <UIcon name="i-heroicons-envelope" class="text-primary w-5 h-5" />
              <span>contact@example.com</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Giờ làm việc</h2>
          <div class="space-y-2">
            <p>Thứ 2 - Thứ 6: 8:00 - 17:00</p>
            <p>Thứ 7: 8:00 - 12:00</p>
            <p>Chủ nhật: Nghỉ</p>
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