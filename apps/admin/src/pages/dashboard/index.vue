<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-8">
      <div class="min-w-0 flex-1">
        <h2
          class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight"
        >
          Dashboard Overview s
        </h2>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white dark:bg-neutral-800 shadow sm:rounded-lg p-6">
      <div class="animate-pulse flex space-x-4">
        <div class="rounded-full bg-gray-200 dark:bg-neutral-700 h-24 w-24"></div>
        <div class="flex-1 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="h-8 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div class="h-8 bg-gray-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Stats -->
    <div v-else-if="stats" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Revenue -->
      <div class="bg-white dark:bg-neutral-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DollarSign class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Revenue
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    ${{ stats.revenue }}
                  </div>
                  <div
                    class="ml-2 flex items-baseline text-sm font-semibold"
                    :class="stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ stats.revenueChange >= 0 ? "+" : "" }}{{ stats.revenueChange }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Orders -->
      <div class="bg-white dark:bg-neutral-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ShoppingCart class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Orders
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ stats.orders }}
                  </div>
                  <div
                    class="ml-2 flex items-baseline text-sm font-semibold"
                    :class="stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ stats.ordersChange >= 0 ? "+" : "" }}{{ stats.ordersChange }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Customers -->
      <div class="bg-white dark:bg-neutral-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Users class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Customers
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ stats.customers }}
                  </div>
                  <div
                    class="ml-2 flex items-baseline text-sm font-semibold"
                    :class="
                      stats.customersChange >= 0 ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ stats.customersChange >= 0 ? "+" : ""
                    }}{{ stats.customersChange }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Conversion Rate -->
      <div class="bg-white dark:bg-neutral-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TrendingUp class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Conversion Rate
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ stats.conversionRate }}%
                  </div>
                  <div
                    class="ml-2 flex items-baseline text-sm font-semibold"
                    :class="
                      stats.conversionRateChange >= 0 ? 'text-green-600' : 'text-red-600'
                    "
                  >
                    {{ stats.conversionRateChange >= 0 ? "+" : ""
                    }}{{ stats.conversionRateChange }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-vue-next";
import { useRouter } from "vue-router";

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const { checkAuth } = useAuth();
const trpc = useTrpc();
const isLoading = ref(true);
const stats = ref<any>(null);

onMounted(async () => {
  try {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Fetch dashboard stats
    const dashboardStats = await trpc.admin.dashboard.getDashboardStats.query();
    stats.value = {
      revenue: dashboardStats.totalRevenue.toFixed(1),
      revenueChange: dashboardStats.revenueChange,
      orders: dashboardStats.totalOrders,
      ordersChange: dashboardStats.ordersChange,
      customers: dashboardStats.totalCustomers,
      customersChange: dashboardStats.customersChange,
      conversionRate: dashboardStats.conversionRate.toFixed(1),
      conversionRateChange: dashboardStats.conversionRateChange,
    };
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>
