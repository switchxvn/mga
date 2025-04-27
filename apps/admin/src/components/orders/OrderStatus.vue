<template>
  <div class="space-y-6">
    <!-- Order Status -->
    <div class="space-y-1">
      <label for="order_status" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Order Status
      </label>
      <select
        id="order_status"
        v-model="orderStatusModel"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Order Status Timeline -->
    <div class="space-y-2">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Status Timeline</h3>
      
      <div class="mt-2 space-y-6">
        <div class="relative">
          <div class="ml-6 space-y-6">
            <!-- Pending -->
            <div class="relative">
              <div class="flex items-center space-x-4">
                <div class="flex h-5 w-5 items-center justify-center rounded-full" :class="[
                  isActive('pending')
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  <ClockIcon class="h-3 w-3" />
                </div>
                <div>
                  <p class="text-sm font-medium" :class="[
                    isActive('pending')
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  ]">
                    Pending
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Order received, awaiting confirmation
                  </p>
                </div>
              </div>
              <div class="absolute left-2.5 top-5 h-full w-px bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            <!-- Confirmed -->
            <div class="relative">
              <div class="flex items-center space-x-4">
                <div class="flex h-5 w-5 items-center justify-center rounded-full" :class="[
                  isActive('confirmed')
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  <CheckIcon class="h-3 w-3" />
                </div>
                <div>
                  <p class="text-sm font-medium" :class="[
                    isActive('confirmed')
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  ]">
                    Confirmed
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Order confirmed, preparing for processing
                  </p>
                </div>
              </div>
              <div class="absolute left-2.5 top-5 h-full w-px bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            <!-- Processing -->
            <div class="relative">
              <div class="flex items-center space-x-4">
                <div class="flex h-5 w-5 items-center justify-center rounded-full" :class="[
                  isActive('processing')
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  <CogIcon class="h-3 w-3" />
                </div>
                <div>
                  <p class="text-sm font-medium" :class="[
                    isActive('processing')
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  ]">
                    Processing
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Order is being processed and packed
                  </p>
                </div>
              </div>
              <div class="absolute left-2.5 top-5 h-full w-px bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            <!-- Shipped -->
            <div class="relative">
              <div class="flex items-center space-x-4">
                <div class="flex h-5 w-5 items-center justify-center rounded-full" :class="[
                  isActive('shipped')
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  <TruckIcon class="h-3 w-3" />
                </div>
                <div>
                  <p class="text-sm font-medium" :class="[
                    isActive('shipped')
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  ]">
                    Shipped
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Order has been shipped
                  </p>
                </div>
              </div>
              <div class="absolute left-2.5 top-5 h-full w-px bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            <!-- Delivered -->
            <div class="relative">
              <div class="flex items-center space-x-4">
                <div class="flex h-5 w-5 items-center justify-center rounded-full" :class="[
                  isActive('delivered')
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-300'
                ]">
                  <PackageIcon class="h-3 w-3" />
                </div>
                <div>
                  <p class="text-sm font-medium" :class="[
                    isActive('delivered')
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  ]">
                    Delivered
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Order has been delivered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Notes -->
    <div class="space-y-1">
      <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Order Notes
      </label>
      <textarea
        id="notes"
        v-model="notesModel"
        rows="3"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        placeholder="Add notes about this order"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  ClockIcon, 
  CheckIcon, 
  CogIcon, 
  TruckIcon, 
  PackageIcon 
} from 'lucide-vue-next';

const props = defineProps({
  orderStatus: {
    type: String,
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'update:orderStatus',
  'update:notes'
]);

// Two-way binding
const orderStatusModel = computed({
  get: () => props.orderStatus,
  set: (value) => emit('update:orderStatus', value)
});

const notesModel = computed({
  get: () => props.notes,
  set: (value) => emit('update:notes', value)
});

// Check if a status is active or completed
const isActive = (status: string) => {
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(orderStatusModel.value);
  const statusIndex = statusOrder.indexOf(status);
  
  if (orderStatusModel.value === 'cancelled') {
    return status === 'cancelled';
  }
  
  return statusIndex <= currentIndex;
};
</script> 