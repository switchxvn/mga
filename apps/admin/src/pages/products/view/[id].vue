<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "../../../composables/useAuth";
import { useTrpc } from "../../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import Swal from 'sweetalert2';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import {
  ArrowLeftIcon,
  EditIcon,
  PackageIcon,
  ShoppingBagIcon,
  TagIcon,
  CalendarDaysIcon,
  ImageIcon,
  LayersIcon,
  FolderIcon,
  ClipboardListIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-vue-next';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Chi tiết sản phẩm - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Product interface
interface ProductTranslation {
  id: number;
  title: string;
  content: string;
  shortDescription: string;
  locale: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  videoTitle?: string;
}

interface ProductVariantTranslation {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  locale: string;
  metaTitle: string;
  metaDescription: string;
  variantId: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  translations: ProductVariantTranslation[];
}

interface Product {
  id: number;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  translations: ProductTranslation[];
  variants: ProductVariant[];
  thumbnail?: string;
  gallery?: string[];
  attributes: any[];
  specifications: any[];
  type?: string;
  categories?: any[];
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  videoReview?: string;
}

const isLoading = ref(true);
const error = ref<string | null>(null);
const product = ref<Product | null>(null);
const expandedVariants = ref(false);

// Get the product ID from the route
const productId = Number(route.params.id);

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// Format price
const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Fetch product data
const fetchProduct = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    product.value = await trpc.admin.products.getProductById.query(productId) as any;
  } catch (err) {
    console.error('Error fetching product details:', err);
    error.value = 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

// Initialize data
onMounted(async () => {
  try {
    await checkAuth(); // Verify user is authenticated
    await fetchProduct();
  } catch (err) {
    console.error('Authentication error:', err);
    error.value = 'Vui lòng đăng nhập để tiếp tục.';
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
    <!-- Back Button -->
    <div class="mb-6">
      <button 
        @click="router.push('/products')" 
        class="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeftIcon class="w-4 h-4 mr-1" />
        Quay lại danh sách
      </button>
    </div>
    
    <!-- Page header -->
    <PageHeader 
      title="Chi tiết sản phẩm" 
      icon="PackageIcon" 
      description="Xem thông tin chi tiết sản phẩm"
    />
    
    <!-- Loading or Error State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent align-middle"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Đang tải...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-800 dark:text-red-300">{{ error }}</p>
    </div>
    
    <!-- Product Details -->
    <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="md:col-span-2 grid gap-6">
        <!-- Product Header -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-medium text-gray-900 dark:text-white">
                {{ product.translations[0]?.title || 'Untitled Product' }}
              </h2>
              <p v-if="product.translations[0]?.shortDescription" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {{ product.translations[0]?.shortDescription }}
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <span v-if="product.published" class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 text-xs font-medium rounded-full">
                Đã xuất bản
              </span>
              <span v-else class="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 text-xs font-medium rounded-full">
                Bản nháp
              </span>
              <a 
                :href="`/products/edit/${product.id}`" 
                class="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70 px-3 py-1 rounded-md text-xs font-medium flex items-center"
              >
                <EditIcon class="w-3 h-3 mr-1" />
                Chỉnh sửa
              </a>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Basic Info -->
            <div class="space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                  <TagIcon class="w-4 h-4 text-gray-400 mr-1" />
                  {{ product.sku || 'N/A' }}
                </p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Giá</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ formatPrice(product.price) }}
                  <span v-if="product.salePrice" class="text-red-500 ml-1">
                    (Giá khuyến mãi: {{ formatPrice(product.salePrice) }})
                  </span>
                </p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Số lượng</p>
                <p class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ product.stock || 'N/A' }}
                </p>
              </div>
            </div>
            
            <!-- Tags and Categories -->
            <div class="space-y-4">
              <div v-if="product.categories && product.categories.length > 0">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Danh mục</p>
                <div class="mt-1 flex flex-wrap gap-2">
                  <span 
                    v-for="category in product.categories" 
                    :key="category.id"
                    class="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ category.translations?.[0]?.name || 'Unnamed Category' }}
                  </span>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2">
                <span 
                  v-if="product.isFeatured" 
                  class="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 text-xs font-medium rounded-full"
                >
                  Nổi bật
                </span>
                <span 
                  v-if="product.isNew" 
                  class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 text-xs font-medium rounded-full"
                >
                  Mới
                </span>
                <span 
                  v-if="product.isSale" 
                  class="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 text-xs font-medium rounded-full"
                >
                  Giảm giá
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Product Images -->
        <div v-if="product.thumbnail || (product.gallery && product.gallery.length > 0)" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <ImageIcon class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Hình ảnh</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="product.thumbnail" class="relative">
              <div class="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <img 
                  :src="product.thumbnail" 
                  class="h-full w-full object-cover object-center" 
                  alt="Product thumbnail"
                  @error="($event.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image'"
                />
              </div>
              <span class="absolute top-2 left-2 bg-white dark:bg-gray-800 px-2 py-1 text-xs font-medium rounded shadow-sm">
                Ảnh đại diện
              </span>
            </div>
            
            <div 
              v-for="(image, index) in product.gallery?.slice(0, 5)" 
              :key="index" 
              class="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <img 
                :src="image" 
                class="h-full w-full object-cover object-center" 
                alt="Product image"
                @error="($event.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=No+Image'"
              />
            </div>
          </div>
          
          <div v-if="product.gallery && product.gallery.length > 5" class="mt-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              + {{ product.gallery.length - 5 }} hình ảnh khác
            </p>
          </div>
        </div>
        
        <!-- Product Description -->
        <div v-if="product.translations[0]?.content" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Mô tả sản phẩm</h2>
          <div class="prose dark:prose-invert max-w-none" v-html="product.translations[0]?.content"></div>
        </div>
      </div>
      
      <!-- Sidebar Info -->
      <div class="space-y-6">
        <!-- Product Variants -->
        <div v-if="product.variants && product.variants.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <LayersIcon class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
              <h2 class="text-lg font-medium text-gray-900 dark:text-white">Biến thể</h2>
            </div>
            <button 
              @click="expandedVariants = !expandedVariants"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs"
            >
              {{ expandedVariants ? 'Thu gọn' : 'Hiển thị tất cả' }}
            </button>
          </div>
          
          <div class="space-y-3">
            <div 
              v-for="(variant, index) in (expandedVariants ? product.variants : product.variants.slice(0, 3))" 
              :key="variant.id" 
              class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ variant.translations[0]?.name || `Biến thể ${index + 1}` }}
              </p>
              <div class="mt-1 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">SKU:</span>
                  <span class="text-gray-900 dark:text-white ml-1">{{ variant.sku || 'N/A' }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Giá:</span>
                  <span class="text-gray-900 dark:text-white ml-1">{{ formatPrice(variant.price) }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Số lượng:</span>
                  <span class="text-gray-900 dark:text-white ml-1">{{ variant.stock || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="!expandedVariants && product.variants.length > 3" class="mt-3 text-center">
            <button 
              @click="expandedVariants = true"
              class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
            >
              Xem {{ product.variants.length - 3 }} biến thể khác
            </button>
          </div>
        </div>
        
        <!-- Specifications -->
        <div v-if="product.specifications && product.specifications.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <ClipboardListIcon class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">Thông số kỹ thuật</h2>
          </div>
          
          <div class="space-y-2">
            <div 
              v-for="spec in product.specifications" 
              :key="spec.id" 
              class="grid grid-cols-2 gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ spec.translations?.[0]?.name || 'Unnamed Spec' }}
              </div>
              <div class="text-sm text-gray-900 dark:text-white">
                {{ spec.translations?.[0]?.value || 'N/A' }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Other Info -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin khác</h2>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái xuất bản</p>
              <p class="mt-1 text-sm flex items-center">
                <span v-if="product.published">
                  <CheckCircleIcon class="w-4 h-4 text-green-500 mr-1 inline" />
                  <span class="text-green-600 dark:text-green-500">Đã xuất bản</span>
                </span>
                <span v-else>
                  <XCircleIcon class="w-4 h-4 text-gray-400 mr-1 inline" />
                  <span class="text-gray-500 dark:text-gray-400">Chưa xuất bản</span>
                </span>
              </p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white break-all">
                {{ product.translations[0]?.slug || 'N/A' }}
              </p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                <CalendarDaysIcon class="w-4 h-4 text-gray-400 mr-1" />
                {{ formatDate(product.createdAt) }}
              </p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
              <p class="mt-1 text-sm text-gray-900 dark:text-white flex items-center">
                <CalendarDaysIcon class="w-4 h-4 text-gray-400 mr-1" />
                {{ formatDate(product.updatedAt) }}
              </p>
            </div>
            
            <div class="pt-4">
              <a 
                :href="`/products/edit/${product.id}`" 
                class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                <EditIcon class="w-4 h-4 mr-1" />
                Chỉnh sửa sản phẩm
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 