<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { useLocalization } from '../../composables/useLocalization';
import { useUpload } from '../../composables/useUpload';
import { useNotification } from '../../composables/useNotification';
import PageHeader from '../../components/ui/PageHeader.vue';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { 
  ImageIcon, 
  Trash2Icon,
  PlusCircleIcon,
  PackageIcon,
  TagIcon,
  ListChecksIcon
} from 'lucide-vue-next';
import VariantForm from '../../components/products/VariantForm.vue';
import AttributeForm from '../../components/products/AttributeForm.vue';
import SpecificationForm from '../../components/products/SpecificationForm.vue';

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Create Product - Admin Panel'
});

const router = useRouter();
const trpc = useTrpc();
const { t, locales, currentLocale } = useLocalization();
const { uploadImage, isUploading } = useUpload();
const { showSuccess, showError } = useNotification();

// Form data
const formData = ref({
  translations: locales.value.map(locale => ({
    locale,
    name: '',
    description: '',
    shortDescription: ''
  })),
  sku: '',
  price: 0,
  salePrice: null as number | null,
  stock: 0,
  published: false,
  thumbnail: '',
  attributes: [] as any[],
  specifications: [] as any[],
  variants: [] as any[]
});

// Form validation
const errors = ref<Record<string, string>>({});

// Computed properties
const defaultTranslation = computed(() => 
  formData.value.translations.find(t => t.locale === currentLocale.value) || formData.value.translations[0]
);

const hasVariants = computed(() => formData.value.variants.length > 0);

// Add variantForms ref
const variantForms = ref<any[]>([]);

// Add attributeForms ref
const attributeForms = ref<any[]>([]);

// Add specificationForms ref
const specificationForms = ref<any[]>([]);

// Methods
async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  try {
    const file = input.files[0];
    const url = await uploadImage(file);
    formData.value.thumbnail = url;
  } catch (err: any) {
    showError(err.message || 'Failed to upload image');
  }
}

async function handleSubmit() {
  try {
    errors.value = {};
    
    // Validate form
    if (!defaultTranslation.value.name) {
      errors.value.name = 'Product name is required';
      return;
    }

    if (!formData.value.sku) {
      errors.value.sku = 'SKU is required';
      return;
    }

    if (formData.value.price < 0) {
      errors.value.price = 'Price must be greater than or equal to 0';
      return;
    }

    if (formData.value.salePrice !== null && formData.value.salePrice > formData.value.price) {
      errors.value.salePrice = 'Sale price cannot be greater than regular price';
      return;
    }

    if (formData.value.stock < 0) {
      errors.value.stock = 'Stock must be greater than or equal to 0';
      return;
    }

    // Validate specifications
    const specificationValidations = await Promise.all(
      specificationForms.value.map(form => form.validate())
    );

    if (specificationValidations.some(isValid => !isValid)) {
      return;
    }

    // Validate attributes
    const attributeValidations = await Promise.all(
      attributeForms.value.map(form => form.validate())
    );

    if (attributeValidations.some(isValid => !isValid)) {
      return;
    }

    // Validate variants
    const variantValidations = await Promise.all(
      variantForms.value.map(form => form.validate())
    );

    if (variantValidations.some(isValid => !isValid)) {
      return;
    }

    // Create product
    await trpc.admin.products.createProduct.mutate(formData.value);
    
    showSuccess('Product created successfully');
    router.push('/products');
  } catch (err: any) {
    showError(err.message || 'Failed to create product');
  }
}

function handleCancel() {
  router.push('/products');
}
</script>

