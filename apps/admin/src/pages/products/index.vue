<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { 
  PlusCircleIcon, 
  AlertCircleIcon,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
  ZoomInIcon,
  EyeIcon,
  EyeOffIcon,
  ArchiveIcon,
  MoreHorizontalIcon,
  CopyIcon,
  TrashIcon,
  XCircleIcon as LucideXCircleIcon,
  ListChecksIcon,
  PackageIcon
} from 'lucide-vue-next';
import {
  DocumentTextIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon as SearchIcon,    
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/vue/24/outline'
import { TransitionRoot } from '@headlessui/vue'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import PaginationComponent from '../../components/ui/Pagination.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import SearchFilter from '../../components/products/SearchFilter.vue';
import Swal from 'sweetalert2';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Products Management - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

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

interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  translations: ProductVariantTranslation[];
}

interface ProductVariantTranslation {
  id: number;
  name: string;
  locale: string;
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
  attributes: any[];
  specifications: any[];
  type?: string;
  categories?: any[];
}

const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const publishedFilter = ref<boolean | undefined>(
  route.query.published === 'true' ? true : 
  route.query.published === 'false' ? false : 
  undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const products = ref<{
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>({
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1
});

const selectedProducts = ref<number[]>([]);
const showBulkActions = ref(false);
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

const selectedImage = ref<string | null>(null);
const isZoomModalOpen = ref(false);

// Update URL query parameters
const updateQueryParams = () => {
  const query: Record<string, string | undefined> = {
    page: page.value > 1 ? page.value.toString() : undefined,
    search: search.value || undefined,
    published: publishedFilter.value !== undefined ? publishedFilter.value.toString() : undefined
  };

  Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);
  router.replace({ query });
};

watch([page, search, publishedFilter], () => {
  updateQueryParams();
  fetchProducts();
}, { deep: true });

async function fetchProducts() {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await trpc.admin.products.getAllProducts.query({
      page: page.value,
      limit: pageSize.value,
      search: search.value || undefined,
      published: publishedFilter.value
    });

    // Map API response to Product interface
    const mappedProducts = result.products.map(p => ({
      id: p.id,
      sku: p.sku || '',
      price: p.price || 0,
      salePrice: p.salePrice,
      stock: p.stock || 0,
      published: !!p.published,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      translations: p.translations || [],
      variants: (p.variants || []).map(v => ({
        id: v.id,
        sku: v.sku || '',
        price: v.price || 0,
        salePrice: v.salePrice,
        stock: v.stock || 0,
        translations: v.translations || []
      })),
      thumbnail: p.thumbnail || undefined,
      attributes: p.attributes || [],
      specifications: p.specifications || [],
      type: p.type,
      categories: p.categories || []
    }));

    products.value = {
      items: mappedProducts,
      total: result.total,
      page: result.currentPage,
      pageSize: result.limit,
      totalPages: result.totalPages
    };
  } catch (err: any) {
    error.value = err.message || "Failed to load products";
    console.error("Error loading products:", err);
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!result.isConfirmed) return;

  try {
    await trpc.admin.products.deleteProduct.mutate(id);
    await fetchProducts();
    Swal.fire('Deleted!', 'Product has been deleted.', 'success');
  } catch (err: any) {
    error.value = err.message || "Failed to delete product";
    Swal.fire('Error!', error.value, 'error');
  }
}

