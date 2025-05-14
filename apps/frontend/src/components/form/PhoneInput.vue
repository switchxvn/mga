<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { useTrpc } from '~/composables/useTrpc';
import { ChevronDown, Search } from 'lucide-vue-next';
import { parsePhoneNumberFromString, AsYouType, getCountryCallingCode, isValidPhoneNumber } from 'libphonenumber-js';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';

const props = defineProps<{
  modelValue: string;
  phoneCode: string;
  error?: boolean | string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  validateOnInput?: boolean;
  showErrorMessage?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:phoneCode', value: string): void;
  (e: 'validation', value: { valid: boolean; message?: string }): void;
  (e: 'blur'): void;
}>();

const { t } = useLocalization();
const trpc = useTrpc();

// Refs
const phoneNumber = ref(props.modelValue || '');
const selectedPhoneCode = ref(props.phoneCode || '+84'); // Default to Vietnam
const countryPhoneCodes = ref<Array<{
  phoneCode: string;
  countryCode: string;
  countryName: string;
  flagIcon: string;
}>>([]);
const isLoadingCountries = ref(false);
const showPhoneCodeDropdown = ref(false);
const countrySearchQuery = ref('');
const validationMessage = ref('');

// Tạo quy tắc xác thực tùy chỉnh cho số điện thoại
const isValidPhoneNumberRule = (value: string) => {
  if (!value) return true;
  
  const countryCode = getCountryCodeFromPhoneCode(selectedPhoneCode.value);
  if (!countryCode) return true; // Nếu không có mã quốc gia, bỏ qua xác thực
  
  try {
    // Thêm mã quốc gia vào số điện thoại nếu chưa có
    let phoneWithCode = value;
    if (!phoneWithCode.startsWith('+')) {
      phoneWithCode = `${selectedPhoneCode.value}${value}`;
    }
    
    // Kiểm tra số điện thoại có hợp lệ không
    // Sử dụng try-catch vì isValidPhoneNumber có thể ném lỗi với một số định dạng không hợp lệ
    try {
      // @ts-ignore - Bỏ qua lỗi TypeScript vì chúng ta biết countryCode là string
      return isValidPhoneNumber(phoneWithCode, countryCode);
    } catch (e) {
      console.error('Error validating phone number format:', e);
      return false;
    }
  } catch (error) {
    console.error('Error validating phone number:', error);
    return false;
  }
};

// Định nghĩa quy tắc xác thực
const rules = computed(() => {
  const phoneRules: any = {};
  
  // Chỉ thêm quy tắc validPhone, không thêm quy tắc required
  // Việc kiểm tra required sẽ được xử lý ở component cha
  phoneRules.validPhone = helpers.withMessage(
    t('validation.phoneInvalid') || 'Số điện thoại không hợp lệ',
    isValidPhoneNumberRule
  );
  
  return {
    phoneNumber: phoneRules
  };
});

// Tạo đối tượng Vuelidate
const state = reactive({
  phoneNumber: phoneNumber
});

const v$ = useVuelidate(rules, state);

// Computed
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

// Lấy mã quốc gia từ mã điện thoại
const getCountryCodeFromPhoneCode = (phoneCode: string): string | undefined => {
  const country = countryPhoneCodes.value.find(c => c.phoneCode === phoneCode);
  return country?.countryCode;
};

// Định dạng số điện thoại khi nhập
const formatPhoneNumber = (value: string, countryCode?: string) => {
  if (!value) return '';
  
  // Xử lý đặc biệt cho số điện thoại Việt Nam
  if (countryCode === 'VN' && value.startsWith('0')) {
    value = value.substring(1); // Bỏ số 0 đầu tiên
  }
  
  // Sử dụng AsYouType để định dạng số điện thoại theo chuẩn quốc tế
  if (countryCode) {
    try {
      // @ts-ignore - Bỏ qua lỗi TypeScript vì chúng ta biết countryCode là string
      const formatter = new AsYouType(countryCode);
      return formatter.input(value);
    } catch (e) {
      console.error('Error formatting phone number:', e);
      return value;
    }
  }
  
  return value;
};

