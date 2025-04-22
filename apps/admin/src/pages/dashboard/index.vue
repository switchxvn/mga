<template>
  <div>
    <div class="md:flex md:items-center md:justify-between mb-8">
      <div class="min-w-0 flex-1">
        <h2
          class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight"
        >
          Dashboard Overview
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          v-if="hasManagePermission"
          @click="handleCalculateStats"
          :disabled="isCalculating"
          class="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          <RefreshCw v-if="isCalculating" class="h-4 w-4 mr-2 animate-spin" />
          <CalculatorIcon v-else class="h-4 w-4 mr-2" />
          {{ isCalculating ? 'Calculating...' : 'Calculate Stats' }}
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="rounded-md bg-red-50 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <AlertCircle class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
        </div>
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
                    ${{ stats.totalRevenue }}
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
                    {{ stats.totalOrders }}
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
                    {{ stats.totalCustomers }}
                  </div>
                  <div
                    class="ml-2 flex items-baseline text-sm font-semibold"
                    :class="stats.customersChange >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ stats.customersChange >= 0 ? "+" : "" }}{{ stats.customersChange }}%
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
                    :class="stats.conversionRateChange >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ stats.conversionRateChange >= 0 ? "+" : "" }}{{ stats.conversionRateChange }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div v-if="activities?.length" class="mt-8">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
        Recent Activities
      </h3>
      <div class="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200 dark:divide-neutral-700">
          <li v-for="activity in activities" :key="activity.id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-indigo-600 truncate">
                  {{ activity.type }}
                </p>
                <div class="ml-2 flex-shrink-0 flex">
                  <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {{ new Date(activity.createdAt).toLocaleDateString() }}
                  </p>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex">
                  <p class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    {{ activity.description }}
                  </p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  CalculatorIcon,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { Permissions } from "../../constants/permissions";

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const { checkAuth, hasPermission } = useAuth();
const trpc = useTrpc();

const isLoading = ref(true);
const isCalculating = ref(false);
const error = ref<string | null>(null);
const stats = ref<any>(null);
const activities = ref<any[]>([]);

const hasManagePermission = computed(() => hasPermission(Permissions.MANAGE_DASHBOARD));

async function loadDashboardData() {
  try {
    isLoading.value = true;
    error.value = null;

    const [dashboardStats, recentActivities] = await Promise.all([
      trpc.admin.dashboard.getDashboardStats.query(),
      trpc.admin.dashboard.getRecentActivities.query({ limit: 5 }),
    ]);

    stats.value = dashboardStats;
    activities.value = recentActivities;
  } catch (err: any) {
    error.value = err.message || "Failed to load dashboard data";
    console.error("Error loading dashboard data:", err);
  } finally {
    isLoading.value = false;
  }
}

async function handleCalculateStats() {
  try {
    isCalculating.value = true;
    error.value = null;

    await trpc.admin.dashboard.calculateStats.mutate();
    await loadDashboardData(); // Reload the data after calculation
  } catch (err: any) {
    error.value = err.message || "Failed to calculate statistics";
    console.error("Error calculating stats:", err);
  } finally {
    isCalculating.value = false;
  }
}

onMounted(async () => {
  try {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    await loadDashboardData();
  } catch (err: any) {
    error.value = err.message || "Failed to initialize dashboard";
    console.error("Error initializing dashboard:", err);
    isLoading.value = false;
  }
});
</script>