async function handleBulkAction(action: string) {
  const selectedCount = selectedProducts.value.length;
  if (!selectedCount) return;

  let confirmConfig: any = {
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    title: '',
    text: '',
    confirmButtonColor: ''
  };

  switch (action) {
    case 'publish':
      confirmConfig = {
        ...confirmConfig,
        title: 'Publish Selected Products?',
        text: `Are you sure you want to publish ${selectedCount} selected products?`,
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Yes, publish them'
      };
      break;
    case 'unpublish':
      confirmConfig = {
        ...confirmConfig,
        title: 'Unpublish Selected Products?',
        text: `Are you sure you want to unpublish ${selectedCount} selected products?`,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Yes, unpublish them'
      };
      break;
    case 'delete':
      confirmConfig = {
        ...confirmConfig,
        title: 'Delete Selected Products?',
        text: `Are you sure you want to delete ${selectedCount} selected products? This action cannot be undone.`,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Yes, delete them'
      };
      break;
  }

  const result = await Swal.fire(confirmConfig);
  if (!result.isConfirmed) return;

  try {
    switch (action) {
      case 'publish':
        await trpc.admin.products.bulkPublish.mutate(selectedProducts.value);
        break;
      case 'unpublish':
        await trpc.admin.products.bulkUnpublish.mutate(selectedProducts.value);
        break;
      case 'delete':
        await trpc.admin.products.bulkDelete.mutate(selectedProducts.value);
        break;
    }
    
    selectedProducts.value = [];
    showBulkActions.value = false;
    await fetchProducts();
    
    Swal.fire('Success!', 'Operation completed successfully', 'success');
  } catch (err: any) {
    Swal.fire('Error!', err.message || 'Operation failed', 'error');
  }
}

