<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';
import { X, Check, Send } from 'lucide-vue-next';
import PhoneInput from '~/components/form/PhoneInput.vue';
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
  <div class="price-request-modal">
    <div class="modal-header">
      <h2 class="text-xl font-semibold">{{ t('priceRequest.title') }}</h2>
      <button @click="$emit('close')" class="close-button">
        <X class="w-5 h-5" />
      </button>
    </div>

    <div class="modal-body">
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Form fields -->
        <div class="form-group">
          <label for="fullName" class="form-label">{{ t('priceRequest.fullName') }}</label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            class="form-input"
            :class="{ 'error': errors.fullName }"
            :placeholder="t('priceRequest.fullNamePlaceholder')"
          />
          <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">{{ t('priceRequest.email') }}</label>
          <input
            id="email"
            v-model="emailValue"
            type="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            :placeholder="t('priceRequest.emailPlaceholder')"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone" class="form-label">{{ t('priceRequest.phone') }}</label>
          <PhoneInput
            ref="phoneInputRef"
            v-model:phone="phoneNumber"
            v-model:code="selectedPhoneCode"
            @validation="handlePhoneValidation"
            :class="{ 'error': errors.phoneNumber }"
          />
          <span v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</span>
        </div>

        <div class="form-group">
          <label for="message" class="form-label">{{ t('priceRequest.message') }}</label>
          <textarea
            id="message"
            v-model="message"
            class="form-textarea"
            :placeholder="t('priceRequest.messagePlaceholder')"
            rows="4"
          ></textarea>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting"
          >
            <span v-if="!submitSuccess">
              <Send v-if="!isSubmitting" class="w-5 h-5 mr-2" />
              <span v-else class="loading-spinner"></span>
              {{ t('priceRequest.submit') }}
            </span>
            <span v-else class="success-message">
              <Check class="w-5 h-5 mr-2" />
              {{ t('priceRequest.success') }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.price-request-modal {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.close-button {
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px solid #3b82f6;
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.submit-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  background-color: #3b82f6 !important;
  color: white !important;
  border-radius: 0.375rem !important;
  font-weight: 500 !important;
  transition: background-color 0.2s !important;
  gap: 0.5rem !important;
}

.submit-button:hover {
  background-color: #2563eb !important;
}

.submit-button:disabled {
  opacity: 0.7 !important;
  cursor: not-allowed !important;
}

.loading-spinner {
  display: inline-flex !important;
  width: 1.25rem !important;
  height: 1.25rem !important;
  border: 2px solid currentColor !important;
  border-right-color: transparent !important;
  border-radius: 50% !important;
  animation: spin 0.75s linear infinite !important;
  margin-right: 0.5rem !important;
  vertical-align: middle !important;
}

.success-message {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  gap: 0.5rem !important;
  color: #10b981 !important;
}

/* Thêm style cho icon */
.submit-button svg,
.success-message svg {
  width: 1.25rem !important;
  height: 1.25rem !important;
  flex-shrink: 0 !important;
}

/* Đảm bảo text luôn căn giữa với icon */
.submit-button > span {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  width: 100% !important;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode support */
:root.dark .price-request-modal {
  background: #1f2937;
}

:root.dark .modal-header {
  border-bottom-color: #374151;
}

:root.dark .close-button:hover {
  background-color: #374151;
}

:root.dark .form-input,
:root.dark .form-textarea {
  background-color: #1f2937;
  border-color: #374151;
  color: white;
}

:root.dark .form-input:focus,
:root.dark .form-textarea:focus {
  border-color: #3b82f6;
}
</style> 