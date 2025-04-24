<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { useUpload } from '../../composables/useUpload';
import { ImageIcon, Trash2Icon } from 'lucide-vue-next';

const props = defineProps<{
  variant: {
    id?: number;
    sku: string;
    price: number;
    salePrice?: number | null;
    stock: number;
    thumbnail?: string;
    translations: {
      locale: string;
      name: string;
    }[];
  };
}>();

const emit = defineEmits<{
  (e: 'update:variant', value: typeof props.variant): void;
  (e: 'remove'): void;
}>();

const { locales, currentLocale } = useLocalization();
const { uploadImage, isUploading } = useUpload();

const defaultTranslation = computed(() => 
  props.variant.translations.find(t => t.locale === currentLocale.value) || props.variant.translations[0]
);

const errors = ref<Record<string, string>>({});

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    const file = input.files[0];
    const url = await uploadImage(file);
    emit('update:variant', { ...props.variant, thumbnail: url });
  } catch (err: any) {
    console.error('Failed to upload image:', err);
  }
}

function updateVariant(field: string, value: any) {
  emit('update:variant', { ...props.variant, [field]: value });
}

function updateTranslation(locale: string, field: string, value: string) {
  const translations = props.variant.translations.map(t => 
    t.locale === locale ? { ...t, [field]: value } : t
  );
  emit('update:variant', { ...props.variant, translations });
}

function validate() {
  errors.value = {};
  
  if (!defaultTranslation.value.name) {
    errors.value.name = 'Variant name is required';
  }
  
  if (!props.variant.sku) {
    errors.value.sku = 'SKU is required';
  }
  
  if (props.variant.price < 0) {
    errors.value.price = 'Price must be greater than or equal to 0';
  }
  
  if (props.variant.salePrice !== null && props.variant.salePrice > props.variant.price) {
    errors.value.salePrice = 'Sale price cannot be greater than regular price';
  }
  
  if (props.variant.stock < 0) {
    errors.value.stock = 'Stock must be greater than or equal to 0';
  }

  return Object.keys(errors.value).length === 0;
}

defineExpose({ validate });
</script>

<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div class="px-4 py-6 sm:p-8">
      <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <!-- Variant Name -->
        <div class="sm:col-span-4">
          <label for="variantName" class="block text-sm font-medium leading-6 text-gray-900">
            Variant Name
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="text"
                id="variantName"
                :value="defaultTranslation.name"
                @input="updateTranslation(defaultTranslation.locale, 'name', ($event.target as HTMLInputElement).value)"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.name }"
              />
            </div>
            <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
          </div>
        </div>

        <!-- SKU -->
        <div class="sm:col-span-4">
          <label for="variantSku" class="block text-sm font-medium leading-6 text-gray-900">
            SKU
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="text"
                id="variantSku"
                :value="variant.sku"
                @input="updateVariant('sku', ($event.target as HTMLInputElement).value)"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.sku }"
              />
            </div>
            <p v-if="errors.sku" class="mt-2 text-sm text-red-600">{{ errors.sku }}</p>
          </div>
        </div>

        <!-- Price -->
        <div class="sm:col-span-2">
          <label for="variantPrice" class="block text-sm font-medium leading-6 text-gray-900">
            Price
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="number"
                id="variantPrice"
                :value="variant.price"
                @input="updateVariant('price', Number(($event.target as HTMLInputElement).value))"
                min="0"
                step="0.01"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.price }"
              />
            </div>
            <p v-if="errors.price" class="mt-2 text-sm text-red-600">{{ errors.price }}</p>
          </div>
        </div>

        <!-- Sale Price -->
        <div class="sm:col-span-2">
          <label for="variantSalePrice" class="block text-sm font-medium leading-6 text-gray-900">
            Sale Price
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="number"
                id="variantSalePrice"
                :value="variant.salePrice"
                @input="updateVariant('salePrice', Number(($event.target as HTMLInputElement).value) || null)"
                min="0"
                step="0.01"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.salePrice }"
              />
            </div>
            <p v-if="errors.salePrice" class="mt-2 text-sm text-red-600">{{ errors.salePrice }}</p>
          </div>
        </div>

        <!-- Stock -->
        <div class="sm:col-span-2">
          <label for="variantStock" class="block text-sm font-medium leading-6 text-gray-900">
            Stock
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="number"
                id="variantStock"
                :value="variant.stock"
                @input="updateVariant('stock', Number(($event.target as HTMLInputElement).value))"
                min="0"
                step="1"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.stock }"
              />
            </div>
            <p v-if="errors.stock" class="mt-2 text-sm text-red-600">{{ errors.stock }}</p>
          </div>
        </div>

        <!-- Thumbnail -->
        <div class="col-span-full">
          <label for="variantThumbnail" class="block text-sm font-medium leading-6 text-gray-900">
            Thumbnail
          </label>
          <div class="mt-2 flex items-center gap-x-3">
            <div v-if="variant.thumbnail" class="relative">
              <img
                :src="variant.thumbnail"
                alt="Variant thumbnail"
                class="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
              />
              <button
                type="button"
                class="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                @click="updateVariant('thumbnail', '')"
              >
                <span class="sr-only">Remove thumbnail</span>
                <Trash2Icon class="h-4 w-4" />
              </button>
            </div>
            <div v-else class="h-24 w-24 flex-none rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon class="h-8 w-8 text-gray-300" />
            </div>
            <input
              type="file"
              id="variantThumbnail"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload"
              ref="fileInput"
            />
            <button
              type="button"
              class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              :disabled="isUploading"
              @click="$refs.fileInput.click()"
            >
              Change
            </button>
          </div>
        </div>

        <!-- Translations -->
        <div class="col-span-full" v-if="locales.length > 1">
          <div class="mt-6 space-y-8">
            <div v-for="locale in locales" :key="locale" v-show="locale !== currentLocale">
              <h4 class="text-sm font-medium text-gray-900">{{ locale.toUpperCase() }}</h4>
              <div class="mt-2">
                <label :for="'variantName-' + locale" class="block text-sm font-medium leading-6 text-gray-900">
                  Name
                </label>
                <div class="mt-2">
                  <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                    <input
                      type="text"
                      :id="'variantName-' + locale"
                      :value="variant.translations.find(t => t.locale === locale)?.name"
                      @input="updateTranslation(locale, 'name', ($event.target as HTMLInputElement).value)"
                      class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <button
        type="button"
        class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
        @click="emit('remove')"
      >
        <Trash2Icon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        Remove Variant
      </button>
    </div>
  </div>
</template> 