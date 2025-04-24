<template>
  <div class="grid gap-6">
    <!-- Basic Information Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Basic Information</h3>
        <p class="text-sm text-slate-500">Manage your product's basic information</p>
      </div>
      <div class="p-6 space-y-6">
        <!-- Product Name -->
        <div class="grid gap-2">
          <label for="name" class="text-sm font-medium text-slate-900">
            Product Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            :value="name"
            @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
            class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter product name"
            required
          />
        </div>

        <!-- Slug -->
        <div class="grid gap-2">
          <label for="slug" class="text-sm font-medium text-slate-900">
            Slug <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              id="slug"
              type="text"
              :value="slug"
              @input="$emit('update:slug', ($event.target as HTMLInputElement).value)"
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="product-slug"
              required
            />
            <button
              type="button"
              @click="$emit('generate-slug')"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
            >
              Generate
            </button>
          </div>
        </div>

        <!-- Price Information -->
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Price -->
          <div class="grid gap-2">
            <label for="price" class="text-sm font-medium text-slate-900">
              Price <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-slate-500">$</span>
              <input
                id="price"
                type="number"
                :value="price"
                @input="$emit('update:price', Number(($event.target as HTMLInputElement).value))"
                class="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <!-- Compare at Price -->
          <div class="grid gap-2">
            <label for="compareAtPrice" class="text-sm font-medium text-slate-900">
              Compare at Price
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-slate-500">$</span>
              <input
                id="compareAtPrice"
                type="number"
                :value="compareAtPrice"
                @input="$emit('update:compareAtPrice', Number(($event.target as HTMLInputElement).value) || null)"
                class="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <!-- SKU and Barcode -->
        <div class="grid gap-6 md:grid-cols-2">
          <!-- SKU -->
          <div class="grid gap-2">
            <label for="sku" class="text-sm font-medium text-slate-900">
              SKU (Stock Keeping Unit)
            </label>
            <input
              id="sku"
              type="text"
              :value="sku"
              @input="$emit('update:sku', ($event.target as HTMLInputElement).value)"
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter SKU"
            />
          </div>

          <!-- Barcode -->
          <div class="grid gap-2">
            <label for="barcode" class="text-sm font-medium text-slate-900">
              Barcode (ISBN, UPC, GTIN, etc.)
            </label>
            <input
              id="barcode"
              type="text"
              :value="barcode"
              @input="$emit('update:barcode', ($event.target as HTMLInputElement).value)"
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter barcode"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Description Card -->
    <div class="rounded-lg border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-6 py-4">
        <h3 class="text-lg font-medium">Description</h3>
        <p class="text-sm text-slate-500">Write a detailed description of your product</p>
      </div>
      <div class="p-6 space-y-6">
        <!-- Short Description -->
        <div class="grid gap-2">
          <label for="shortDescription" class="text-sm font-medium text-slate-900">
            Short Description
          </label>
          <textarea
            id="shortDescription"
            :value="shortDescription"
            @input="$emit('update:shortDescription', ($event.target as HTMLTextAreaElement).value)"
            rows="3"
            class="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Write a short description..."
          ></textarea>
        </div>

        <!-- Full Description -->
        <div class="grid gap-2">
          <label for="description" class="text-sm font-medium text-slate-900">
            Full Description
          </label>
          <client-only>
            <QuillEditor
              id="description"
              :content="description"
              @update:content="$emit('update:description', $event)"
              :options="editorOptions"
              contentType="html"
              theme="snow"
            />
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice: number | null
  sku: string
  barcode: string
  editorOptions: any
}>()

defineEmits<{
  'update:name': [value: string]
  'update:slug': [value: string]
  'update:description': [value: string]
  'update:shortDescription': [value: string]
  'update:price': [value: number]
  'update:compareAtPrice': [value: number | null]
  'update:sku': [value: string]
  'update:barcode': [value: string]
  'generate-slug': []
}>()
</script> 