// Chuẩn hóa số điện thoại khi submit
const normalizePhoneNumber = (value: string, phoneCode: string): string => {
  if (!value) return '';
  
  // Loại bỏ số 0 đầu tiên nếu có
  if (value.startsWith('0')) {
    value = value.substring(1);
  }
  
  // Loại bỏ tất cả các ký tự không phải số
  value = value.replace(/\D/g, '');
  
  return value;
};

// Xác thực số điện thoại
const validatePhoneNumber = async () => {
  // Nếu không có giá trị, không cần validate
  if (!phoneNumber.value.trim()) {
    emit('validation', { valid: true });
    return true;
  }
  
  const result = await v$.value.$validate();
  const errors = v$.value.phoneNumber.$errors;
  
  if (!result && errors.length > 0) {
    validationMessage.value = errors[0].$message as string;
    emit('validation', { valid: false, message: validationMessage.value });
    return false;
  } else {
    validationMessage.value = '';
    emit('validation', { valid: true });
    return true;
  }
};

// Xử lý khi người dùng nhập số điện thoại
const handlePhoneNumberInput = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value;
  
  // Lấy mã quốc gia từ mã điện thoại
  const countryCode = getCountryCodeFromPhoneCode(selectedPhoneCode.value);
  
  // Tự động xóa số 0 đầu tiên cho số điện thoại Việt Nam
  if (countryCode === 'VN' && value.startsWith('0')) {
    value = value.substring(1);
    // Cập nhật lại giá trị trong input field
    input.value = value;
  }
  
  // Định dạng số điện thoại
  const formattedValue = formatPhoneNumber(value, countryCode);
  
  // Cập nhật giá trị
  phoneNumber.value = formattedValue;
  
  // Emit giá trị đã chuẩn hóa
  const normalizedValue = normalizePhoneNumber(formattedValue, selectedPhoneCode.value);
  emit('update:modelValue', normalizedValue);
  
  // Xác thực nếu cần - chỉ khi validateOnInput = true
  if (props.validateOnInput) {
    await validatePhoneNumber();
  }
};

// Fetch country phone codes
const fetchCountryPhoneCodes = async () => {
  if (countryPhoneCodes.value.length > 0) return;
  
  isLoadingCountries.value = true;
  try {
    const result = await trpc.common.getCountryPhoneCodes.query();
    countryPhoneCodes.value = result;
    
    // Set default to Vietnam if available, otherwise use the first one
    if (selectedPhoneCode.value === '+84') {
      const vietnam = result.find((c: any) => c.countryCode === 'VN');
      if (vietnam) {
        selectedPhoneCode.value = vietnam.phoneCode;
        emit('update:phoneCode', vietnam.phoneCode);
      } else if (result.length > 0) {
        selectedPhoneCode.value = result[0].phoneCode;
        emit('update:phoneCode', result[0].phoneCode);
      }
    }
  } catch (error) {
    console.error('Error fetching country phone codes:', error);
  } finally {
    isLoadingCountries.value = false;
  }
};

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
  // Nếu mã quốc gia thay đổi, định dạng lại số điện thoại
  if (selectedPhoneCode.value !== phoneCode) {
    selectedPhoneCode.value = phoneCode;
    emit('update:phoneCode', phoneCode);
    
    // Định dạng lại số điện thoại với mã quốc gia mới
    const countryCode = getCountryCodeFromPhoneCode(phoneCode);
    if (phoneNumber.value && countryCode) {
      const formattedValue = formatPhoneNumber(phoneNumber.value, countryCode);
      phoneNumber.value = formattedValue;
      
      // Emit giá trị đã chuẩn hóa
      const normalizedValue = normalizePhoneNumber(formattedValue, phoneCode);
      emit('update:modelValue', normalizedValue);
    }
  }
  
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

// Watch for changes in props.modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== phoneNumber.value) {
    // Lấy mã quốc gia từ mã điện thoại
    const countryCode = getCountryCodeFromPhoneCode(selectedPhoneCode.value);
    
    // Định dạng số điện thoại
    const formattedValue = formatPhoneNumber(newValue, countryCode);
    phoneNumber.value = formattedValue;
  }
});

