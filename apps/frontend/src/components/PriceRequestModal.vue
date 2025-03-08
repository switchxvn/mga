<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useLocalization } from '../composables/useLocalization';
import { useTrpc } from '../composables/useTrpc';
import { X, Check, Send } from 'lucide-vue-next';
import PhoneInput from './form/PhoneInput.vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, helpers } from '@vuelidate/validators';

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
const emailValue = ref('');
const phoneNumber = ref('');
const selectedPhoneCode = ref('+84'); // Default to Vietnam
const message = ref('');

// Form validation
const errors = ref({
  fullName: '',
  email: '',
  phoneNumber: '',
});

// Phone validation state
const phoneValidation = ref({
  valid: true,
  message: ''
});

// Form submission
const isSubmitting = ref(false);
const submitSuccess = ref(false);

// Tham chiếu đến component PhoneInput
const phoneInputRef = ref(null);

// Định nghĩa quy tắc xác thực
const rules = computed(() => {
  return {
    fullName: { 
      required: helpers.withMessage(
        t('priceRequest.fullNameRequired') || 'Vui lòng nhập họ tên',
        required
      ) 
    },
    emailValue: { 
      required: helpers.withMessage(
        t('priceRequest.emailRequired') || 'Vui lòng nhập email',
        required
      ),
      email: helpers.withMessage(
        t('priceRequest.emailInvalid') || 'Email không hợp lệ',
        email
      )
    }
    // Loại bỏ validation cho phoneNumber ở đây, sẽ xử lý riêng
  };
});

// Tạo đối tượng Vuelidate
const v$ = useVuelidate(rules, { fullName, emailValue });

// Xử lý khi nhận kết quả xác thực từ PhoneInput
const handlePhoneValidation = (result: { valid: boolean; message?: string }) => {
  // Chỉ lưu trạng thái validation, không hiển thị lỗi ngay
  phoneValidation.value = result;
};

// Add new method to validate phone field
const validatePhoneField = async () => {
  // Reset thông báo lỗi
  errors.value.phoneNumber = '';
  
  // Kiểm tra xem số điện thoại có được nhập không
  if (!phoneNumber.value.trim()) {
    errors.value.phoneNumber = t('priceRequest.phoneRequired') || 'Vui lòng nhập số điện thoại';
    return false;
  }
  
  // Xác thực số điện thoại
  let isPhoneValid = true;
  if (phoneInputRef.value) {
    isPhoneValid = await phoneInputRef.value.validate();
  }
  
  // Cập nhật thông báo lỗi cho số điện thoại
  if (!isPhoneValid && phoneValidation.value && !phoneValidation.value.valid) {
    errors.value.phoneNumber = phoneValidation.value.message || t('priceRequest.phoneInvalid') || 'Số điện thoại không hợp lệ';
  }
  
  return isPhoneValid;
};

// Validate fullName field
const validateFullNameField = async () => {
  // Reset thông báo lỗi
  errors.value.fullName = '';
  
  // Xác thực trường họ tên
  await v$.value.fullName.$validate();
  
  // Cập nhật thông báo lỗi nếu có
  if (v$.value.fullName.$error) {
    errors.value.fullName = v$.value.fullName.$errors[0].$message;
    return false;
  }
  
  return true;
};

// Validate email field
const validateEmailField = async () => {
  // Reset thông báo lỗi
  errors.value.email = '';
  
  // Xác thực trường email
  await v$.value.emailValue.$validate();
  
  // Cập nhật thông báo lỗi nếu có
  if (v$.value.emailValue.$error) {
    errors.value.email = v$.value.emailValue.$errors[0].$message;
    return false;
  }
  
  return true;
};

// Validate form
const validateForm = async () => {
  // Reset thông báo lỗi
  errors.value = {
    fullName: '',
    email: '',
    phoneNumber: '',
  };
  
  // Xác thực từng trường riêng biệt
  const isFullNameValid = await validateFullNameField();
  const isEmailValid = await validateEmailField();
  const isPhoneValid = await validatePhoneField();
  
  return isFullNameValid && isEmailValid && isPhoneValid;
};

