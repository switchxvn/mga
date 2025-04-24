<template>
  <div class="grid gap-6">
    <!-- Inventory Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Inventory</h3>
        <p class="text-sm text-slate-500">Manage your product's inventory and stock</p>
      </div>
      <div class="p-6">
        <div class="grid gap-6">
          <!-- Track Inventory Toggle -->
          <div class="flex items-center justify-between">
            <div class="grid gap-1.5">
              <label
                for="trackInventory"
                class="text-sm font-medium text-slate-900"
              >
                Track inventory
              </label>
              <p class="text-sm text-slate-500">
                Keep track of stock counts for this product
              </p>
            </div>
            <Switch
              id="trackInventory"
              :model-value="trackInventory"
              @update:model-value="$emit('update:track-inventory', $event)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="trackInventory ? 'bg-primary' : 'bg-slate-200'"
            >
              <span class="sr-only">Toggle inventory tracking</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="trackInventory ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </div>

          <!-- Inventory Fields -->
          <template v-if="trackInventory">
            <div class="grid gap-6 sm:grid-cols-2">
              <!-- Stock Quantity -->
              <div class="grid gap-2">
                <label
                  for="quantity"
                  class="text-sm font-medium text-slate-900"
                >
                  Quantity in stock
                </label>
                <input
                  id="quantity"
                  type="number"
                  :value="quantity"
                  @input="$emit('update:quantity', Number(($event.target as HTMLInputElement).value))"
                  class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  min="0"
                  :disabled="!trackInventory"
                />
              </div>

              <!-- Low Stock Threshold -->
              <div class="grid gap-2">
                <label
                  for="lowStockThreshold"
                  class="text-sm font-medium text-slate-900"
                >
                  Low stock threshold
                </label>
                <input
                  id="lowStockThreshold"
                  type="number"
                  :value="lowStockThreshold"
                  @input="$emit('update:low-stock-threshold', Number(($event.target as HTMLInputElement).value))"
                  class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  min="0"
                  :disabled="!trackInventory"
                />
              </div>
            </div>

            <!-- Stock Status -->
            <div class="grid gap-2">
              <label
                for="stockStatus"
                class="text-sm font-medium text-slate-900"
              >
                Stock status
              </label>
              <select
                id="stockStatus"
                :value="stockStatus"
                @change="$emit('update:stock-status', ($event.target as HTMLSelectElement).value)"
                class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!trackInventory"
              >
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="backorder">On backorder</option>
              </select>
            </div>

            <!-- Allow Backorders -->
            <div class="flex items-center justify-between">
              <div class="grid gap-1.5">
                <label
                  for="allowBackorders"
                  class="text-sm font-medium text-slate-900"
                >
                  Allow backorders
                </label>
                <p class="text-sm text-slate-500">
                  Allow customers to purchase when out of stock
                </p>
              </div>
              <Switch
                id="allowBackorders"
                :model-value="allowBackorders"
                @update:model-value="$emit('update:allow-backorders', $event)"
                class="relative inline-flex h-6 w-11 items-center rounded-full"
                :class="allowBackorders ? 'bg-primary' : 'bg-slate-200'"
                :disabled="!trackInventory"
              >
                <span class="sr-only">Toggle backorders</span>
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                  :class="allowBackorders ? 'translate-x-6' : 'translate-x-1'"
                />
              </Switch>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Stock History Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Stock History</h3>
        <p class="text-sm text-slate-500">Recent stock movements and adjustments</p>
      </div>
      <div class="p-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="px-4 py-2 text-left font-medium">Date</th>
                <th class="px-4 py-2 text-left font-medium">Type</th>
                <th class="px-4 py-2 text-left font-medium">Quantity</th>
                <th class="px-4 py-2 text-left font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(movement, index) in stockMovements"
                :key="index"
                class="border-b border-slate-200"
              >
                <td class="px-4 py-2">{{ formatDate(movement.date) }}</td>
                <td class="px-4 py-2">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-700': movement.type === 'increase',
                      'bg-red-100 text-red-700': movement.type === 'decrease',
                      'bg-blue-100 text-blue-700': movement.type === 'adjustment'
                    }"
                  >
                    {{ movement.type }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  {{ movement.type === 'decrease' ? '-' : '+' }}{{ movement.quantity }}
                </td>
                <td class="px-4 py-2 text-slate-500">{{ movement.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue'

interface StockMovement {
  date: string
  type: 'increase' | 'decrease' | 'adjustment'
  quantity: number
  note: string
}

const props = defineProps<{
  trackInventory: boolean
  quantity: number
  lowStockThreshold: number
  stockStatus: string
  allowBackorders: boolean
  stockMovements: StockMovement[]
}>()

defineEmits<{
  'update:track-inventory': [value: boolean]
  'update:quantity': [value: number]
  'update:low-stock-threshold': [value: number]
  'update:stock-status': [value: string]
  'update:allow-backorders': [value: boolean]
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 