<template>
  <div class="grid gap-6">
    <!-- Variants Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Product Variants</h3>
        <p class="text-sm text-slate-500">Manage your product's variants and options</p>
      </div>
      <div class="p-6">
        <div class="grid gap-6">
          <!-- Has Variants Toggle -->
          <div class="flex items-center justify-between">
            <div class="grid gap-1.5">
              <label
                for="hasVariants"
                class="text-sm font-medium text-slate-900"
              >
                This product has multiple options
              </label>
              <p class="text-sm text-slate-500">
                Like different sizes or colors
              </p>
            </div>
            <Switch
              id="hasVariants"
              :model-value="hasVariants"
              @update:model-value="$emit('update:has-variants', $event)"
              class="relative inline-flex h-6 w-11 items-center rounded-full"
              :class="hasVariants ? 'bg-primary' : 'bg-slate-200'"
            >
              <span class="sr-only">Toggle variants</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="hasVariants ? 'translate-x-6' : 'translate-x-1'"
              />
            </Switch>
          </div>

          <!-- Variant Options -->
          <template v-if="hasVariants">
            <div class="grid gap-4">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-medium">Options</h4>
                <button
                  type="button"
                  @click="addOption"
                  class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  <PlusIcon class="h-4 w-4" />
                  Add Option
                </button>
              </div>

              <!-- Option List -->
              <div class="grid gap-4">
                <div
                  v-for="(option, index) in options"
                  :key="index"
                  class="grid gap-4 rounded-lg border border-slate-200 p-4"
                >
                  <div class="flex items-center justify-between">
                    <div class="grid gap-2">
                      <input
                        type="text"
                        v-model="option.name"
                        placeholder="Option name (e.g. Size, Color)"
                        class="flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      @click="removeOption(index)"
                      class="rounded-full p-2 hover:bg-slate-100"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>

                  <!-- Option Values -->
                  <div class="grid gap-2">
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="(value, valueIndex) in option.values"
                        :key="valueIndex"
                        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm"
                      >
                        <span>{{ value }}</span>
                        <button
                          type="button"
                          @click="removeValue(index, valueIndex)"
                          class="rounded-full p-0.5 hover:bg-slate-200 transition-colors"
                        >
                          <XIcon class="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <!-- Add Value Input -->
                    <div class="flex gap-2">
                      <input
                        type="text"
                        v-model="option.newValue"
                        placeholder="Enter value and press Enter"
                        @keydown.enter="addValue(index)"
                        class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <button
                        type="button"
                        @click="addValue(index)"
                        class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Generated Variants -->
            <div v-if="variants.length > 0" class="grid gap-4">
              <h4 class="text-sm font-medium">Variants</h4>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-slate-200">
                      <th class="px-4 py-2 text-left font-medium">Variant</th>
                      <th class="px-4 py-2 text-left font-medium">Price</th>
                      <th class="px-4 py-2 text-left font-medium">SKU</th>
                      <th class="px-4 py-2 text-left font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(variant, index) in variants"
                      :key="index"
                      class="border-b border-slate-200"
                    >
                      <td class="px-4 py-2">{{ variant.name }}</td>
                      <td class="px-4 py-2">
                        <div class="relative w-32">
                          <span class="absolute left-3 top-2.5 text-slate-500">$</span>
                          <input
                            type="number"
                            v-model="variant.price"
                            class="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="text"
                          v-model="variant.sku"
                          class="flex h-10 w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                      <td class="px-4 py-2">
                        <input
                          type="number"
                          v-model="variant.stock"
                          class="flex h-10 w-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          min="0"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PlusIcon, TrashIcon, XIcon } from 'lucide-vue-next'
import { Switch } from '@headlessui/vue'

interface Option {
  name: string
  values: string[]
  newValue: string
}

interface Variant {
  name: string
  price: number
  sku: string
  stock: number
  options: Record<string, string>
}

const props = defineProps<{
  hasVariants: boolean
  modelValue: Variant[]
}>()

const emit = defineEmits<{
  'update:has-variants': [value: boolean]
  'update:modelValue': [value: Variant[]]
}>()

const options = ref<Option[]>([])

// Add new option
const addOption = () => {
  options.value.push({
    name: '',
    values: [],
    newValue: ''
  })
}

// Remove option
const removeOption = (index: number) => {
  options.value.splice(index, 1)
}

// Add value to option
const addValue = (optionIndex: number) => {
  const option = options.value[optionIndex]
  if (option.newValue && !option.values.includes(option.newValue)) {
    option.values.push(option.newValue)
    option.newValue = ''
  }
}

// Remove value from option
const removeValue = (optionIndex: number, valueIndex: number) => {
  options.value[optionIndex].values.splice(valueIndex, 1)
}

// Generate all possible variants from options
const variants = computed(() => {
  if (!options.value.length) return []

  const generateCombinations = (
    optionIndex: number,
    current: Record<string, string>
  ): Record<string, string>[] => {
    if (optionIndex === options.value.length) {
      return [current]
    }

    const option = options.value[optionIndex]
    const combinations: Record<string, string>[] = []

    for (const value of option.values) {
      combinations.push(
        ...generateCombinations(optionIndex + 1, {
          ...current,
          [option.name]: value
        })
      )
    }

    return combinations
  }

  const combinations = generateCombinations(0, {})
  
  return combinations.map(combo => {
    const existingVariant = props.modelValue.find(v => {
      return Object.entries(v.options).every(
        ([key, value]) => combo[key] === value
      )
    })

    const name = Object.entries(combo)
      .map(([key, value]) => `${value}`)
      .join(' / ')

    return existingVariant || {
      name,
      price: 0,
      sku: '',
      stock: 0,
      options: combo
    }
  })
})

// Update variants when they change
watch(variants, (newVariants) => {
  emit('update:modelValue', newVariants)
}, { deep: true })
</script> 