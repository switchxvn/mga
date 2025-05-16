<script setup lang="ts">
import { ref, onMounted } from "vue";import { useAuth } from "../../../composables/useAuth";import { useTrpc } from "../../../composables/useTrpc";import { useRouter } from "vue-router";import { XIcon, SaveIcon } from "lucide-vue-next";import Swal from "sweetalert2";import PageHeader from "../../../components/common/header/PageHeader.vue";import { useLocalization } from "../../../composables/useLocalization";

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {};
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({  title: "reviews.serviceType.add - Admin Panel",});

const router = useRouter();const { checkAuth } = useAuth();const trpc = useTrpc();const { t } = useLocalization();

// Form state
const isLoading = ref(false);
const error = ref<string | null>(null);
const locale = ref("vi");
const name = ref("");
const slug = ref("");
const description = ref("");

// Submit the form
async function submitForm() {
  try {
    if (!name.value) {
      error.value = "Service type name is required";
      return;
    }

    if (!slug.value) {
      error.value = "Slug is required";
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

    await trpc.admin.review.createServiceType.mutate({
      slug: slug.value,
      translations,
    });

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Service type created successfully",
      timer: 1500,
      showConfirmButton: false,
    });

    // Redirect to service types list
    router.push("/reviews/service-types");
  } catch (err: any) {
    error.value = err.message || "Failed to create service type";
    console.error("Error creating service type:", err);
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

// Cancel and go back
function cancel() {
  router.push("/reviews/service-types");
}

// Load data on mounted
onMounted(async () => {
  await checkAuth();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
        <PageHeader      :title="t('reviews.serviceType.addNew')"      :description="t('reviews.serviceType.createDescription')"      :backButton="{        label: t('reviews.serviceType.backToList'),        onClick: cancel,      }"    />

    <!-- Error Message -->
    <div
      v-if="error"
      class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
    >
      {{ error }}
    </div>

    <div class="bg-white shadow-sm rounded-lg p-6 mt-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Basic Information -->
        <div class="border-b border-gray-200 pb-6">
                    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">            {{ t('common.basicInfo') }}          </h3>
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

        <!-- Submit Buttons -->
        <div class="flex justify-end space-x-3 pt-4">
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
            <span v-else>{{ t('reviews.serviceType.save') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 