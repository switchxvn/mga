import type { ProductVariant, VariantAttributes } from '@/composables/useProduct'

export interface ProductTranslation {
  id: number;
  locale: string;
  title: string;
  slug: string;
  content: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface Product {
  id: number;
  translations: ProductTranslation[];
  thumbnail: string;
  price: number;
  variants: ProductVariant[];
  variantAttributes?: VariantAttributes;
}

export interface Settings {
  product: Product;
  variants: ProductVariant[];
  selectedVariantId?: number;
  form: {
    maxGuests: number;
    minGuests: number;
    buttonText: string;
    buttonColor: string;
    guestsLabel: string;
    buttonTextColor: string;
    datePickerLabel: string;
  };
  width: string;
  colors: {
    heading: string;
    primary: string;
    secondary: string;
  };
  layout: string;
  margin: string;
  zIndex: string;
  padding: string;
  position: string;
  cardShadow: string;
  typography: {
    price: string;
    heading: string;
    tabLabel: string;
    description: string;
  };
  borderRadius: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  benefits?: {
    freeTicket?: string;
    freeShuttle?: string;
  };
}

export interface APIResponse {
  id: number;
  themeId: number;
  type: string;
  componentName: string;
  title: string;
  order: number;
  pageType: string;
  settings: Settings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const defaultSettings: Settings = {
  product: {
    id: 0,
    translations: [],
    thumbnail: '',
    price: 0,
    variants: []
  },
  variants: [],
  form: {
    maxGuests: 999,
    minGuests: 1,
    buttonText: "Đặt vé ngay",
    buttonColor: "bg-primary-600 hover:bg-primary-700",
    guestsLabel: "Số khách",
    buttonTextColor: "text-white",
    datePickerLabel: "Ngày tham quan"
  },
  width: "max-w-3xl",
  colors: {
    heading: "text-gray-900 dark:text-white",
    primary: "text-primary-600 dark:text-primary-400",
    secondary: "text-gray-600 dark:text-gray-400"
  },
  layout: "floating-card",
  margin: "mx-auto",
  zIndex: "z-10",
  padding: "p-6",
  position: "relative -mt-20",
  cardShadow: "shadow-xl",
  typography: {
    price: "text-lg font-semibold",
    heading: "text-2xl font-bold",
    tabLabel: "text-base font-medium",
    description: "text-sm"
  },
  borderRadius: "rounded-xl",
  backgroundColor: "bg-white dark:bg-gray-800",
  cardBackgroundColor: "bg-white dark:bg-gray-900",
  benefits: {
    freeTicket: "Miễn phí vé cho trẻ dưới 1.2m và người già trên 70 tuổi",
    freeShuttle: "Miễn phí xe điện đưa rước ra vào nhà ga cáp treo"
  }
}; 