<template>
  <div class="min-h-screen bg-gray-50/50">
    <PageHeader title="Create Product" :show-back="true">
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="ml-3 inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          @click="handleSubmit"
        >
          Create Product
        </button>
      </template>
    </PageHeader>

    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div class="space-y-10 divide-y divide-gray-900/10">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="px-4 sm:px-0">
            <h2 class="text-base font-semibold leading-7 text-gray-900">Basic Information</h2>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you share.
            </p>
          </div>

          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div class="px-4 py-6 sm:p-8">
              <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <!-- Product Name -->
                <div class="sm:col-span-4">
                  <label for="name" class="block text-sm font-medium leading-6 text-gray-900">
                    Product Name
                    <span class="text-red-500">*</span>
                  </label>
                  <div class="mt-2">
                    <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                      <input
                        type="text"
                        id="name"
                        v-model="defaultTranslation.name"
                        class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        :class="{ 'border-red-500': errors.name }"
                      />
                    </div>
                    <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
                  </div>
                </div>

                <!-- SKU -->
                <div class="sm:col-span-4">
                  <label for="sku" class="block text-sm font-medium leading-6 text-gray-900">
                    SKU
                    <span class="text-red-500">*</span>
                  </label>
                  <div class="mt-2">
                    <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                      <input
                        type="text"
                        id="sku"
                        v-model="formData.sku"
                        class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        :class="{ 'border-red-500': errors.sku }"
                      />
                    </div>
                    <p v-if="errors.sku" class="mt-2 text-sm text-red-600">{{ errors.sku }}</p>
                  </div>
                </div>

                <!-- Price -->
                <div class="sm:col-span-2">
                  <label for="price" class="block text-sm font-medium leading-6 text-gray-900">
                    Price
                    <span class="text-red-500">*</span>
                  </label>
                  <div class="mt-2">
                    <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                      <input
                        type="number"
                        id="price"
                        v-model="formData.price"
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
                  <label for="salePrice" class="block text-sm font-medium leading-6 text-gray-900">
                    Sale Price
                  </label>
                  <div class="mt-2">
                    <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                      <input
                        type="number"
                        id="salePrice"
                        v-model="formData.salePrice"
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
                  <label for="stock" class="block text-sm font-medium leading-6 text-gray-900">
                    Stock
                    <span class="text-red-500">*</span>
                  </label>
                  <div class="mt-2">
                    <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                      <input
                        type="number"
                        id="stock"
                        v-model="formData.stock"
                        min="0"
                        step="1"
                        class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        :class="{ 'border-red-500': errors.stock }"
                      />
                    </div>
                    <p v-if="errors.stock" class="mt-2 text-sm text-red-600">{{ errors.stock }}</p>
                  </div>
                </div>

                <!-- Description -->
                <div class="col-span-full">
                  <label for="description" class="block text-sm font-medium leading-6 text-gray-900">
                    Description
                  </label>
                  <div class="mt-2">
                    <textarea
                      id="description"
                      v-model="defaultTranslation.description"
                      rows="3"
                      class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <!-- Short Description -->
                <div class="col-span-full">
                  <label for="shortDescription" class="block text-sm font-medium leading-6 text-gray-900">
                    Short Description
                  </label>
                  <div class="mt-2">
                    <textarea
                      id="shortDescription"
                      v-model="defaultTranslation.shortDescription"
                      rows="2"
                      class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <!-- Thumbnail -->
                <div class="col-span-full">
                  <label for="thumbnail" class="block text-sm font-medium leading-6 text-gray-900">
                    Thumbnail
                  </label>
                  <div class="mt-2 flex items-center gap-x-3">
                    <div v-if="formData.thumbnail" class="relative">
                      <img
                        :src="formData.thumbnail"
                        alt="Product thumbnail"
                        class="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
                      />
                      <button
                        type="button"
                        class="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                        @click="formData.thumbnail = ''"
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
                      id="thumbnail"
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

                <!-- Published Status -->
                <div class="col-span-full">
                  <div class="flex items-center gap-x-3">
                    <input
                      type="checkbox"
                      id="published"
                      v-model="formData.published"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <label for="published" class="block text-sm font-medium leading-6 text-gray-900">
                      Published
                    </label>
                  </div>
                  <p class="mt-1 text-sm leading-6 text-gray-600">
                    Make this product visible on your store
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Translations -->
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div class="px-4 sm:px-0">
            <h2 class="text-base font-semibold leading-7 text-gray-900">Translations</h2>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              Manage product information in different languages.
            </p>
          </div>

          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div class="px-4 py-6 sm:p-8">
              <div class="max-w-2xl space-y-10">
                <div v-for="translation in formData.translations" :key="translation.locale">
                  <h3 class="text-sm font-medium leading-6 text-gray-900 mb-4">
                    {{ translation.locale.toUpperCase() }}
                  </h3>

                  <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div class="sm:col-span-4">
                      <label :for="'name-' + translation.locale" class="block text-sm font-medium leading-6 text-gray-900">
                        Name
                      </label>
                      <div class="mt-2">
                        <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                          <input
                            type="text"
                            :id="'name-' + translation.locale"
                            v-model="translation.name"
                            class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="col-span-full">
                      <label :for="'description-' + translation.locale" class="block text-sm font-medium leading-6 text-gray-900">
                        Description
                      </label>
                      <div class="mt-2">
                        <textarea
                          :id="'description-' + translation.locale"
                          v-model="translation.description"
                          rows="3"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div class="col-span-full">
                      <label :for="'shortDescription-' + translation.locale" class="block text-sm font-medium leading-6 text-gray-900">
                        Short Description
                      </label>
                      <div class="mt-2">
                        <textarea
                          :id="'shortDescription-' + translation.locale"
                          v-model="translation.shortDescription"
                          rows="2"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Specifications -->
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div class="px-4 sm:px-0">
            <h2 class="text-base font-semibold leading-7 text-gray-900">Product Specifications</h2>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              Add technical specifications and details about your product.
            </p>
          </div>

          <div class="md:col-span-2">
            <div class="space-y-6">
              <div v-for="(specification, index) in formData.specifications" :key="index">
                <SpecificationForm
                  :specification="specification"
                  @update:specification="(newSpecification) => {
                    formData.specifications[index] = newSpecification;
                  }"
                  @remove="formData.specifications.splice(index, 1)"
                  ref="specificationForms"
                />
              </div>

              <button
                type="button"
                class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="
                  formData.specifications.push({
                    translations: locales.value.map(locale => ({
                      locale,
                      name: '',
                      value: ''
                    }))
                  })
                "
              >
                <PlusCircleIcon class="mx-auto h-8 w-8 text-gray-400" />
                <span class="mt-2 block text-sm font-semibold text-gray-900">Add specification</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Attributes -->
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div class="px-4 sm:px-0">
            <h2 class="text-base font-semibold leading-7 text-gray-900">Product Attributes</h2>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              Define attributes like size, color, material etc.
            </p>
          </div>

          <div class="md:col-span-2">
            <div class="space-y-6">
              <div v-for="(attribute, index) in formData.attributes" :key="index">
                <AttributeForm
                  :attribute="attribute"
                  @update:attribute="(newAttribute) => {
                    formData.attributes[index] = newAttribute;
                  }"
                  @remove="formData.attributes.splice(index, 1)"
                  ref="attributeForms"
                />
              </div>

              <button
                type="button"
                class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="
                  formData.attributes.push({
                    translations: locales.value.map(locale => ({
                      locale,
                      name: ''
                    })),
                    values: []
                  })
                "
              >
                <PlusCircleIcon class="mx-auto h-8 w-8 text-gray-400" />
                <span class="mt-2 block text-sm font-semibold text-gray-900">Add attribute</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Variants -->
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div class="px-4 sm:px-0">
            <h2 class="text-base font-semibold leading-7 text-gray-900">Product Variants</h2>
            <p class="mt-1 text-sm leading-6 text-gray-600">
              Add variations of your product with different attributes.
            </p>
          </div>

          <div class="md:col-span-2">
            <div class="space-y-6">
              <div v-for="(variant, index) in formData.variants" :key="index">
                <VariantForm
                  :variant="variant"
                  @update:variant="(newVariant) => {
                    formData.variants[index] = newVariant;
                  }"
                  @remove="formData.variants.splice(index, 1)"
                  ref="variantForms"
                />
              </div>

              <button
                type="button"
                class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                @click="
                  formData.variants.push({
                    sku: '',
                    price: 0,
                    salePrice: null,
                    stock: 0,
                    translations: locales.value.map(locale => ({
                      locale,
                      name: ''
                    }))
                  })
                "
              >
                <PlusCircleIcon class="mx-auto h-8 w-8 text-gray-400" />
                <span class="mt-2 block text-sm font-semibold text-gray-900">Add variant</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template> 