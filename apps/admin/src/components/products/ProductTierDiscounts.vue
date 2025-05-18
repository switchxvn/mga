<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h3 class="text-lg font-medium mb-4">{{ t('products.tierDiscounts.title') }}</h3>
    <p class="text-sm text-slate-500 mb-6">{{ t('products.tierDiscounts.description') }}</p>

    <div class="space-y-4">
      <!-- Table for tier discounts -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse" v-if="tierDiscounts.length > 0">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-3 px-4 font-medium text-slate-500">{{ t('products.tierDiscounts.minQuantity') }}</th>
              <th class="text-left py-3 px-4 font-medium text-slate-500">{{ t('products.tierDiscounts.discountPercent') }}</th>
              <th class="text-left py-3 px-4 font-medium text-slate-500">{{ t('products.tierDiscounts.status') }}</th>
              <th class="text-right py-3 px-4 font-medium text-slate-500">{{ t('actions.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="discount in sortedTierDiscounts" :key="discount.id" class="border-b border-slate-100 hover:bg-slate-50">
              <td class="py-3 px-4">{{ discount.minQuantity }}</td>
              <td class="py-3 px-4">{{ discount.discountPercent }}%</td>
              <td class="py-3 px-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="discount.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ discount.isActive ? t('common.active') : t('common.inactive') }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editDiscount(discount)"
                    class="p-1 text-slate-600 hover:text-primary transition-colors"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDeleteDiscount(discount.id)"
                    class="p-1 text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-center py-6 bg-slate-50 rounded-lg">
          <div class="mb-2 text-slate-400">
            <PercentIcon class="w-10 h-10 mx-auto" />
          </div>
          <h4 class="text-sm font-medium text-slate-700 mb-1">{{ t('products.tierDiscounts.empty') }}</h4>
          <p class="text-xs text-slate-500 mb-4">{{ t('products.tierDiscounts.emptyDescription') }}</p>
          <button 
            @click="showAddForm = true"
            class="inline-flex items-center font-medium text-sm text-primary hover:text-primary/80"
          >
            <PlusIcon class="w-4 h-4 mr-1" /> {{ t('products.tierDiscounts.addFirst') }}
          </button>
        </div>
      </div>

      <!-- Add Button -->
      <div v-if="tierDiscounts.length > 0" class="flex justify-end">
        <button 
          @click="showAddForm = true"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-50 h-9 px-3 py-2"
        >
          <PlusIcon class="w-4 h-4 mr-1" /> {{ t('products.tierDiscounts.addDiscount') }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div v-if="showAddForm || showEditForm" class="border border-slate-200 rounded-md p-4 mt-6">
        <h4 class="text-base font-medium mb-4">
          {{ showEditForm ? t('products.tierDiscounts.editDiscount') : t('products.tierDiscounts.addDiscount') }}
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('products.tierDiscounts.minQuantity') }}</label>
            <input 
              v-model="form.minQuantity" 
              type="number" 
              min="1"
              class="w-full rounded-md border border-slate-300 py-2 px-3 text-sm"
              :placeholder="t('products.tierDiscounts.minQuantityPlaceholder')"
            />
            <div v-if="errors.minQuantity" class="text-red-500 text-xs mt-1">{{ errors.minQuantity }}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('products.tierDiscounts.discountPercent') }}</label>
            <div class="relative">
              <input 
                v-model="form.discountPercent" 
                type="number" 
                min="0"
                max="100"
                step="0.01"
                class="w-full rounded-md border border-slate-300 py-2 pl-3 pr-8 text-sm"
                :placeholder="t('products.tierDiscounts.discountPercentPlaceholder')"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
            </div>
            <div v-if="errors.discountPercent" class="text-red-500 text-xs mt-1">{{ errors.discountPercent }}</div>
          </div>
        </div>
        
        <div class="flex items-center space-x-3 mb-4">
          <input 
            v-model="form.isActive" 
            type="checkbox" 
            id="isActive" 
            class="rounded border-slate-300 text-primary focus:ring-primary"
          />
          <label for="isActive" class="text-sm text-slate-700">{{ t('products.tierDiscounts.isActive') }}</label>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelForm"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-50 h-9 px-3 py-2"
          >
            {{ t('actions.cancel') }}
          </button>
          <button 
            @click="saveDiscount"
            :disabled="saving"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-9 px-3 py-2"
          >
            <SaveIcon v-if="!saving" class="w-4 h-4 mr-1" />
            <span v-if="saving" class="animate-spin w-4 h-4 mr-1 border-2 border-white border-r-transparent rounded-full"></span>
            {{ saving ? t('common.saving') : t('actions.save') }}
          </button>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-slate-900 mb-2">{{ t('products.tierDiscounts.confirmDelete') }}</h3>
          <p class="text-slate-500 mb-4">{{ t('products.tierDiscounts.confirmDeleteMessage') }}</p>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="showDeleteConfirm = false"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-50 h-9 px-3 py-2"
            >
              {{ t('actions.cancel') }}
            </button>
            <button 
              @click="deleteDiscount"
              :disabled="deleting"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-white hover:bg-red-600 h-9 px-3 py-2"
            >
              <TrashIcon v-if="!deleting" class="w-4 h-4 mr-1" />
              <span v-if="deleting" class="animate-spin w-4 h-4 mr-1 border-2 border-white border-r-transparent rounded-full"></span>
              {{ deleting ? t('common.deleting') : t('actions.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useTrpc } from '../../composables/useTrpc';
import { useToast } from '../../composables/useToast';
import { useLocalization } from '../../composables/useLocalization';
import { PlusIcon, TrashIcon, PencilIcon, SaveIcon, PercentIcon } from 'lucide-vue-next';

const props = defineProps({
  productId: {
    type: Number,
    default: null
  },
  variantId: {
    type: Number,
    default: null
  },
  isNewProduct: {
    type: Boolean,
    default: false
  }
});

const tierDiscounts = ref<any[]>([]);
const showAddForm = ref(false);
const showEditForm = ref(false);
const showDeleteConfirm = ref(false);
const currentDiscountId = ref<number | null>(null);
const saving = ref(false);
const deleting = ref(false);
const form = ref({
  minQuantity: 0,
  discountPercent: 0,
  isActive: true
});
const errors = ref({
  minQuantity: '',
  discountPercent: ''
});

const trpc = useTrpc();
const toast = useToast();
const { t } = useLocalization();

const sortedTierDiscounts = computed(() => {
  return [...tierDiscounts.value].sort((a, b) => a.minQuantity - b.minQuantity);
});

// Fetch tier discounts when component mounts
onMounted(async () => {
  if (!props.isNewProduct) {
    await loadTierDiscounts();
  }
});

// Watch for changes in productId or variantId
watch(() => props.productId, loadTierDiscounts);
watch(() => props.variantId, loadTierDiscounts);

// Load tier discounts for product or variant
async function loadTierDiscounts() {
  if (props.isNewProduct) return;
  
  try {
    if (props.productId) {
      const result = await trpc.admin.productTierDiscount.getByProductId.query({ productId: props.productId });
      tierDiscounts.value = result;
    } else if (props.variantId) {
      const result = await trpc.admin.productTierDiscount.getByVariantId.query({ variantId: props.variantId });
      tierDiscounts.value = result;
    }
  } catch (error) {
    console.error('Failed to load tier discounts:', error);
    toast.error(t('products.tierDiscounts.loadError'));
  }
}

// Reset form and clear errors
function resetForm() {
  form.value = {
    minQuantity: 0,
    discountPercent: 0,
    isActive: true
  };
  errors.value = {
    minQuantity: '',
    discountPercent: ''
  };
}

// Show edit form with discount data
function editDiscount(discount: any) {
  resetForm();
  form.value = {
    minQuantity: discount.minQuantity,
    discountPercent: parseFloat(discount.discountPercent),
    isActive: discount.isActive
  };
  currentDiscountId.value = discount.id;
  showEditForm.value = true;
  showAddForm.value = false;
}

// Cancel form
function cancelForm() {
  showAddForm.value = false;
  showEditForm.value = false;
  resetForm();
}

// Validate form
function validateForm() {
  let isValid = true;
  errors.value = {
    minQuantity: '',
    discountPercent: ''
  };

  if (!form.value.minQuantity || form.value.minQuantity < 1) {
    errors.value.minQuantity = t('products.tierDiscounts.minQuantityError');
    isValid = false;
  }

  if (form.value.discountPercent < 0 || form.value.discountPercent > 100) {
    errors.value.discountPercent = t('products.tierDiscounts.discountPercentError');
    isValid = false;
  }

  // Check for duplicate min quantity
  const existingDiscount = tierDiscounts.value.find(
    d => d.minQuantity === form.value.minQuantity && d.id !== currentDiscountId.value
  );
  
  if (existingDiscount) {
    errors.value.minQuantity = t('products.tierDiscounts.duplicateQuantityError');
    isValid = false;
  }

  return isValid;
}

// Save discount (create or update)
async function saveDiscount() {
  if (!validateForm()) return;

  saving.value = true;
  try {
    const discountData = {
      minQuantity: form.value.minQuantity,
      discountPercent: form.value.discountPercent,
      isActive: form.value.isActive,
      productId: props.productId,
      productVariantId: props.variantId
    };

    if (showEditForm.value && currentDiscountId.value) {
      // Update existing discount
      await trpc.admin.productTierDiscount.update.mutate({
        id: currentDiscountId.value,
        data: discountData
      });
      toast.success(t('products.tierDiscounts.updateSuccess'));
    } else {
      // Create new discount
      await trpc.admin.productTierDiscount.create.mutate(discountData);
      toast.success(t('products.tierDiscounts.createSuccess'));
    }
    
    // Reload tier discounts
    await loadTierDiscounts();
    
    // Reset form and hide
    cancelForm();
  } catch (error) {
    console.error('Failed to save tier discount:', error);
    toast.error(t('products.tierDiscounts.saveError'));
  } finally {
    saving.value = false;
  }
}

// Confirm discount deletion
function confirmDeleteDiscount(id: number) {
  currentDiscountId.value = id;
  showDeleteConfirm.value = true;
}

// Delete discount
async function deleteDiscount() {
  if (!currentDiscountId.value) return;

  deleting.value = true;
  try {
    await trpc.admin.productTierDiscount.delete.mutate({ id: currentDiscountId.value });
    toast.success(t('products.tierDiscounts.deleteSuccess'));
    
    // Reload tier discounts
    await loadTierDiscounts();
    
    // Hide confirmation dialog
    showDeleteConfirm.value = false;
    currentDiscountId.value = null;
  } catch (error) {
    console.error('Failed to delete tier discount:', error);
    toast.error(t('products.tierDiscounts.deleteError'));
  } finally {
    deleting.value = false;
  }
}

// Expose methods that parent components might need
defineExpose({
  loadTierDiscounts
});
</script> 