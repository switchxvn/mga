<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { useTrpc } from '../../../composables/useTrpc';
import { useAuth } from '../../../composables/useAuth';
import { useUpload } from '../../../composables/useUpload';
import { Gallery } from '@ew/shared';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import {
  XIcon,
  SaveAllIcon,
  FileTextIcon,
  SettingsIcon
} from 'lucide-vue-next';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {}; 
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: 'Edit Gallery Item - Admin Panel'
});

const router = useRouter();
const route = useRoute();
const galleryId = Number(route.params.id);
const { checkAuth } = useAuth();
const trpc = useTrpc();
const { uploadImage } = useUpload();

const isLoading = ref(false);
const isFetchingData = ref(true);
const isUploadingImage = ref(false);
const error = ref<string | null>(null);

const title = ref('');
const description = ref('');
const imageUrl = ref('');
const isActive = ref(true);
const sequence = ref(0);
const categories = ref<Array<{id: number, name: string}>>([]);
const selectedCategoryIds = ref<number[]>([]);
const isDragging = ref(false);

// Tab management
const currentTab = ref('basic');
const tabs = [
  { 
    id: 'basic', 
    name: 'Basic Info', 
    icon: FileTextIcon
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: SettingsIcon
  }
];

// Fetch gallery item
const fetchGalleryItem = async () => {
  try {
    // Kiểm tra client side
    if (!process.client) {
      console.log('Skip fetchGalleryItem on server side to avoid localStorage error');
      return;
    }

    isFetchingData.value = true;
    error.value = null;

    const result = await trpc.admin.galleries.getById.query(galleryId);
    
    if (!result) {
      error.value = "Gallery item not found";
      return;
    }
    
    // Populate form fields
    title.value = result.translations?.[0]?.title || '';
    description.value = result.translations?.[0]?.description || '';
    imageUrl.value = result.image || '';
    isActive.value = result.isActive;
    sequence.value = result.sequence;
    selectedCategoryIds.value = result.categories?.map(cat => cat.id) || [];
    
  } catch (err: any) {
    console.error("Error fetching gallery item:", err);
    error.value = err.message || "Failed to fetch gallery item";
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || "Failed to fetch gallery item"
    }).then(() => {
      router.push('/galleries');
    });
  } finally {
    isFetchingData.value = false;
  }
};

// Fetch categories
const fetchCategories = async () => {
  try {
    // Kiểm tra client side
    if (!process.client) {
      console.log('Skip fetchCategories on server side to avoid localStorage error');
      return;
    }

    const result = await trpc.admin.category.getByType.query({
      type: 'gallery'
    });
    categories.value = result
      .filter(cat => cat !== null)
      .map(cat => ({
        id: cat.id,
        name: cat.translations && cat.translations[0]?.name || `Category ${cat.id}`
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
  await processUpload(file);
};

// Handle drop event
const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  
  if (!event.dataTransfer?.files.length) return;
  
  const file = event.dataTransfer.files[0];
  if (!file.type.startsWith('image/')) {
    error.value = "Please drop an image file";
    return;
  }
  
  await processUpload(file);
};

// Handle drag over event
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

// Handle drag leave event
const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

// Process the upload
const processUpload = async (file: File) => {
  try {
    isUploadingImage.value = true;
    
    // Upload using useUpload composable
    const url = await uploadImage(file, 'gallery');
    imageUrl.value = url;
    
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

// Update gallery item
const updateGallery = async () => {
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
    
    await trpc.admin.galleries.update.mutate({
      id: galleryId,
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
      text: 'Gallery item updated successfully',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      router.push('/galleries');
    });
  } catch (err: any) {
    console.error("Error updating gallery item:", err);
    error.value = err.message || "Failed to update gallery item";
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || "Failed to update gallery item"
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    router.push("/auth/login");
    return;
  }
  
  if (process.client) {
    await Promise.all([
      fetchCategories(),
      fetchGalleryItem()
    ]);
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex-1 overflow-y-auto">
      <form @submit.prevent="updateGallery" class="space-y-6">
        <!-- Header -->
        <PageHeader
          title="Edit Gallery Item"
          description="Update an existing image in your gallery collection"
        >
          <template #actions>
            <button 
              type="button"
              @click="router.push('/galleries')" 
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
            >
              <XIcon class="w-4 h-4 mr-2" />
              Cancel
            </button>

            <button 
              type="submit"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
            >
              <SaveAllIcon class="w-4 h-4 mr-2" />
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </template>
        </PageHeader>
        
        <!-- Loading State -->
        <div v-if="isFetchingData" class="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-32 bg-gray-200 dark:bg-neutral-700 rounded w-64 mx-auto"></div>
            <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
        
        <div v-else>
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
          
          <!-- Tabs -->
          <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
            <button
              type="button"
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
              :class="{
                'bg-primary text-white': currentTab === tab.id,
                'text-slate-600 hover:text-slate-900 hover:bg-slate-50': currentTab !== tab.id
              }"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.name }}
            </button>
          </nav>
          
          <div class="grid gap-6">
            <!-- Basic Info Tab -->
            <div v-show="currentTab === 'basic'" class="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div class="space-y-4">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
                
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
                    <div 
                      v-else 
                      class="border-2 border-dashed rounded-lg p-6 w-full flex flex-col items-center justify-center transition-colors"
                      :class="{
                        'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20': isDragging,
                        'border-gray-300 dark:border-gray-600': !isDragging
                      }"
                      @dragover="handleDragOver"
                      @dragleave="handleDragLeave"
                      @drop="handleDrop"
                    >
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Drag & drop an image or click to upload
                      </p>
                      <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
              </div>
            </div>
            
            <!-- Settings Tab -->
            <div v-show="currentTab === 'settings'" class="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div class="space-y-4">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Settings</h2>
                
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
                  <p class="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    When active, this gallery item will be visible on the frontend
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-section {
  @apply bg-white rounded-lg p-6 space-y-6 shadow-sm;
}

.section-title {
  @apply text-lg font-medium text-gray-900;
}
</style> 