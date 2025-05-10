<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PrinterIcon } from 'lucide-vue-next';

const { t } = useI18n();

// Props
const props = defineProps<{
  show: boolean;
  ticket: any;
  isPrinting: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'print', size: string): void;
}>();

// Local state
const selectedPrintSize = ref('XP_PRINTER');

// Print sizes
const printSizes = [
  { id: 'XP_PRINTER', name: 'Máy in XP', width: '72mm', height: '297mm', description: 'Khổ máy in XP (72mm)' },
  { id: 'A4', name: 'A4', width: '210mm', height: '297mm', description: 'Khổ tiêu chuẩn A4' },
  { id: 'A5', name: 'A5', width: '148mm', height: '210mm', description: 'Khổ nhỏ A5 (nửa A4)' },
  { id: 'TICKET', name: 'Vé nhỏ', width: '80mm', height: '180mm', description: 'Khổ vé nhỏ' },
  { id: 'LABEL', name: 'Nhãn vé', width: '50mm', height: '30mm', description: 'Nhãn vé nhỏ' }
];

// Methods
const closeModal = () => {
  emit('close');
};

const handlePrint = () => {
  emit('print', selectedPrintSize.value);
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 m-4">
      <div class="flex items-start justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ t('In vé') }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
          <span class="sr-only">Close</span>
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="mb-6">
        <p class="text-sm text-gray-600 mb-4">
          {{ t('Chọn kích thước vé muốn in. Vui lòng đảm bảo máy in và khổ giấy được cài đặt phù hợp.') }}
        </p>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div 
            v-for="size in printSizes" 
            :key="size.id"
            :class="[
              'border rounded-lg p-4 cursor-pointer',
              selectedPrintSize === size.id 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            ]"
            @click="selectedPrintSize = size.id"
          >
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-bold">{{ size.name }}</h4>
              <div 
                :class="[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  selectedPrintSize === size.id
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                ]"
              >
                <i v-if="selectedPrintSize === size.id" class="fas fa-check text-white text-xs"></i>
              </div>
            </div>
            <p class="text-xs text-gray-500">{{ size.width }} x {{ size.height }}</p>
            <p v-if="size.description" class="text-xs text-gray-600 mt-1">{{ size.description }}</p>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-lightbulb text-yellow-600"></i>
            </div>
            <div class="ml-3">
              <h4 class="font-medium">{{ t('Lưu ý khi in:') }}</h4>
              <ul class="mt-1 list-disc pl-5 space-y-1">
                <li>{{ t('Đảm bảo máy in được kết nối và cài đặt đúng') }}</li>
                <li>{{ t('Kiểm tra khổ giấy trong máy in trước khi in') }}</li>
                <li>{{ t('Sử dụng khổ A4 để in vé đầy đủ thông tin') }}</li>
                <li>{{ t('Khổ nhỏ sẽ in ít thông tin hơn nhưng tiết kiệm giấy') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ t('Hủy') }}
        </button>
        
        <button
          @click="handlePrint"
          class="px-4 py-2 bg-green-600 border border-transparent rounded-md font-bold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          :disabled="isPrinting"
        >
          <span v-if="isPrinting">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            {{ t('Đang in...') }}
          </span>
          <span v-else>
            <i class="fas fa-print mr-2"></i>
            {{ t('In vé') }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template> 