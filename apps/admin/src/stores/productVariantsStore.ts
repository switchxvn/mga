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
  comparePrice?: number | null;
  thumbnail?: string;
  gallery?: string[];
  published?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  _tempPrice?: number;
  _tempComparePrice?: number | null;
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

    // Cập nhật giá của một variant (hỗ trợ giá liên hệ - null)
    async updateVariantPrice(variantId: number, price: number | null, comparePrice: number | null = null) {
      if (!variantId) return false;
      
      this.loading = true;
      const trpc = useTrpc();
      const toast = useToast();
      
      try {
        // Log giá trị để debug
        console.log(`Cập nhật giá cho variant ${variantId}:`, { price, comparePrice });
        
        // Gọi API để cập nhật giá
        const result = await trpc.admin.products.updateVariant.mutate({
          id: variantId,
          data: {
            price: price,
            comparePrice: comparePrice
          }
        });
        
        if (result) {
          // Cập nhật lại trong store
          this.updateVariant(variantId, { 
            price: price,
            comparePrice: comparePrice
          });
          
          // Log kết quả sau khi cập nhật thành công
          console.log(`Cập nhật giá thành công cho variant ${variantId}:`, { price, comparePrice });
          
          toast.success('Cập nhật giá thành công');
          return true;
        }
        return false;
      } catch (error: any) {
        console.error('Lỗi khi cập nhật giá variant:', error);
        toast.error('Không thể cập nhật giá: ' + (error?.message || 'Lỗi không xác định'));
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật stock cho một variant
    updateVariantStock(variantId: number, stock: number) {
      const index = this.variants.findIndex(v => v.id === variantId);
      if (index !== -1) {
        this.variants[index].stock = stock;
        this.variants[index].quantity = stock;
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
          note
        });
        
        if (result) {
          // Cập nhật lại số lượng trong store
          const variant = this.getVariantById(variantId);
          if (variant) {
            // Kiểm tra cấu trúc kết quả từ API và lấy số lượng mới
            const newQuantity = result.quantityAfter || (result as any).data?.quantityAfter || 0;
            this.updateVariantStock(variantId, newQuantity);
          }
          return result;
        }
        return false;
      } catch (error: unknown) {
        console.error('Lỗi khi điều chỉnh tồn kho:', error);
        if (error instanceof Error) {
          toast.error('Không thể điều chỉnh tồn kho: ' + error.message);
        } else {
          toast.error('Không thể điều chỉnh tồn kho: Lỗi không xác định');
        }
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