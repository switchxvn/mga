<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocalization } from '../composables/useLocalization';
import { useTrpc } from '../composables/useTrpc';

const props = defineProps<{
  isOpen: boolean;
  productId: number;
  productName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const { t } = useLocalization();
const trpc = useTrpc();

// Form data
const fullName = ref('');
const email = ref('');
const phone = ref('');
const message = ref('');

// Form validation
const errors = ref({
  fullName: '',
  email: '',
  phone: '',
});

// Form submission
const isSubmitting = ref(false);
const submitSuccess = ref(false);

// Validate form
const validateForm = () => {
  let isValid = true;
  errors.value = {
    fullName: '',
    email: '',
    phone: '',
  };

  if (!fullName.value.trim()) {
    errors.value.fullName = t('priceRequest.fullNameRequired') || 'Vui lòng nhập họ tên';
    isValid = false;
  }

  if (!email.value.trim()) {
    errors.value.email = t('priceRequest.emailRequired') || 'Vui lòng nhập email';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = t('priceRequest.emailInvalid') || 'Email không hợp lệ';
    isValid = false;
  }

  if (!phone.value.trim()) {
    errors.value.phone = t('priceRequest.phoneRequired') || 'Vui lòng nhập số điện thoại';
    isValid = false;
  }

  return isValid;
};

// Submit form
const submitForm = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    await trpc.priceRequest.create.mutate({
      fullName: fullName.value,
      email: email.value,
      phone: phone.value,
      message: message.value,
      productId: props.productId,
      productName: props.productName,
    });

    submitSuccess.value = true;
    setTimeout(() => {
      closeModal();
      emit('success');
    }, 2000);
  } catch (error) {
    console.error('Error submitting price request:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form
const resetForm = () => {
  fullName.value = '';
  email.value = '';
  phone.value = '';
  message.value = '';
  errors.value = {
    fullName: '',
    email: '',
    phone: '',
  };
  submitSuccess.value = false;
};

// Close modal
const closeModal = () => {
  resetForm();
  emit('close');
};

// Computed properties
const modalTitle = computed(() => {
  return submitSuccess.value
    ? t('priceRequest.successTitle') || 'Yêu cầu đã được gửi'
    : t('priceRequest.title') || 'Yêu cầu báo giá';
});
</script>

<template>
  <UModal :model-value="isOpen" @close="closeModal">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ modalTitle }}
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" class="-my-1" @click="closeModal" />
        </div>
      </template>

      <div v-if="submitSuccess" class="text-center py-4">
        <UIcon name="i-heroicons-check-circle" class="h-16 w-16 text-green-500 mx-auto mb-4" />
        <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('priceRequest.successMessage') || 'Yêu cầu báo giá đã được gửi thành công!' }}
        </p>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('priceRequest.successDescription') || 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.' }}
        </p>
      </div>

      <form v-else @submit.prevent="submitForm" class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ t('priceRequest.description') || 'Vui lòng điền thông tin để nhận báo giá cho sản phẩm:' }}
          <span class="font-medium text-primary-600 dark:text-primary-400">{{ productName }}</span>
        </p>

        <UFormGroup :label="t('priceRequest.fullName') || 'Họ tên'" required :error="errors.fullName">
          <UInput
            v-model="fullName"
            :placeholder="t('priceRequest.fullNamePlaceholder') || 'Nhập họ tên của bạn'"
            :error="!!errors.fullName"
          />
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.email') || 'Email'" required :error="errors.email">
          <UInput
            v-model="email"
            type="email"
            :placeholder="t('priceRequest.emailPlaceholder') || 'Nhập email của bạn'"
            :error="!!errors.email"
          />
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.phone') || 'Số điện thoại'" required :error="errors.phone">
          <UInput
            v-model="phone"
            :placeholder="t('priceRequest.phonePlaceholder') || 'Nhập số điện thoại của bạn'"
            :error="!!errors.phone"
          />
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.message') || 'Lời nhắn'">
          <UTextarea
            v-model="message"
            :placeholder="t('priceRequest.messagePlaceholder') || 'Nhập lời nhắn của bạn (không bắt buộc)'"
            rows="3"
          />
        </UFormGroup>
      </form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            v-if="!submitSuccess"
            color="gray"
            variant="soft"
            @click="closeModal"
          >
            {{ t('priceRequest.cancel') || 'Hủy' }}
          </UButton>
          <UButton
            v-if="!submitSuccess"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="submitForm"
          >
            {{ t('priceRequest.submit') || 'Gửi yêu cầu' }}
          </UButton>
          <UButton
            v-else
            color="primary"
            @click="closeModal"
          >
            {{ t('priceRequest.close') || 'Đóng' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template> 