export interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
  discountPercent: number;
  product?: {
    id: number;
    title?: string;
    thumbnail?: string;
    translations?: Array<{
      locale: string;
      title: string;
    }>;
  };
  variant?: {
    id: number;
    name: string;
  };
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
}

export interface CartState {
  items: CartItem[];
  summary: CartSummary | null;
  isLoading: boolean;
  error: string | null;
  isCartEnabled: boolean;
}

export interface CartActions {
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  initialize: () => Promise<void>;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';
}

export interface CartLogicComposable {
  // State
  cartItems: CartItem[];
  cartSummary: CartSummary | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  isCartEnabled: boolean;
  
  // Computed
  isEmpty: boolean;
  cartItemCount: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTotal: string;
  hasDataInconsistency: boolean;
  
  // Methods
  formatPrice: (price: number) => string;
  getProductTitle: (item: CartItem) => string;
  getItemTotal: (item: CartItem) => number;
  getItemDiscount: (item: CartItem) => number;
  handleQuantityChange: (itemId: number, newQuantity: number) => Promise<void>;
  handleRemoveItem: (itemId: number) => Promise<void>;
  handleClearCart: () => Promise<void>;
  initialize: () => Promise<void>;
  
  // Confirm dialog
  isConfirmVisible: boolean;
  confirmOptions: ConfirmDialogOptions;
  confirm: () => void;
  cancel: () => void;
  
  // Utils
  t: (key: string) => string;
} 