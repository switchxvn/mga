<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="text-lg font-medium">Lịch sử tồn kho của {{ variant.options ? Object.values(variant.options).join(' / ') : 'Biến thể' }}</h3>
        <button @click="$emit('close')" class="text-slate-500 hover:text-slate-700">
          <XIcon class="h-5 w-5" />
        </button>
      </div>
      
      <div class="p-6 overflow-y-auto flex-1">
        <!-- Stock adjustment form -->
        <div class="mb-6 bg-slate-50 p-4 rounded-lg">
          <h4 class="text-md font-medium mb-4">Điều chỉnh tồn kho</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="block text-sm font-medium text-slate-700 mb-1">Số lượng hiện tại</label>
              <div class="bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-700">
                {{ variant.quantity || variant.stock || 0 }}
              </div>
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium text-slate-700 mb-1">Điều chỉnh</label>
              <input 
                type="number" 
                :value="adjustmentQuantity"
                @input="$emit('update:adjustment-quantity', Number(($event.target as HTMLInputElement).value))"
                class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Nhập giá trị dương hoặc âm"
              >
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
              <input 
                type="text" 
                :value="adjustmentNote"
                @input="$emit('update:adjustment-note', ($event.target as HTMLInputElement).value)"
                class="block w-full rounded-md border-slate-300 focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Lý do điều chỉnh"
              >
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
            <button 
              @click="$emit('apply-adjustment')" 
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              :disabled="adjustmentQuantity === 0 || !variant.id || loading"
            >
              Áp dụng điều chỉnh
            </button>
          </div>
        </div>
        
        <!-- Stock history table -->
        <div>
          <h4 class="text-md font-medium mb-4">Lịch sử thay đổi tồn kho</h4>
          
          <div v-if="loading" class="flex justify-center py-8">
            <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div v-else-if="!history.length" class="text-center py-8 text-slate-500">
            <div v-if="variant.id">
              Không tìm thấy lịch sử tồn kho cho biến thể này.
            </div>
            <div v-else>
              Lịch sử tồn kho sẽ có sau khi tạo sản phẩm.
            </div>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ngày & Giờ
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Trước
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Thay đổi
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mới
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tham chiếu
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="item in history" :key="item.id" class="hover:bg-slate-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {{ formatDate(item.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span :class="getTypeClass(item.adjustmentType)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ getTypeLabel(item.adjustmentType) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {{ item.quantityBefore }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span :class="item.adjustmentQuantity > 0 ? 'text-green-600' : 'text-red-600'">
                      {{ item.adjustmentQuantity > 0 ? '+' : '' }}{{ item.adjustmentQuantity }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {{ item.quantityAfter }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 max-w-xs truncate">
                    {{ item.note || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <a v-if="item.referenceType === 'order' && item.referenceId" 
                        :href="`/orders/${item.referenceId}`" 
                        class="text-primary hover:underline">
                      Đơn hàng #{{ item.referenceId }}
                    </a>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t flex justify-end">
        <button @click="$emit('close')" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';
import { XIcon } from 'lucide-vue-next';
import { ProductVariant } from '@shared/lib/interfaces/product-variant.interface';

defineProps<{
  variant: ProductVariant;
  loading: boolean;
  history: any[];
  adjustmentQuantity: number;
  adjustmentNote: string;
}>();

defineEmits<{
  'close': [];
  'apply-adjustment': [];
  'update:adjustment-quantity': [value: number];
  'update:adjustment-note': [value: string];
}>();

// Format date
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return dateString;
  }
};

// Get adjustment type label
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'ADMIN_ADJUSTMENT': 'Điều chỉnh bởi Admin',
    'CUSTOMER_ORDER': 'Đơn hàng khách',
    'REFUND': 'Hoàn tiền',
    'INVENTORY_CHECK': 'Kiểm kê kho',
    'RETURN': 'Trả hàng',
    'DAMAGED': 'Hàng hỏng',
    'INITIAL_STOCK': 'Tồn kho ban đầu'
  };
  
  return labels[type] || type;
};

// Get class for adjustment type
const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    'ADMIN_ADJUSTMENT': 'bg-blue-100 text-blue-800',
    'CUSTOMER_ORDER': 'bg-red-100 text-red-800',
    'REFUND': 'bg-green-100 text-green-800',
    'INVENTORY_CHECK': 'bg-purple-100 text-purple-800',
    'RETURN': 'bg-amber-100 text-amber-800',
    'DAMAGED': 'bg-rose-100 text-rose-800',
    'INITIAL_STOCK': 'bg-slate-100 text-slate-800'
  };
  
  return classes[type] || 'bg-slate-100 text-slate-800';
};
</script> 