<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot } from '@headlessui/vue';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import {
  ArchiveIcon,
  CopyIcon,
  EyeIcon,
  XCircleIcon as LucideXCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  Trash2Icon,
  TrashIcon,
  PackageIcon,
  MoreHorizontalIcon,
  ChevronDownIcon as LucideChevronDownIcon,
  ChevronUpIcon as LucideChevronUpIcon
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import FilterContainer from '../../components/common/filter/FilterContainer.vue';
import SearchFilter from '../../components/common/filter/SearchFilter.vue';
import StatusFilter from '../../components/common/filter/StatusFilter.vue';
import PageSizeFilter from '../../components/common/filter/PageSizeFilter.vue';
import DataTable from '../../components/common/table/DataTable.vue';
import PageHeader from '../../components/common/header/PageHeader.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Orders Management - Admin Panel'
})

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Define OrderStatus and PaymentStatus enums to match backend
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

interface Address {
  city: string;
  country: string;
  line1: string;
  line2?: string;
  postal_code: string;
  state: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: any;
  createdAt: string;
  updatedAt: string;
  product?: any;
}

interface Order {
  id: number;
  orderCode: string;
  userId?: string;
  phoneCode: string;
  phoneNumber: string;
  email?: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const isLoading = ref(true);
const error = ref<string | null>(null);
const search = ref(route.query.search?.toString() || '');
const statusFilter = ref<OrderStatus | undefined>(
  route.query.status ? route.query.status as OrderStatus : undefined
);
const paymentStatusFilter = ref<PaymentStatus | undefined>(
  route.query.paymentStatus ? route.query.paymentStatus as PaymentStatus : undefined
);
const page = ref(Number(route.query.page) || 1);
const pageSize = ref(10);
const orders = ref<{
  items: Order[];
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

const selectedOrders = ref<number[]>([]);
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Capitalize the first letter of a string
const capitalize = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

// Get order status badge class
const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case OrderStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case OrderStatus.PROCESSING:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case OrderStatus.SHIPPED:
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    case OrderStatus.DELIVERED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Get payment status badge class
const getPaymentStatusBadgeClass = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case PaymentStatus.PAID:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case PaymentStatus.FAILED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case PaymentStatus.REFUNDED:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case PaymentStatus.PARTIALLY_REFUNDED:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Fetch orders with filters
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      search: search.value || undefined,
      status: statusFilter.value,
      paymentStatus: paymentStatusFilter.value
    };
    
    const result = await trpc.admin.order.getAllOrders.query(params);
    orders.value = result;
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    error.value = err.message || 'Failed to fetch orders';
  } finally {
    isLoading.value = false;
  }
};

// Delete a single order
const deleteOrder = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (result.isConfirmed) {
    try {
      await trpc.admin.order.deleteOrder.mutate(id);
      Swal.fire('Deleted!', 'Order has been deleted.', 'success');
      fetchOrders();
    } catch (err: any) {
      console.error('Error deleting order:', err);
      Swal.fire('Error!', err.message || 'Failed to delete order', 'error');
    }
  }
};

// Bulk delete orders
const bulkDeleteOrders = async () => {
  if (!selectedOrders.value.length) return;

  const result = await Swal.fire({
    title: `Delete ${selectedOrders.value.length} orders?`,
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete them!'
  });

  if (result.isConfirmed) {
    try {
      // Delete each order
      for (const id of selectedOrders.value) {
        await trpc.admin.order.deleteOrder.mutate(id);
      }
      
      Swal.fire('Deleted!', `${selectedOrders.value.length} orders have been deleted.`, 'success');
      selectedOrders.value = [];
      fetchOrders();
    } catch (err: any) {
      console.error('Error deleting orders:', err);
      Swal.fire('Error!', err.message || 'Failed to delete orders', 'error');
    }
  }
};

// Update order status
const updateOrderStatus = async (id: number, status: OrderStatus) => {
  try {
    await trpc.admin.order.updateOrderStatus.mutate({ id, status });
    Swal.fire('Updated!', 'Order status has been updated.', 'success');
    fetchOrders();
  } catch (err: any) {
    console.error('Error updating order status:', err);
    Swal.fire('Error!', err.message || 'Failed to update order status', 'error');
  }
};

// Update payment status
const updatePaymentStatus = async (id: number, paymentStatus: PaymentStatus) => {
  try {
    await trpc.admin.order.updatePaymentStatus.mutate({ id, paymentStatus });
    Swal.fire('Updated!', 'Payment status has been updated.', 'success');
    fetchOrders();
  } catch (err: any) {
    console.error('Error updating payment status:', err);
    Swal.fire('Error!', err.message || 'Failed to update payment status', 'error');
  }
};

