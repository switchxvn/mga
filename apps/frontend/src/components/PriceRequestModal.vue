<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useLocalization } from '../composables/useLocalization';
import { useTrpc } from '../composables/useTrpc';
import { X, Check, Send, ChevronDown, Search } from 'lucide-vue-next';

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
const phoneNumber = ref('');
const selectedPhoneCode = ref('+84'); // Default to Vietnam
const message = ref('');

// Country phone codes
const countryPhoneCodes = ref<Array<{
  phoneCode: string;
  countryCode: string;
  countryName: string;
  flagIcon: string;
}>>([]);

const isLoadingCountries = ref(false);
const showPhoneCodeDropdown = ref(false);
const countrySearchQuery = ref(''); // Thêm biến để lưu trữ từ khóa tìm kiếm

// Form validation
const errors = ref({
  fullName: '',
  email: '',
  phoneNumber: '',
});

// Form submission
const isSubmitting = ref(false);
const submitSuccess = ref(false);

// Fetch country phone codes
const fetchCountryPhoneCodes = async () => {
  isLoadingCountries.value = true;
  try {
    const result = await trpc.common.getCountryPhoneCodes.query();
    countryPhoneCodes.value = result;
    
    // Set default to Vietnam if available, otherwise use the first one
    const vietnam = result.find(c => c.countryCode === 'VN');
    if (vietnam) {
      selectedPhoneCode.value = vietnam.phoneCode;
    } else if (result.length > 0) {
      selectedPhoneCode.value = result[0].phoneCode;
    }
  } catch (error) {
    console.error('Error fetching country phone codes:', error);
  } finally {
    isLoadingCountries.value = false;
  }
};

// Get selected country
const selectedCountry = computed(() => {
  return countryPhoneCodes.value.find(c => c.phoneCode === selectedPhoneCode.value);
});

// Lọc danh sách quốc gia theo từ khóa tìm kiếm
const filteredCountries = computed(() => {
  if (!countrySearchQuery.value) return countryPhoneCodes.value;
  
  const query = countrySearchQuery.value.toLowerCase();
  return countryPhoneCodes.value.filter(country => 
    country.countryName.toLowerCase().includes(query) || 
    country.phoneCode.includes(query) ||
    country.countryCode.toLowerCase().includes(query)
  );
});

// Toggle phone code dropdown
const togglePhoneCodeDropdown = () => {
  showPhoneCodeDropdown.value = !showPhoneCodeDropdown.value;
  if (showPhoneCodeDropdown.value) {
    // Reset search query when opening dropdown
    countrySearchQuery.value = '';
    // Focus vào ô tìm kiếm sau khi dropdown mở
    setTimeout(() => {
      const searchInput = document.getElementById('country-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }
};

// Select phone code
const selectPhoneCode = (phoneCode: string) => {
  selectedPhoneCode.value = phoneCode;
  showPhoneCodeDropdown.value = false;
  countrySearchQuery.value = ''; // Reset search query after selection
};

// Close dropdown when clicking outside
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.phone-code-selector')) {
    showPhoneCodeDropdown.value = false;
    countrySearchQuery.value = ''; // Reset search query when closing dropdown
  }
};

// Validate form
const validateForm = () => {
  let isValid = true;
  errors.value = {
    fullName: '',
    email: '',
    phoneNumber: '',
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

  if (!phoneNumber.value.trim()) {
    errors.value.phoneNumber = t('priceRequest.phoneRequired') || 'Vui lòng nhập số điện thoại';
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
  email.value = '';
  phoneNumber.value = '';
  message.value = '';
  errors.value = {
    fullName: '',
    email: '',
    phoneNumber: '',
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

// Add event listener for click outside
onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside);
  fetchCountryPhoneCodes();
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
          />
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.email') || 'Email'" required :error="errors.email" class="mb-3" size="md">
          <UInput
            v-model="email"
            type="email"
            :placeholder="t('priceRequest.emailPlaceholder') || 'Nhập email của bạn'"
            :error="!!errors.email"
            size="md"
          />
        </UFormGroup>

        <UFormGroup :label="t('priceRequest.phone') || 'Số điện thoại'" required :error="errors.phoneNumber" class="mb-3" size="md">
          <div class="flex">
            <div class="phone-code-selector relative">
              <button 
                type="button" 
                @click="togglePhoneCodeDropdown" 
                class="flex items-center gap-2 border rounded-l-md px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 h-[42px]"
              >
                <img 
                  v-if="selectedCountry?.flagIcon" 
                  :src="selectedCountry.flagIcon" 
                  :alt="selectedCountry.countryName" 
                  class="w-5 h-auto"
                />
                <span>{{ selectedPhoneCode }}</span>
                <ChevronDown size="16" />
              </button>
              
              <div 
                v-if="showPhoneCodeDropdown" 
                class="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                <div v-if="isLoadingCountries" class="p-3 text-center text-gray-500 dark:text-gray-400">
                  {{ t('priceRequest.loadingCountries') || 'Đang tải...' }}
                </div>
                <div v-else>
                  <!-- Thêm ô tìm kiếm -->
                  <div class="p-2 border-b dark:border-gray-700">
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size="16" class="text-gray-400" />
                      </div>
                      <input
                        id="country-search-input"
                        v-model="countrySearchQuery"
                        type="text"
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        :placeholder="t('priceRequest.searchCountry') || 'Tìm kiếm quốc gia...'"
                      />
                    </div>
                  </div>
                  
                  <!-- Danh sách quốc gia đã lọc -->
                  <div class="py-1 max-h-48 overflow-y-auto">
                    <div v-if="filteredCountries.length === 0" class="p-3 text-center text-gray-500 dark:text-gray-400">
                      {{ t('priceRequest.noCountriesFound') || 'Không tìm thấy quốc gia phù hợp' }}
                    </div>
                    <button
                      v-for="country in filteredCountries"
                      :key="country.phoneCode"
                      type="button"
                      @click="selectPhoneCode(country.phoneCode)"
                      class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                    >
                      <img 
                        v-if="country.flagIcon" 
                        :src="country.flagIcon" 
                        :alt="country.countryName" 
                        class="w-5 h-auto"
                      />
                      <span>{{ country.phoneCode }}</span>
                      <span class="text-gray-500 dark:text-gray-400 text-sm">{{ country.countryName }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <UInput
              v-model="phoneNumber"
              :placeholder="t('priceRequest.phonePlaceholder') || 'Nhập số điện thoại của bạn'"
              :error="!!errors.phoneNumber"
              size="md"
              class="flex-1 rounded-l-none"
            />
          </div>
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

/* Thêm CSS cho ô tìm kiếm quốc gia */
.phone-code-selector .max-h-48 {
  max-height: 12rem;
}

.phone-code-selector input:focus {
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.dark .phone-code-selector input:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style> 