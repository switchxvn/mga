<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "../../composables/useAuth";
import { useTrpc } from "../../composables/useTrpc";
import { useRouter } from "vue-router";
import { StarIcon } from "lucide-vue-next";
import Swal from "sweetalert2";
import PageHeader from "../../components/common/header/PageHeader.vue";
import { ReviewStatus } from "@ew/shared";

// These functions are provided by Nuxt at runtime
// @ts-ignore
const definePageMeta = (meta: any) => {};
// @ts-ignore
const useHead = (head: any) => {};

definePageMeta({
  middleware: ["auth"],
});

useHead({
  title: "Add New Review - Admin Panel",
});

const router = useRouter();
const { checkAuth } = useAuth();
const trpc = useTrpc();

// Form state
const isLoading = ref(false);
const error = ref<string | null>(null);
const locale = ref("vi");
const authorName = ref("");
const authorAvatar = ref("");
const profession = ref("");
const rating = ref(5);
const title = ref("");
const content = ref("");
const serviceTypeId = ref<number | null>(null);
const visitDate = ref("");
const featured = ref(false);
const status = ref<ReviewStatus>(ReviewStatus.ACTIVE);

// Service types for dropdown
const serviceTypes = ref<
  { id: number; name: string; slug: string; translations: any[] }[]
>([]);
const isLoadingServiceTypes = ref(true);

// Get all service types
async function fetchServiceTypes() {
  try {
    isLoadingServiceTypes.value = true;
    // Use the appropriate service type endpoint
    const response = await trpc.admin.review.getServiceTypes.query();
    serviceTypes.value = response;
  } catch (err: any) {
    console.error("Error loading service types:", err);
  } finally {
    isLoadingServiceTypes.value = false;
  }
}

// Submit the form
async function submitForm() {
  try {
    if (!authorName.value) {
      error.value = "Author name is required";
      return;
    }

    if (!content.value) {
      error.value = "Review content is required";
      return;
    }

    isLoading.value = true;
    error.value = null;

    const translations = [
      {
        locale: locale.value,
        title: title.value,
        content: content.value,
      },
    ];

    const result = await trpc.admin.review.create.mutate({
      authorName: authorName.value,
      authorAvatar: authorAvatar.value || undefined,
      profession: profession.value || undefined,
      rating: rating.value,
      serviceTypeId: serviceTypeId.value || undefined,
      visitDate: visitDate.value || undefined,
      featured: featured.value,
      status: status.value,
      translations,
    });

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Review created successfully",
      timer: 1500,
      showConfirmButton: false,
    });

    // Redirect to reviews list
    router.push("/reviews");
  } catch (err: any) {
    error.value = err.message || "Failed to create review";
    console.error("Error creating review:", err);
  } finally {
    isLoading.value = false;
  }
}

// Cancel and go back
function cancel() {
  router.push("/reviews");
}

// Load data on mounted
onMounted(async () => {
  await checkAuth();
  await fetchServiceTypes();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <PageHeader
      title="Add New Review"
      description="Create a new customer review or testimonial"
      :backButton="{
        label: 'Back to Reviews',
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

    <div class="bg-white shadow-sm rounded-lg p-6 mt-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Author Information -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Author Information
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="authorName"
                class="block text-sm font-medium text-gray-700"
              >
                Author Name <span class="text-red-500">*</span>
              </label>
              <input
                id="authorName"
                v-model="authorName"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label
                for="profession"
                class="block text-sm font-medium text-gray-700"
              >
                Profession
              </label>
              <input
                id="profession"
                v-model="profession"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                for="authorAvatar"
                class="block text-sm font-medium text-gray-700"
              >
                Avatar URL
              </label>
              <input
                id="authorAvatar"
                v-model="authorAvatar"
                type="url"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="https://example.com/avatar.jpg"
              />
              <p class="mt-1 text-sm text-gray-500">
                Enter a direct URL to the author's avatar image
              </p>
            </div>
            <div>
              <label
                for="visitDate"
                class="block text-sm font-medium text-gray-700"
              >
                Visit Date
              </label>
              <input
                id="visitDate"
                v-model="visitDate"
                type="date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <!-- Review Content -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Review Content
          </h3>
          <div class="space-y-6">
            <div>
              <label
                for="locale"
                class="block text-sm font-medium text-gray-700"
              >
                Language <span class="text-red-500">*</span>
              </label>
              <select
                id="locale"
                v-model="locale"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="vi">Vietnamese</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label
                for="title"
                class="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                v-model="title"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                for="content"
                class="block text-sm font-medium text-gray-700"
              >
                Content <span class="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                v-model="content"
                rows="5"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Review Metadata -->
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Review Details
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="serviceType"
                class="block text-sm font-medium text-gray-700"
              >
                Service Type
              </label>
              <select
                id="serviceType"
                v-model="serviceTypeId"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                :disabled="isLoadingServiceTypes"
              >
                <option value="">Select a service type</option>
                <option
                  v-for="type in serviceTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.name || type.slug }}
                </option>
              </select>
              <div
                v-if="isLoadingServiceTypes"
                class="mt-1 text-sm text-gray-500"
              >
                Loading service types...
              </div>
            </div>
            <div>
              <label
                for="rating"
                class="block text-sm font-medium text-gray-700"
              >
                Rating <span class="text-red-500">*</span>
              </label>
              <div class="mt-2 flex items-center">
                <div class="flex space-x-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="rating = star"
                    class="focus:outline-none"
                  >
                    <StarIcon
                      class="w-7 h-7"
                      :class="
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      "
                    />
                  </button>
                </div>
                <span class="ml-3 text-gray-700">{{ rating }} / 5</span>
              </div>
            </div>
            <div>
              <label
                for="status"
                class="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                v-model="status"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div class="flex items-center mt-6">
              <input
                id="featured"
                v-model="featured"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label for="featured" class="ml-2 block text-sm text-gray-700">
                Mark as Featured Review
              </label>
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
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Saving...</span>
            <span v-else>Save Review</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 