// Watch for changes in props.phoneCode
watch(() => props.phoneCode, (newValue) => {
  if (newValue !== selectedPhoneCode.value) {
    selectedPhoneCode.value = newValue;
    
    // Định dạng lại số điện thoại với mã quốc gia mới
    const countryCode = getCountryCodeFromPhoneCode(newValue);
    if (phoneNumber.value && countryCode) {
      const formattedValue = formatPhoneNumber(phoneNumber.value, countryCode);
      phoneNumber.value = formattedValue;
    }
  }
});

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', closeDropdownOnClickOutside);
  fetchCountryPhoneCodes();
});

// Cleanup
onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnClickOutside);
});

// Expose validate method
defineExpose({
  validate: validatePhoneNumber,
  v$
});
</script>

<template>
  <div class="phone-input-container">
    <div class="flex">
      <div class="phone-code-selector relative">
        <button 
          type="button" 
          @click="togglePhoneCodeDropdown" 
          :disabled="disabled"
          class="flex h-[42px] items-center gap-2 border rounded-l-md px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          :class="[
            disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
            error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]"
        >
          <img 
            v-if="selectedCountry?.flagIcon" 
            :src="selectedCountry.flagIcon" 
            :alt="selectedCountry.countryName" 
            class="w-5 h-auto"
          />
          <span>{{ selectedPhoneCode }}</span>
          <ChevronDown :size="16" />
        </button>
        
        <div 
          v-if="showPhoneCodeDropdown" 
          class="absolute z-50 mt-1 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div v-if="isLoadingCountries" class="p-3 text-center text-gray-500 dark:text-gray-400">
            {{ t('priceRequest.loadingCountries') }}
          </div>
          <div v-else>
            <!-- Thêm ô tìm kiếm -->
            <div class="p-2 border-b dark:border-gray-700">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search :size="16" class="text-gray-400" />
                </div>
                <input
                  id="country-search-input"
                  v-model="countrySearchQuery"
                  type="text"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  :placeholder="t('priceRequest.searchCountry')"
                />
              </div>
            </div>
            
            <!-- Danh sách quốc gia đã lọc -->
            <div class="py-1 max-h-48 overflow-y-auto">
              <div v-if="filteredCountries.length === 0" class="p-3 text-center text-gray-500 dark:text-gray-400">
                {{ t('priceRequest.noCountriesFound') }}
              </div>
              <button
                v-for="country in filteredCountries"
                :key="country.phoneCode"
                type="button"
                @click="selectPhoneCode(country.phoneCode)"
                class="w-full text-left px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-3"
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
        :placeholder="placeholder || t('priceRequest.phonePlaceholder')"
        :error="!!error"
        :size="size || 'md'"
        :disabled="disabled"
        class="flex-1 rounded-l-none"
        type="tel"
        @input="handlePhoneNumberInput"
        @blur="$emit('blur'); validatePhoneNumber()"
      />
    </div>
    
    <!-- Hiển thị thông báo lỗi chỉ khi showErrorMessage = true -->
    <div v-if="showErrorMessage && v$.$error && validationMessage" class="text-red-500 text-sm mt-1">
      {{ validationMessage }}
    </div>
  </div>
</template>

<style scoped>
.phone-input-container {
  width: 100%;
}

/* Đảm bảo chiều cao đồng nhất */
.phone-code-selector button {
  height: 38px;
  display: flex;
  align-items: center;
  border-right: none;
}

/* Đảm bảo UInput có chiều cao đồng nhất */
:deep(.u-input) {
  height: 42px !important;
}

/* CSS cho ô tìm kiếm quốc gia */
.phone-code-selector .max-h-48 {
  max-height: 12rem;
}

.phone-code-selector input:focus {
  box-shadow: 0 0 0 2px rgba(var(--primary-500, var(--primary)), 0.2);
}

.dark .phone-code-selector input:focus {
  box-shadow: 0 0 0 2px rgba(var(--primary-500, var(--primary)), 0.2);
}
</style> 