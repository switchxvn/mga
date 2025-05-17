import { ProductVariant, ProductVariantTranslation } from '@shared/lib/interfaces/product-variant.interface';
import { ref, computed, reactive, watch } from 'vue';
import { useTrpc } from './useTrpc';
import { useToast } from './useToast';

export interface UseProductVariantsOptions {
  onVariantsUpdate?: (variants: ProductVariant[]) => void;
}

export function useProductVariants(initialVariants: ProductVariant[] = [], options?: UseProductVariantsOptions) {
  const variants = ref<ProductVariant[]>(initialVariants);
  const loading = ref<boolean>(false);
  const trpc = useTrpc();
  const toast = useToast();

  // Deep clone function để đảm bảo reactivity
  const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

  // Initialize variants from external source
  const initializeVariants = (newVariants: ProductVariant[]) => {
    console.log('Initializing variants:', newVariants?.length);
    variants.value = deepClone(newVariants) || [];
  };

  // Các hàm cập nhật giá trị của variant
  const updateVariantPrice = (variantId: number, newPrice: number | null) => {
    console.log(`Updating variant ${variantId} price to:`, newPrice);
    
    const updatedVariants = variants.value.map(variant => {
      if (variant.id === variantId) {
        return {
          ...deepClone(variant),
          price: newPrice,
        };
      }
      return deepClone(variant);
    });
    
    variants.value = updatedVariants;
    notifyVariantsUpdated();
  };

  const updateVariantComparePrice = (variantId: number, newComparePrice: number | null) => {
    console.log(`Updating variant ${variantId} comparePrice to:`, newComparePrice);
    
    const updatedVariants = variants.value.map(variant => {
      if (variant.id === variantId) {
        return {
          ...deepClone(variant),
          comparePrice: newComparePrice,
        };
      }
      return deepClone(variant);
    });
    
    variants.value = updatedVariants;
    notifyVariantsUpdated();
  };

  const updateVariantSku = (variantId: number, newSku: string) => {
    console.log(`Updating variant ${variantId} SKU to:`, newSku);
    
    const updatedVariants = variants.value.map(variant => {
      if (variant.id === variantId) {
        return {
          ...deepClone(variant),
          sku: newSku,
        };
      }
      return deepClone(variant);
    });
    
    variants.value = updatedVariants;
    notifyVariantsUpdated();
  };

  const updateVariantStock = (variantId: number, newStock: number) => {
    console.log(`Updating variant ${variantId} stock to:`, newStock);
    
    const updatedVariants = variants.value.map(variant => {
      if (variant.id === variantId) {
        return {
          ...deepClone(variant),
          quantity: newStock,
          stock: newStock,
        };
      }
      return deepClone(variant);
    });
    
    variants.value = updatedVariants;
    notifyVariantsUpdated();
  };

  const toggleContactPrice = (variantId: number) => {
    console.log(`Toggling contact price for variant ${variantId}`);
    
    const updatedVariants = variants.value.map(variant => {
      if (variant.id === variantId) {
        const newVariant = deepClone(variant);
        
        if (newVariant.price === null) {
          // Đang ở trạng thái "Giá liên hệ", chuyển về giá bình thường
          newVariant.price = newVariant._tempPrice !== undefined ? newVariant._tempPrice : 0;
          newVariant.comparePrice = newVariant._tempComparePrice !== undefined ? newVariant._tempComparePrice : null;
          
          // Xóa giá tạm
          delete newVariant._tempPrice;
          delete newVariant._tempComparePrice;
        } else {
          // Đang có giá, chuyển sang "Giá liên hệ"
          newVariant._tempPrice = newVariant.price;
          newVariant._tempComparePrice = newVariant.comparePrice;
          
          newVariant.price = null;
          newVariant.comparePrice = null;
        }
        
        console.log('Variant after toggle:', newVariant);
        return newVariant;
      }
      return deepClone(variant);
    });
    
    variants.value = updatedVariants;
    notifyVariantsUpdated();
  };

  // API calls
  const adjustVariantStockAPI = async (variantId: number, adjustmentQuantity: number, note: string = '') => {
    if (!variantId) return false;
  
    loading.value = true;
    
    try {
      const result = await trpc.admin.products.adjustVariantStock.mutate({
        variantId,
        adjustmentQuantity,
        note
      });
      
      if (result) {
        // Cập nhật lại số lượng trong local state
        const newQuantity = result.quantityAfter || (result as any).data?.quantityAfter || 0;
        updateVariantStock(variantId, newQuantity);
        return result;
      }
      return false;
    } catch (error: unknown) {
      console.error('Failed to adjust variant stock:', error);
      toast.error('Failed to adjust variant stock');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const loadVariantStockHistory = async (variantId: number, limit = 10, offset = 0) => {
    if (!variantId) return [];
    
    loading.value = true;
    
    try {
      const response = await trpc.admin.products.getVariantStockHistory.query({
        variantId,
        limit,
        offset
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error loading variant stock history:', error);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Helper functions
  const getVariantById = (variantId: number): ProductVariant | undefined => {
    return variants.value.find(v => v.id === variantId);
  };

  // Notify parent about updates
  const notifyVariantsUpdated = () => {
    if (options?.onVariantsUpdate) {
      options.onVariantsUpdate(deepClone(variants.value));
    }
  };

  return {
    variants,
    loading,
    initializeVariants,
    updateVariantPrice,
    updateVariantComparePrice,
    updateVariantSku, 
    updateVariantStock,
    toggleContactPrice,
    adjustVariantStockAPI,
    loadVariantStockHistory,
    getVariantById
  };
} 