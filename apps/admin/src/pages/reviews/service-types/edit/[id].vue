<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuth } from "../../../../composables/useAuth";
import { useTrpc } from "../../../../composables/useTrpc";
import { useRouter, useRoute } from "vue-router";
import { XIcon, SaveIcon } from "lucide-vue-next";
import Swal from "sweetalert2";
import PageHeader from "../../../../components/common/header/PageHeader.vue";
import { useLocalization } from "../../../../composables/useLocalization";

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {};
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: "reviews.serviceType.edit - Admin Panel",
});

const router = useRouter();
const route = useRoute();
const serviceTypeId = Number(route.params.id);
const { checkAuth } = useAuth();
const trpc = useTrpc();
const { t } = useLocalization();

// Form state
const isLoading = ref(false);
const isLoadingServiceType = ref(true);
const error = ref<string | null>(null);
const locale = ref("vi");
const name = ref("");
const slug = ref("");
const description = ref("");
const originalSlug = ref("");

// Get service type by ID
async function fetchServiceType() {
  try {
    isLoadingServiceType.value = true;
    error.value = null;

    const serviceType = await trpc.admin.review.getServiceTypeById.query({
      id: serviceTypeId,
      locale: locale.value,
    });

    // Store original slug for comparison
    originalSlug.value = serviceType.slug;
    
    // Fill form fields with service type data
    slug.value = serviceType.slug;

    // Get the translation for current locale or first translation
    const translation = serviceType.translations.find(
      (t) => t.locale === locale.value
    ) || serviceType.translations[0];

    if (translation) {
      name.value = translation.name || "";
      description.value = translation.description || "";
      locale.value = translation.locale;
    }

  } catch (err: any) {
    error.value = err.message || t('reviews.serviceType.loadError');
    console.error("Error loading service type:", err);
  } finally {
    isLoadingServiceType.value = false;
  }
}

// Watch for locale changes to reload the content
watch(locale, async () => {
  await fetchServiceType();
});

// Submit the form
async function submitForm() {
  try {
    if (!name.value) {
      error.value = t('reviews.serviceType.nameRequired');
      return;
    }

    if (!slug.value) {
      error.value = t('categories.slugRequired');
      return;
    }

    isLoading.value = true;
    error.value = null;

    const translations = [
      {
        locale: locale.value,
        name: name.value,
        description: description.value || undefined,
      },
    ];

    await trpc.admin.review.updateServiceType.mutate({
      id: serviceTypeId,
      slug: slug.value,
      translations,
    });

    Swal.fire({
      icon: "success",
      title: t('messages.success'),
      text: t('reviews.serviceType.updateSuccess'),
      timer: 1500,
      showConfirmButton: false,
    });

    // Refresh the service type data
    await fetchServiceType();
  } catch (err: any) {
    error.value = err.message || t('reviews.serviceType.updateError');
    console.error("Error updating service type:", err);
  } finally {
    isLoading.value = false;
  }
}

// Generate slug from name
function generateSlug() {
  slug.value = name.value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Delete service type
async function deleteServiceType() {
  // Ask for confirmation
  const result = await Swal.fire({
    title: t('messages.confirmDelete'),
    text: t('reviews.serviceType.deleteWarning'),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: t('actions.delete'),
    cancelButtonText: t('actions.cancel')
  });

  if (result.isConfirmed) {
    try {
      await trpc.admin.review.deleteServiceType.mutate({ id: serviceTypeId });
      Swal.fire({
        icon: "success",
        title: t('messages.success'),
        text: t('reviews.serviceType.deleteSuccess'),
        timer: 1500,
        showConfirmButton: false,
      });
      // Redirect to service types list
      router.push("/reviews/service-types");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t('messages.error'),
        text: err.message || t('reviews.serviceType.deleteError'),
      });
    }
  }
}

// Cancel and go back
function cancel() {
  router.push("/reviews/service-types");
}

// Load data on mounted
onMounted(async () => {
  await checkAuth();
  await fetchServiceType();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <PageHeader
      :title="t('reviews.serviceType.editServiceType')"
      :description="t('reviews.serviceType.updateDescription')"
      :backButton="{
        label: t('reviews.serviceType.backToList'),
        onClick: cancel,
      }"
    />

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
    >
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingServiceType" class="mt-8 flex justify-center">
      <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-indigo-600">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ t('reviews.serviceType.loading') }}
      </div>
    </div>

    <div v-else class="bg-white shadow-sm rounded-lg p-6 mt-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Basic Information -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            {{ t('common.basicInfo') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="locale"
                class="block text-sm font-medium text-gray-700"
              >
                {{ t('language') }} <span class="text-red-500">*</span>
              </label>
              <select
                id="locale"
                v-model="locale"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="vi">{{ t('common.vietnamese') }}</option>
                <option value="en">{{ t('common.english') }}</option>
              </select>
            </div>
            
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700"
              >
                {{ t('reviews.serviceType.name') }} <span class="text-red-500">*</span>
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  :placeholder="t('reviews.serviceType.namePlaceholder')"
                  required
                />
              </div>
            </div>

            <div>
              <label
                for="slug"
                class="block text-sm font-medium text-gray-700"
              >
                {{ t('categories.slug') }} <span class="text-red-500">*</span>
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  id="slug"
                  v-model="slug"
                  type="text"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  :placeholder="t('categories.slugPlaceholder')"
                  required
                />
                <button
                  type="button"
                  @click="generateSlug"
                  class="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {{ t('categories.generateSlug') }}
                </button>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                {{ t('reviews.serviceType.slugHelp') }}
              </p>
            </div>

            <div class="md:col-span-2">
              <label
                for="description"
                class="block text-sm font-medium text-gray-700"
              >
                {{ t('reviews.serviceType.description') }}
              </label>
              <div class="mt-1">
                <textarea
                  id="description"
                  v-model="description"
                  rows="4"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  :placeholder="t('reviews.serviceType.descriptionPlaceholder')"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between pt-4">
          <button
            type="button"
            @click="deleteServiceType"
            class="px-4 py-2 border border-red-300 text-red-700 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            :disabled="isLoading"
          >
            {{ t('reviews.serviceType.delete') }}
          </button>
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="cancel"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="isLoading"
            >
              {{ t('actions.cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="isLoading"
            >
              <span v-if="isLoading">{{ t('messages.loading') }}</span>
              <span v-else>{{ t('reviews.serviceType.update') }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template> 