onMounted(() => {
  checkAuth();
  fetchProducts();
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8">
    <PageHeader title="Products" subtitle="Manage your products">
      <template #actions>
        <router-link
          to="/products/create"
          class="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <PlusCircleIcon class="-ml-0.5 mr-1.5 h-5 w-5" />
          New Product
        </router-link>
      </template>
    </PageHeader>

    <SearchFilter 
      v-model:search="search"
      v-model:published="publishedFilter"
      class="mt-8"
    />

    <!-- Bulk Actions -->
    <TransitionRoot
      as="div"
      enter="transition ease-out duration-200"
      enter-from="opacity-0 translate-y-1"
      enter-to="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leave-from="opacity-100 translate-y-0"
      leave-to="opacity-0 translate-y-1"
      class="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50"
      :show="showBulkActions"
    >
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="p-2 rounded-lg bg-primary-600 shadow-lg sm:p-3">
          <div class="flex items-center justify-between flex-wrap">
            <div class="flex-1 flex items-center">
              <span class="flex p-2 rounded-lg bg-primary-800">
                <ListChecksIcon class="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <p class="ml-3 font-medium text-white truncate">
                <span>{{ selectedProducts.length }} products selected</span>
              </p>
            </div>
            <div class="mt-0 flex-shrink-0 flex gap-2">
              <button
                type="button"
                @click="handleBulkAction('publish')"
                class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
              >
                Publish
              </button>
              <button
                type="button"
                @click="handleBulkAction('unpublish')"
                class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
              >
                Unpublish
              </button>
              <button
                type="button"
                @click="handleBulkAction('delete')"
                class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
              >
                Delete
              </button>
              <button
                type="button"
                @click="selectedProducts = []; showBulkActions = false"
                class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionRoot>

    <!-- Products List -->
    <div class="mt-8 flex flex-col">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      :checked="selectedProducts.length === products.items.length && products.items.length > 0"
                      :indeterminate="selectedProducts.length > 0 && selectedProducts.length < products.items.length"
                      @change="
                        selectedProducts = $event.target.checked
                          ? products.items.map(p => p.id)
                          : [];
                        showBulkActions = selectedProducts.length > 0;
                      "
                    />
                  </th>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Product
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="isLoading" class="animate-pulse">
                  <td colspan="7" class="p-4 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
                <tr v-else-if="error" class="bg-red-50">
                  <td colspan="7" class="p-4 text-center text-red-500">
                    <AlertCircleIcon class="w-5 h-5 inline mr-2" />
                    {{ error }}
                  </td>
                </tr>
                <tr v-else-if="products.items.length === 0" class="bg-gray-50">
                  <td colspan="7" class="p-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
                <tr v-for="product in products.items" :key="product.id" class="hover:bg-gray-50">
                  <td class="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      :checked="selectedProducts.includes(product.id)"
                      @change="
                        const index = selectedProducts.indexOf(product.id);
                        if (index === -1) {
                          selectedProducts.push(product.id);
                        } else {
                          selectedProducts.splice(index, 1);
                        }
                        showBulkActions = selectedProducts.length > 0;
                      "
                      class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  </td>
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <img
                          v-if="product.thumbnail"
                          :src="product.thumbnail"
                          class="h-10 w-10 rounded-full object-cover"
                          @click="selectedImage = product.thumbnail; isZoomModalOpen = true"
                        />
                        <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <PackageIcon class="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="font-medium text-gray-900">
                          {{ product.translations[0]?.title || 'Untitled Product' }}
                        </div>
                        <div class="text-gray-500">
                          {{ product.variants.length }} variants
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ product.sku }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="flex items-center">
                      <CurrencyDollarIcon class="h-5 w-5 text-gray-400 mr-1" />
                      {{ product.price.toFixed(2) }}
                      <span v-if="product.salePrice" class="ml-2 text-red-500">
                        {{ product.salePrice.toFixed(2) }}
                      </span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ product.stock }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      :class="[
                        product.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800',
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
                      ]"
                    >
                      {{ product.published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Menu as="div" class="relative inline-block text-left">
                      <MenuButton
                        class="inline-flex items-center rounded-full p-1.5 text-gray-500 hover:text-gray-600"
                      >
                        <span class="sr-only">Open options</span>
                        <MoreHorizontalIcon class="h-5 w-5" />
                      </MenuButton>

                      <transition
                        enter-active-class="transition ease-out duration-100"
                        enter-from-class="transform opacity-0 scale-95"
                        enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95"
                      >
                        <MenuItems
                          class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <div class="py-1">
                            <MenuItem v-slot="{ active }">
                              <router-link
                                :to="`/products/${product.id}`"
                                :class="[
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'group flex items-center px-4 py-2 text-sm'
                                ]"
                              >
                                <EyeIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                View Details
                              </router-link>
                            </MenuItem>
                            <MenuItem v-slot="{ active }">
                              <router-link
                                :to="`/products/edit/${product.id}`"
                                :class="[
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'group flex items-center px-4 py-2 text-sm'
                                ]"
                              >
                                <PencilIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Edit
                              </router-link>
                            </MenuItem>
                            <MenuItem v-slot="{ active }">
                              <button
                                @click="handleDelete(product.id)"
                                :class="[
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'group flex items-center px-4 py-2 text-sm w-full'
                                ]"
                              >
                                <TrashIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                Delete
                              </button>
                            </MenuItem>
                          </div>
                        </MenuItems>
                      </transition>
                    </Menu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-5 flex items-center justify-between">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="page--"
          :disabled="page <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          @click="page++"
          :disabled="page >= products.totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ products.total ? ((page - 1) * pageSize) + 1 : 0 }}</span>
            to
            <span class="font-medium">
              {{ Math.min(page * pageSize, products.total) }}
            </span>
            of
            <span class="font-medium">{{ products.total }}</span>
            results
          </p>
        </div>
        <PaginationComponent
          :current-page="page"
          :total-pages="products.totalPages"
          :total-items="products.total"
          :items-per-page="pageSize"
          :max-visible-pages="5"
          :show-items-info="false"
          @page-change="page = $event"
        />
      </div>
    </div>

    <!-- Image Zoom Modal -->
    <TransitionRoot as="template" :show="isZoomModalOpen">
      <div
        class="fixed z-50 inset-0 overflow-y-auto"
        @click="isZoomModalOpen = false"
      >
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div class="mt-2">
                    <Swiper
                      :modules="[Navigation, Pagination, Zoom]"
                      :navigation="true"
                      :pagination="{ clickable: true }"
                      :zoom="true"
                      class="w-full"
                    >
                      <SwiperSlide>
                        <div class="swiper-zoom-container">
                          <img
                            :src="selectedImage"
                            class="w-full h-auto object-contain"
                            alt="Product image"
                          />
                        </div>
                      </SwiperSlide>
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="isZoomModalOpen = false"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionRoot>
  </div>
</template> 