// Update URL with search parameters
const updateUrlParams = () => {
  router.push({
    query: {
      ...route.query,
      page: page.value,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      paymentStatus: paymentStatusFilter.value || undefined
    }
  });
};

// Watch for changes and update URL
watch([search, statusFilter, paymentStatusFilter, page], () => {
  updateUrlParams();
  fetchOrders();
});

// Initial load
onMounted(async () => {
  await checkAuth();
  await fetchOrders();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Orders Management"
      description="Manage and track customer orders"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <Menu as="div" class="relative" v-if="selectedOrders.length">
            <MenuButton class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              <ListChecksIcon class="h-4 w-4" />
              Bulk Actions ({{ selectedOrders.length }})
              <ChevronDownIcon class="h-4 w-4" />
            </MenuButton>

            <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="bulkDeleteOrders"
                    :class="[
                      active ? 'bg-red-100 text-red-900' : 'text-red-700',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                    ]"
                  >
                    <TrashIcon class="mr-2 h-4 w-4" />
                    Delete Selected
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          
          <NuxtLink
            to="/orders/create"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusCircleIcon class="h-4 w-4" />
            Create Order
          </NuxtLink>
        </div>
      </template>
    </PageHeader>

    <!-- Search and Filter -->
    <FilterContainer>
      <template #search>
        <SearchFilter
          v-model:search="search"
          search-placeholder="Search orders..."
        />
      </template>
      
      <template #status>
        <StatusFilter
          :modelValue="statusFilter"
          :options="[
            { label: 'All Status', value: undefined },
            { label: 'Pending', value: OrderStatus.PENDING },
            { label: 'Confirmed', value: OrderStatus.CONFIRMED },
            { label: 'Processing', value: OrderStatus.PROCESSING },
            { label: 'Shipped', value: OrderStatus.SHIPPED },
            { label: 'Delivered', value: OrderStatus.DELIVERED },
            { label: 'Cancelled', value: OrderStatus.CANCELLED }
          ]"
          @update:modelValue="statusFilter = $event"
        />
      </template>
      
      <template #additionalFilters>
        <div class="flex items-center space-x-4">
          <div class="w-48">
            <label for="payment-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
            <select
              id="payment-status"
              v-model="paymentStatusFilter"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            >
              <option :value="undefined">All Payment Status</option>
              <option v-for="status in Object.values(PaymentStatus)" :key="status" :value="status">
                {{ capitalize(status.replace('_', ' ')) }}
              </option>
            </select>
          </div>
        </div>
      </template>
      
      <template #pageSize>
        <PageSizeFilter
          v-model:modelValue="pageSize"
        />
      </template>
    </FilterContainer>

    <!-- Orders Table -->
    <DataTable
      :items="orders.items"
      :loading="isLoading"
      :error="error"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      :selected-items="selectedOrders"
      :pagination="{
        currentPage: page,
        totalPages: orders.totalPages,
        total: orders.total,
        pageSize: pageSize
      }"
      @update:selected-items="selectedOrders = $event"
      @sort="sortBy = $event; fetchOrders()"
      @page-change="page = $event"
      @clear-error="error = null"
    >
      <template #headers>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Order ID
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Customer
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Date
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Total
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Status
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Payment
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Items
        </th>
        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Actions
        </th>
      </template>

      <template #rows="{ item: order }">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="ml-2">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ order.orderCode }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">#{{ order.id }}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex flex-col">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ order.customerName || 'Guest Customer' }}
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ order.email || `${order.phoneCode}${order.phoneNumber}` }}
            </p>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {{ formatDate(order.createdAt) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
          {{ typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : order.totalAmount }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusBadgeClass(order.status)">
            {{ capitalize(order.status) }}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getPaymentStatusBadgeClass(order.paymentStatus)">
            {{ capitalize(order.paymentStatus.replace('_', ' ')) }}
          </span>
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ order.paymentMethod }}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {{ order.items?.length || 0 }} items
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex items-center justify-end space-x-2">
            <NuxtLink :to="`/orders/edit/${order.id}`" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
              <PencilIcon class="h-5 w-5" />
              <span class="sr-only">Edit</span>
            </NuxtLink>
            <button @click="deleteOrder(order.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
              <TrashIcon class="h-5 w-5" />
              <span class="sr-only">Delete</span>
            </button>
          </div>
        </td>
      </template>

      <template #empty>
        <div class="text-center py-10">
          <PackageIcon class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders found</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new order.
          </p>
          <div class="mt-6">
            <NuxtLink
              to="/orders/create"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircleIcon class="-ml-1 mr-2 h-5 w-5" />
              Create Order
            </NuxtLink>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template> 