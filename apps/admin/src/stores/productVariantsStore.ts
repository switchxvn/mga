import { defineStore } from 'pinia';
import { useTrpc } from '../composables/useTrpc';
import { useToast } from '../composables/useToast';

// Định nghĩa interface cho variant để thống nhất kiểu dữ liệu
export interface VariantItem {
  id?: number;
  name: string;
  price: number | null;
  sku: string;
  stock: number;
  quantity?: number;
  options: Record<string, string>;
  barcode?: string;
  compareAtPrice?: number | null;
  _tempPrice?: number;
  _tempCompareAtPrice?: number | null;
}

// Định nghĩa interface cho state của store
interface ProductVariantsState {
  variants: VariantItem[];
  loading: boolean;
  initialized: boolean;
}

export const useProductVariantsStore = defineStore('productVariants', {
  state: (): ProductVariantsState => ({
    variants: [],
    loading: false,
    initialized: false,
  }),

  getters: {
    getVariantById: (state) => (id: number) => {
      return state.variants.find(variant => variant.id === id);
    },
    
    allVariants: (state) => state.variants,
  },

  actions: {
    // Khởi tạo store với danh sách variants
    initVariants(variants: VariantItem[]) {
      this.variants = [...variants];
      this.initialized = true;
    },

    // Cập nhật toàn bộ danh sách variants
    updateAllVariants(variants: VariantItem[]) {
      this.variants = [...variants];
    },

    // Cập nhật một variant cụ thể
    updateVariant(variantId: number, data: Partial<VariantItem>) {
      const index = this.variants.findIndex(v => v.id === variantId);
      if (index !== -1) {
        // Tạo một đối tượng mới để đảm bảo tính reactive
        this.variants[index] = { ...this.variants[index], ...data };
      }
    },

    // Cập nhật stock cho một variant
    updateVariantStock(variantId: number, newStock: number) {
      const index = this.variants.findIndex(v => v.id === variantId);
      if (index !== -1) {
        this.variants[index].stock = newStock;
        if ('quantity' in this.variants[index]) {
          this.variants[index].quantity = newStock;
        }
      }
    },

    // Adjust stock từ API và cập nhật store
    async adjustVariantStock(variantId: number, adjustmentQuantity: number, note: string = '') {
      if (!variantId) return false;
      
      this.loading = true;
      const trpc = useTrpc();
      const toast = useToast();
      
      try {
        const result = await trpc.admin.products.adjustVariantStock.mutate({
          variantId,
          adjustmentQuantity,
          note: note || undefined
        });
        
        // Nếu có kết quả và có quantity mới
        if (result && result.variant && typeof result.variant.quantity === 'number') {
          // Cập nhật variant trong store
          this.updateVariantStock(variantId, result.variant.quantity);
          
          toast.success(`Stock adjusted successfully to ${result.variant.quantity}`);
          return result;
        }
        
        return result;
      } catch (error) {
        console.error('Error adjusting variant stock:', error);
        toast.error('Failed to adjust variant stock');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Thêm một variant mới
    addVariant(variant: VariantItem) {
      this.variants.push(variant);
    },
    
    // Xóa một variant
    removeVariant(variantId: number) {
      const index = this.variants.findIndex(v => v.id === variantId);
      if (index !== -1) {
        this.variants.splice(index, 1);
      }
    }
  }
}); 