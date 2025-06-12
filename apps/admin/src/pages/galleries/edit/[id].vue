<script setup lang="ts">
import {
  FileTextIcon,
  SaveAllIcon,
  SettingsIcon,
  XIcon
} from 'lucide-vue-next';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '../../../components/common/header/PageHeader.vue';
import { useAuth } from '../../../composables/useAuth';
import { GalleryCategory, useGallery } from '../../../composables/useGallery';

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
const galleryManager = useGallery();

// Tab management
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

// Helper functions to safely work with reactive values
const isSelected = (category: GalleryCategory) => {
  return galleryManager.selectedCategoryIds.value.includes(category.id);
};

const toggleCategory = (category: GalleryCategory) => {
  const ids = [...galleryManager.selectedCategoryIds.value];
  const index = ids.indexOf(category.id);
  
  if (index === -1) {
    ids.push(category.id);
  } else {
    ids.splice(index, 1);
  }
  
  galleryManager.selectedCategoryIds.value = ids;
};

onMounted(async () => {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    router.push("/auth/login");
    return;
  }
  
  if (process.client) {
    await galleryManager.initializeGalleryEdit(galleryId);
    
    // Force isLoading to false (workaround)
    galleryManager.isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="flex-1 overflow-y-auto">
      <form @submit.prevent="galleryManager.updateGalleryForm(galleryId)" class="space-y-6">
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
              :disabled="galleryManager.isLoading.value"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
            >
              <SaveAllIcon class="w-4 h-4 mr-2" />
              {{ galleryManager.isLoading.value ? 'Saving...' : 'Save Changes' }}
            </button>
          </template>
        </PageHeader>
        
        <!-- Loading State -->
        <div v-if="galleryManager.isFetchingData.value" class="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-32 bg-gray-200 dark:bg-neutral-700 rounded w-64 mx-auto"></div>
            <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
        
        <div v-else>
          <!-- Error Banner -->
          <div v-if="galleryManager.error.value" class="p-4 rounded-md bg-red-50 dark:bg-red-900/30">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-200">{{ galleryManager.error.value }}</h3>
              </div>
            </div>
          </div>
          
          <!-- Tabs -->
          <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
            <button
              type="button"
              v-for="tab in tabs"
              :key="tab.id"
              @click="galleryManager.currentTab.value = tab.id"
              class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative"
              :class="{
                'bg-primary text-white': galleryManager.currentTab.value === tab.id,
                'text-slate-600 hover:text-slate-900 hover:bg-slate-50': galleryManager.currentTab.value !== tab.id
              }"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.name }}
            </button>
          </nav>
          
          <div class="grid gap-6">
            <!-- Basic Info Tab -->
            <div v-show="galleryManager.currentTab.value === 'basic'" class="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div class="space-y-4">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
                
                <!-- Image Upload -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image <span class="text-red-500">*</span>
                  </label>
                  <div class="flex flex-col items-center space-y-4">
                    <div v-if="galleryManager.imageUrl.value" class="relative w-64 h-64 border rounded-lg overflow-hidden">
                      <img :src="galleryManager.imageUrl.value" alt="Gallery preview" class="w-full h-full object-cover" />
                      <button 
                        type="button"
                        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        @click="galleryManager.imageUrl.value = ''"
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
                        'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20': galleryManager.isDragging.value,
                        'border-gray-300 dark:border-gray-600': !galleryManager.isDragging.value
                      }"
                      @dragover="galleryManager.handleDragOver"
                      @dragleave="galleryManager.handleDragLeave"
                      @drop="galleryManager.handleDrop"
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
                      <label v-if="!galleryManager.isUploadingImage.value" class="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                        {{ galleryManager.imageUrl.value ? 'Change Image' : 'Upload Image' }}
                        <input type="file" class="hidden" accept="image/*" @change="galleryManager.handleImageUpload" />
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
                    v-model="galleryManager.title.value"
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
                    v-model="galleryManager.description.value"
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
                      v-for="category in galleryManager.categories.value"
                      :key="category.id"
                      :class="{
                        'flex items-center rounded-lg border p-3 cursor-pointer transition-colors': true,
                        'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30': isSelected(category),
                        'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-700': !isSelected(category)
                      }"
                      @click="toggleCategory(category)"
                    >
                      <input
                        type="checkbox"
                        :checked="isSelected(category)"
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        @change="toggleCategory(category)"
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
            <div v-show="galleryManager.currentTab.value === 'settings'" class="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div class="space-y-4">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Settings</h2>
                
                <!-- Sequence -->
                <div>
                  <label for="sequence" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Display Sequence
                  </label>
                  <input
                    id="sequence"
                    v-model="galleryManager.sequence.value"
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
                    v-model="galleryManager.isActive.value"
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