<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { useAuth } from '../../composables/useAuth';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { ImageIcon, SaveIcon, XIcon } from 'lucide-vue-next';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/header/PageHeader.vue';
import { usePermissions } from '../../composables/usePermissions';
import PermissionAlert from '../../components/common/PermissionAlert.vue';

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {};
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth", "permission"],
});

useHead({
  title: 'Create Hero Slider - Admin Panel'
});

const router = useRouter();
const route = useRoute();
const { checkAuth } = useAuth();
const trpc = useTrpc();
const { hasPermission, isSuperAdmin } = usePermissions();

// State
const isLoading = ref(false);
const isSaving = ref(false);
const error = ref<string | null>(null);
const themes = ref<any[]>([]);
const isDragging = ref(false);
const isUploading = ref(false);
const imagePreview = ref<string | null>(null);

// Form data
const formData = reactive({
  title: '',
  description: '',
  imageUrl: '',
  buttonText: '',
  buttonLink: '',
  order: 0,
  isActive: true,
  themeId: route.query.themeId ? Number(route.query.themeId) : undefined
});

// Check permissions
const userCanManageSliders = computed(() => {
  if (isSuperAdmin.value) return true;
  return hasPermission('MANAGE_THEMES');
});

// Fetch themes
const fetchThemes = async () => {
  try {
    isLoading.value = true;
    const result = await trpc.admin.theme.getAll.query();
    themes.value = result;
  } catch (err: any) {
    console.error('Error fetching themes:', err);
    error.value = err.message || 'Failed to fetch themes';
  } finally {
    isLoading.value = false;
  }
};

// Handle image upload
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  await processUpload(file);
};

// Handle image drop events
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

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

// Process image upload
const processUpload = async (file: File) => {
  try {
    isUploading.value = true;
    error.value = null;
    
    // Create FormData
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    // Upload to server
    const response = await fetch('/api/admin-upload/upload-image', {
      method: 'POST',
      body: uploadData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const result = await response.json();
    
    // Update form data with image URL
    formData.imageUrl = result.url;
    
    // Show image preview
    imagePreview.value = result.url;
    
  } catch (err: any) {
    console.error('Error uploading image:', err);
    error.value = err.message || 'Failed to upload image';
    
    Swal.fire({
      icon: 'error',
      title: 'Upload Error',
      text: err.message || 'Failed to upload image'
    });
  } finally {
    isUploading.value = false;
  }
};

// Save hero slider
const saveHeroSlider = async () => {
  // Check theme selection
  if (!formData.themeId) {
    error.value = 'Please select a theme';
    
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please select a theme'
    });
    
    return;
  }
  
  // Check for required title
  if (!formData.title) {
    error.value = 'Please enter a title';
    
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please enter a title'
    });
    
    return;
  }
  
  // Check for image
  if (!formData.imageUrl) {
    error.value = 'Please upload an image';
    
    Swal.fire({
      icon: 'error',
      title: 'Validation Error',
      text: 'Please upload an image'
    });
    
    return;
  }
  
  try {
    isSaving.value = true;
    error.value = null;
    
    // Add the slider
    await trpc.admin.heroSlider.create.mutate(formData);
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Hero slider created successfully',
      timer: 1500,
      showConfirmButton: false
    });
    
    // Redirect back to the hero sliders page
    router.push({
      path: '/hero-slider',
      query: { themeId: formData.themeId }
    });
    
  } catch (err: any) {
    console.error('Error creating hero slider:', err);
    error.value = err.message || 'Failed to create hero slider';
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Failed to create hero slider'
    });
  } finally {
    isSaving.value = false;
  }
};

// Cancel creation and go back
const cancelCreate = () => {
  router.back();
};

// Initial load
onMounted(async () => {
  await checkAuth();
  await fetchThemes();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Create Hero Slider"
      description="Add a new hero slider to your website"
    >
      <template #actions>
        <div class="flex items-center gap-2">
          <button
            @click="cancelCreate"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-2" />
            Back
          </button>
          
          <button
            @click="saveHeroSlider"
            :disabled="isSaving"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SaveIcon class="h-4 w-4 mr-2" />
            {{ isSaving ? 'Saving...' : 'Save Slider' }}
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Permission Error -->
    <div v-if="!userCanManageSliders">
      <PermissionAlert 
        title="Permission Error" 
        message="You don't have permission to manage hero sliders"
      />
    </div>

    <!-- Create Form -->
    <div v-else>
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Hero Slider Information
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below to create a new hero slider.
          </p>
        </div>

        <div class="px-4 py-5 sm:p-6">
          <form @submit.prevent="saveHeroSlider" class="space-y-6">
            <!-- Theme Selection -->
            <div>
              <label for="theme" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme *
              </label>
              <select
                id="theme"
                v-model="formData.themeId"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="" disabled selected>Select a theme</option>
                <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                  {{ theme.name }}
                </option>
              </select>
            </div>

            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <input
                type="text"
                id="title"
                v-model="formData.title"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter slider title"
                required
              />
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter slider description"
              ></textarea>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image *
              </label>
              <div
                class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md"
                :class="{ 
                  'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700': isDragging,
                  'bg-gray-50 dark:bg-gray-800': !isDragging
                }"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
              >
                <div v-if="!imagePreview" class="space-y-1 text-center">
                  <div class="flex justify-center">
                    <ImageIcon class="mx-auto h-12 w-12 text-gray-400" />
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    <label for="file-upload" class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload an image</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/*" @change="handleImageUpload" />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                <div v-else class="relative">
                  <img :src="imagePreview" alt="Preview" class="max-h-48 mx-auto rounded-md" />
                  <button
                    type="button"
                    @click="imagePreview = null; formData.imageUrl = ''"
                    class="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                  >
                    <XIcon class="h-4 w-4" />
                  </button>
                </div>
                <div v-if="isUploading" class="mt-4 flex justify-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                </div>
              </div>
            </div>

            <!-- Button Text -->
            <div>
              <label for="buttonText" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Button Text
              </label>
              <input
                type="text"
                id="buttonText"
                v-model="formData.buttonText"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter button text (optional)"
              />
            </div>

            <!-- Button Link -->
            <div>
              <label for="buttonLink" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Button Link
              </label>
              <input
                type="text"
                id="buttonLink"
                v-model="formData.buttonLink"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter button link URL (optional)"
              />
            </div>
            
            <!-- Order -->
            <div>
              <label for="order" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                v-model.number="formData.order"
                min="0"
                class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lower numbers will be displayed first.
              </p>
            </div>

            <!-- Is Active -->
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="isActive"
                  type="checkbox"
                  v-model="formData.isActive"
                  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="isActive" class="font-medium text-gray-700 dark:text-gray-300">Active</label>
                <p class="text-gray-500 dark:text-gray-400">
                  Only active sliders will be displayed on the website.
                </p>
              </div>
            </div>
          </form>
        </div>

        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
          <button
            type="button"
            @click="cancelCreate"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveHeroSlider"
            :disabled="isSaving"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Saving...' : 'Save Slider' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 