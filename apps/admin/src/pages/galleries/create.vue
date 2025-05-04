<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useTrpc } from '../../composables/useTrpc';
import { useAuth } from '../../composables/useAuth';
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
  title: 'Create Gallery Item - Admin Panel'
});

const router = useRouter();
const { checkAuth } = useAuth();
const trpc = useTrpc();

const isLoading = ref(false);
const isUploadingImage = ref(false);
const error = ref<string | null>(null);

const title = ref('');
const description = ref('');
const imageUrl = ref('');
const isActive = ref(true);
const sequence = ref(0);
const categories = ref<Array<{id: number, name: string}>>([]);
const selectedCategoryIds = ref<number[]>([]);

// Fetch categories
const fetchCategories = async () => {
  try {
    const result = await trpc.admin.categories.getByType.query({
      type: 'GALLERY'
    });
    categories.value = result.map(cat => ({
      id: cat.id,
      name: cat.translations[0]?.name || `Category ${cat.id}`
    }));
  } catch (err: any) {
    console.error("Error loading categories:", err);
    error.value = err.message || "Failed to load categories";
  }
};

// Handle image upload
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  
  try {
    isUploadingImage.value = true;
    
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload using your API
    const uploadResult = await trpc.admin.uploads.uploadImage.mutate({
      file: formData,
      type: 'gallery'
    });
    
    imageUrl.value = uploadResult.url;
    
  } catch (err: any) {
    console.error("Error uploading image:", err);
    error.value = err.message || "Failed to upload image";
    
    Swal.fire({
      icon: 'error',
      title: 'Upload Error',
      text: err.message || "Failed to upload image"
    });
  } finally {
    isUploadingImage.value = false;
  }
};

// Create new gallery item
const createGallery = async () => {
  if (!imageUrl.value) {
    error.value = "Please upload an image";
    return;
  }
  
  if (!title.value) {
    error.value = "Please enter a title";
    return;
  }
  
  try {
    isLoading.value = true;
    error.value = null;
    
    await trpc.admin.galleries.create.mutate({
      image: imageUrl.value,
      isActive: isActive.value,
      sequence: sequence.value,
      categoryIds: selectedCategoryIds.value,
      translations: [
        {
          locale: 'vi',
          title: title.value,
          description: description.value || undefined
        }
      ]
    });
    
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Gallery item created successfully',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      router.push('/galleries');
    });
  } catch (err: any) {
    console.error("Error creating gallery item:", err);
    error.value = err.message || "Failed to create gallery item";
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || "Failed to create gallery item"
    });
  } finally {
    isLoading.value = false;
  }
};

const cancelCreation = () => {
  router.push('/galleries');
};

onMounted(async () => {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    
    await fetchCategories();
  } catch (err: any) {
    console.error("Error initializing create gallery page:", err);
    error.value = err.message || "Failed to initialize create gallery page";
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Create New Gallery Item"
      description="Add a new image to your gallery collection"
    />
    
    <!-- Form -->
    <div class="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
      <form @submit.prevent="createGallery" class="space-y-6">
        <!-- Error Banner -->
        <div v-if="error" class="p-4 rounded-md bg-red-50 dark:bg-red-900/30">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">{{ error }}</h3>
            </div>
          </div>
        </div>
        
        <!-- Image Upload -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Image <span class="text-red-500">*</span>
          </label>
          <div class="flex flex-col items-center space-y-4">
            <div v-if="imageUrl" class="relative w-64 h-64 border rounded-lg overflow-hidden">
              <img :src="imageUrl" alt="Gallery preview" class="w-full h-full object-cover" />
              <button 
                type="button"
                class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                @click="imageUrl = ''"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div v-else class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full flex flex-col items-center justify-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Upload an image</p>
            </div>
            
            <div>
              <label v-if="!isUploadingImage" class="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                {{ imageUrl ? 'Change Image' : 'Upload Image' }}
                <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
              </label>
              <div v-else class="flex items-center space-x-2">
                <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          />
        </div>
        
        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            v-model="description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          ></textarea>
        </div>
        
        <!-- Categories -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categories
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="category in categories"
              :key="category.id"
              :class="{
                'flex items-center rounded-lg border p-3 cursor-pointer transition-colors': true,
                'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30': selectedCategoryIds.includes(category.id),
                'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-700': !selectedCategoryIds.includes(category.id)
              }"
              @click="
                selectedCategoryIds.includes(category.id) 
                  ? selectedCategoryIds = selectedCategoryIds.filter(id => id !== category.id)
                  : selectedCategoryIds.push(category.id)
              "
            >
              <input
                type="checkbox"
                :checked="selectedCategoryIds.includes(category.id)"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                @change="
                  selectedCategoryIds.includes(category.id) 
                    ? selectedCategoryIds = selectedCategoryIds.filter(id => id !== category.id)
                    : selectedCategoryIds.push(category.id)
                "
              />
              <label class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ category.name }}
              </label>
            </div>
          </div>
        </div>
        
        <!-- Sequence -->
        <div>
          <label for="sequence" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Sequence
          </label>
          <input
            id="sequence"
            v-model="sequence"
            type="number"
            min="0"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lower numbers will appear first
          </p>
        </div>
        
        <!-- Active Status -->
        <div class="flex items-center">
          <input
            id="isActive"
            v-model="isActive"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="isActive" class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Active
          </label>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="cancelCreation"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading || isUploadingImage"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Creating...' : 'Create Gallery Item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 