// Submit form
const submitForm = async () => {
  const isValid = await validateForm();
  if (!isValid) return;

  isSubmitting.value = true;

  try {
    await trpc.priceRequest.create.mutate({
      fullName: fullName.value,
      email: emailValue.value,
      phone: `${selectedPhoneCode.value} ${phoneNumber.value}`,
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
  emailValue.value = '';
  phoneNumber.value = '';
  message.value = '';
  errors.value = {
    fullName: '',
    email: '',
    phoneNumber: '',
  };
  phoneValidation.value = {
    valid: true,
    message: ''
  };
  submitSuccess.value = false;
  
  // Reset validation
  v$.value.$reset();
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

// Debug log khi props.isOpen thay đổi
watch(() => props.isOpen, (newValue) => {
  console.log('Modal isOpen changed:', newValue);
});

</script>

<template>
  <UModal 
    :model-value="isOpen" 
    @close="closeModal"
    :prevent-close="isSubmitting"
    :overlay="true"
    :close-on-escape="!isSubmitting"
    :transition="false"
    class="price-request-modal"
    :ui="{
      overlay: {
        background: 'bg-gray-900/75 backdrop-blur-sm dark:bg-gray-900/90',
        position: 'fixed inset-0 z-[9998]'
      },
      container: {
        position: 'fixed inset-0 z-[9999] overflow-auto p-4',
        display: 'flex items-center justify-center'
      },
      dialog: {
        position: 'relative z-[10000] w-[390px] mx-auto',
        background: 'bg-white dark:bg-gray-800',
        rounded: 'rounded-lg',
        shadow: 'shadow-xl',
        width: 'w-[390px]',
        height: 'max-h-[90vh] overflow-auto'
      }
    }"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 max-h-[90vh] overflow-auto w-[390px]">
      <div class="flex items-center justify-between mb-5 border-b pb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          {{ modalTitle }}
        </h3>
        <button 
          @click="closeModal" 
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          <X size="20" />
        </button>
      </div>

      <div v-if="submitSuccess" class="text-center py-5">
        <Check class="h-16 w-16 text-green-500 mx-auto mb-4" />
        <p class="text-lg font-medium text-gray-900 dark:text-white mb-3">
          {{ t('priceRequest.successMessage') || 'Yêu cầu báo giá đã được gửi thành công!' }}
        </p>
        <p class="text-base text-gray-600 dark:text-gray-400">
          {{ t('priceRequest.successDescription') || 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.' }}
        </p>
      </div>

      <form v-else @submit.prevent="submitForm" class="space-y-4">
        <p class="text-base text-gray-600 dark:text-gray-400 mb-4">
          {{ t('priceRequest.description') || 'Vui lòng điền thông tin để nhận báo giá cho sản phẩm:' }}
          <span class="font-medium text-primary-600 dark:text-primary-400">{{ productName }}</span>
        </p>

        <UFormGroup :label="t('priceRequest.fullName') || 'Họ tên'" required :error="errors.fullName" class="mb-3" size="md">
          <UInput
            v-model="fullName"
            :placeholder="t('priceRequest.fullNamePlaceholder') || 'Nhập họ tên của bạn'"
            :error="!!errors.fullName"
            size="md"
            @blur="validateFullNameField"
          />
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.email') || 'Email'" required :error="errors.email" class="mb-3" size="md">
          <UInput
            v-model="emailValue"
            type="email"
            :placeholder="t('priceRequest.emailPlaceholder') || 'Nhập email của bạn'"
            :error="!!errors.email"
            size="md"
            @blur="validateEmailField"
          />
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.phone') || 'Số điện thoại'" required :error="errors.phoneNumber" class="mb-3" size="md">
          <PhoneInput
            ref="phoneInputRef"
            v-model="phoneNumber"
            v-model:phoneCode="selectedPhoneCode"
            :error="!!errors.phoneNumber"
            size="md"
            required
            :validateOnInput="false"
            :showErrorMessage="false"
            @validation="handlePhoneValidation"
            @blur="validatePhoneField"
          />
          
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.message') || 'Lời nhắn'" class="mb-3" size="md">
          <UTextarea
            v-model="message"
            :placeholder="t('priceRequest.messagePlaceholder') || 'Nhập lời nhắn của bạn (không bắt buộc)'"
            rows="4"
            size="md"
          />
        </UFormGroup>
      </form>

      <div class="flex justify-end gap-3 mt-5 pt-4 border-t">
        <button
          v-if="!submitSuccess"
          @click="closeModal"
          class="button-cancel flex items-center gap-2"
          type="button"
        >
          <X size="18" />
          {{ t('priceRequest.cancel') || 'Hủy' }}
        </button>
        <button
          v-if="!submitSuccess"
          @click="submitForm"
          class="button-submit flex items-center gap-2"
          :disabled="isSubmitting"
          type="button"
        >
          <Send size="18" />
          {{ t('priceRequest.submit') || 'Gửi yêu cầu' }}
        </button>
        <button
          v-else
          @click="closeModal"
          class="button-close flex items-center gap-2"
          type="button"
        >
          <Check size="18" />
          {{ t('priceRequest.close') || 'Đóng' }}
        </button>
      </div>
    </div>
  </UModal>
</template>

<style>
/* Thêm CSS toàn cục cho modal */
.price-request-modal [id^="headlessui-dialog-panel"],
.price-request-modal [class*="headlessui-dialog-panel"] {
  width: 390px !important;
  max-width: 390px !important;
  margin: 0 auto !important;
}

.u-modal {
  z-index: 9999 !important;
}

.u-modal-overlay {
  z-index: 9998 !important;
  position: fixed !important;
  inset: 0 !important;
  background-color: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(2px) !important;
}

.u-modal-container {
  z-index: 9999 !important;
  position: fixed !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow-y: auto !important;
  min-height: 100vh !important;
}

.u-modal-content {
  z-index: 10000 !important;
  position: relative !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  background-color: white !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  width: 390px !important;
  max-width: 390px !important;
  margin: 0 auto !important;
}

/* Điều chỉnh trực tiếp cho headlessui-dialog-panel */
:deep([id^="headlessui-dialog-panel"]) {
  width: 390px !important;
  max-width: 390px !important;
  margin: 0 auto !important;
}

/* Điều chỉnh cho tất cả các phần tử có thể là dialog panel */
:deep(.headlessui-dialog-panel),
:deep([class*="headlessui-dialog-panel"]) {
  width: 390px !important;
  max-width: 390px !important;
  margin: 0 auto !important;
}

body.u-modal-open {
  overflow: auto !important;
  padding-right: 0 !important;
}

/* Thêm style cho các button trong modal */
.button-cancel {
  background-color: #6B7280 !important;
  color: white !important;
  font-weight: 500 !important;
  padding: 0.625rem 1rem !important;
  font-size: 1rem !important;
  border-radius: 0.375rem !important;
  min-width: 90px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease-in-out !important;
}

.button-submit {
  background-color: #2563EB !important; /* Màu primary-600 cụ thể */
  color: white !important;
  font-weight: 500 !important;
  padding: 0.625rem 1rem !important;
  font-size: 1rem !important;
  border-radius: 0.375rem !important;
  min-width: 130px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease-in-out !important;
}

.button-close {
  background-color: #2563EB !important; /* Màu primary-600 cụ thể */
  color: white !important;
  font-weight: 500 !important;
  padding: 0.625rem 1rem !important;
  font-size: 1rem !important;
  border-radius: 0.375rem !important;
  min-width: 90px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease-in-out !important;
}

.dark .button-cancel {
  background-color: #4B5563 !important;
}

.dark .button-submit,
.dark .button-close {
  background-color: #3B82F6 !important; /* Màu primary-500 cụ thể */
}

/* Hover effects */
.button-cancel:hover {
  background-color: #4B5563 !important;
  transform: translateY(-1px) !important;
}

.button-submit:hover,
.button-close:hover {
  background-color: #1D4ED8 !important; /* Màu primary-700 cụ thể */
  transform: translateY(-1px) !important;
}

.dark .button-cancel:hover {
  background-color: #374151 !important;
}

.dark .button-submit:hover,
.dark .button-close:hover {
  background-color: #1E40AF !important; /* Màu primary-800 cụ thể */
}

/* Disabled state */
.button-submit:disabled {
  opacity: 0.7 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* Thêm style cho thông báo lỗi */
.text-red-500 {
  color: #ef4444 !important;
}

.text-sm {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

.mt-1 {
  margin-top: 0.25rem !important;
}
</style> 