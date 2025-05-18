<script setup lang="ts">
import { formatPrice, ProductType, OrderType } from "@ew/shared";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PhoneInput from "~/components/form/PhoneInput.vue";
import { useLocalization } from "~/composables/useLocalization";
import { useNotification } from "~/composables/useNotification";
import { useTicketBooking } from "~/composables/useTicketBooking";
import { useTrpc } from "~/composables/useTrpc";
import { useTierPricing } from "~/composables/useTierPricing";

const router = useRouter();
const { t } = useLocalization();
const trpc = useTrpc();
const notification = useNotification();
const { loadBookingData, clearBookingData } = useTicketBooking();
const { getDiscountForQuantity } = useTierPricing();

// Form data
const formData = ref({
  fullName: "",
  phoneCode: "+84",
  phoneNumber: "",
  email: "",
  paymentMethodId: 0,
});

// Validation
const errors = ref<Record<string, string>>({});
const isPhoneValid = ref(false);

// Payment methods
const paymentMethods = ref<any[]>([]);
const isLoadingPaymentMethods = ref(false);

// Booking data
const bookingData = ref(loadBookingData());

// Helper function to properly format dates for API
const formatDate = (dateString: string): Date => {
  const date = new Date(dateString);
  // Ensure it's a valid date
  return isNaN(date.getTime()) ? new Date() : date;
};

// Computed
const canProceed = computed(() => {
  return (
    formData.value.fullName &&
    formData.value.phoneNumber &&
    formData.value.email &&
    isPhoneValid.value &&
    formData.value.paymentMethodId &&
    !Object.keys(errors.value).length
  );
});

// Methods
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.value.fullName) {
    newErrors.fullName = t("validation.required", { field: t("checkout.fullName") });
  }

  if (!formData.value.phoneNumber) {
    newErrors.phoneNumber = t("validation.required", {
      field: t("checkout.phoneNumber"),
    });
  }

  if (!formData.value.email) {
    newErrors.email = t("validation.required", { field: t("checkout.email") });
  } else if (!isValidEmail(formData.value.email)) {
    newErrors.email = t("validation.email");
  }

  if (!formData.value.paymentMethodId) {
    newErrors.paymentMethod = t("validation.required", {
      field: t("checkout.paymentMethod"),
    });
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const isValidEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handlePhoneValidation = (validation: { valid: boolean; message?: string }) => {
  isPhoneValid.value = validation.valid;
  if (!validation.valid && validation.message) {
    errors.value.phoneNumber = validation.message;
  } else {
    delete errors.value.phoneNumber;
  }
};

const fetchPaymentMethods = async () => {
  isLoadingPaymentMethods.value = true;
  try {
    const methods = await trpc.payment.getActivePaymentMethods.query();
    paymentMethods.value = methods;
    // Set first payment method as default if available
    if (methods.length > 0) {
      formData.value.paymentMethodId = methods[0].id;
    }
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    notification.error({ title: t("checkout.errorFetchingPaymentMethods") });
  } finally {
    isLoadingPaymentMethods.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  if (!bookingData.value) {
    notification.error({ title: t("checkout.noBookingData") });
    return;
  }

  try {
    // Xử lý giảm giá theo bậc cho từng variant
    const itemPromises = bookingData.value.variants.map(async (variant) => {
      // Lấy phần trăm giảm giá theo số lượng
      const discountPercent = await getDiscountForQuantity(
        bookingData.value!.productId,
        variant.id,
        Number(variant.quantity)
      );
      
      // Tính giá sau khi giảm
      const originalTotalPrice = Number(variant.totalPrice);
      const discountAmount = (originalTotalPrice * discountPercent) / 100;
      const discountedTotalPrice = originalTotalPrice - discountAmount;
      
      return {
        productId: bookingData.value!.productId,
        variantId: variant.id,
        quantity: Number(variant.quantity),
        unitPrice: Number(variant.unitPrice),
        totalPrice: discountedTotalPrice, // Sử dụng giá đã giảm
        originalPrice: originalTotalPrice, // Giữ giá gốc để tham khảo
        discountPercent: discountPercent, // Lưu phần trăm giảm giá
        productType: ProductType.TICKET,
        travelDate: formatDate(bookingData.value!.date),
      };
    });

    const items = await Promise.all(itemPromises);
    
    // Tính tổng tiền sau khi đã áp dụng giảm giá
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const { order, payment } = await trpc.order.createOrder.mutate({
      phoneCode: formData.value.phoneCode,
      phoneNumber: formData.value.phoneNumber,
      email: formData.value.email || undefined,
      customerName: formData.value.fullName,
      orderType: OrderType.TICKET,
      paymentMethod:
        paymentMethods.value.find((m) => m.id === formData.value.paymentMethodId)?.code ||
        "",
      payment_method_id: formData.value.paymentMethodId,
      items: items,
      totalAmount: totalAmount,
      returnUrl: `${window.location.origin}/checkout/success`,
      cancelUrl: `${window.location.origin}/checkout/cancel`,
    });

    // Clear booking data
    clearBookingData();

    // Redirect to payment URL if available, otherwise go to success page
    if (payment.payment_url) {
      window.location.href = payment.payment_url;
    } else {
      router.push(`/checkout/success?order_id=${order.id}`);
    }
  } catch (error) {
    console.error("Error processing checkout:", error);
    notification.error({ title: t("checkout.errorProcessing") });
  }
};

// Lifecycle
onMounted(() => {
  if (!bookingData.value) {
    router.push("/ticket-pricing");
    return;
  }
  fetchPaymentMethods();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12 space-y-3">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {{ t("checkout.title") }}
          </h1>
          <div class="w-24 h-1 bg-primary-500 mx-auto rounded-full"></div>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ t("checkout.subtitle") }}
          </p>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Booking Summary -->
          <div class="lg:col-span-1">
            <div
              v-if="bookingData"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6"
            >
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {{ t("checkout.bookingSummary") }}
              </h2>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">{{
                    t("checkout.product")
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{
                    bookingData.productName
                  }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">{{
                    t("checkout.date")
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ new Date(bookingData.date).toLocaleDateString() }}
                  </span>
                </div>
                <div class="border-t dark:border-gray-700 pt-4 space-y-3">
                  <div
                    v-for="variant in bookingData.variants"
                    :key="variant.id"
                    class="flex justify-between items-center"
                  >
                    <span class="text-gray-600 dark:text-gray-400">
                      {{ variant.name }} x {{ variant.quantity }}
                    </span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ formatPrice(variant.totalPrice) }}
                    </span>
                  </div>
                </div>
                <div class="border-t dark:border-gray-700 pt-4 mt-4">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-gray-900 dark:text-white">{{
                      t("checkout.total")
                    }}</span>
                    <div class="text-right">
                      <span
                        class="text-lg font-semibold text-primary-600 dark:text-primary-400"
                      >
                        {{ formatPrice(bookingData.totalAmount) }}
                      </span>
                      <!-- Hiển thị giá gốc nếu có giảm giá -->
                      <div v-if="bookingData.originalAmount && bookingData.originalAmount > bookingData.totalAmount" 
                        class="text-sm text-gray-500 line-through">
                        {{ formatPrice(bookingData.originalAmount) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Form -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:p-8">
              <!-- Contact Information -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {{ t("checkout.contactInformation") }}
                </h2>
                <div class="space-y-6">
                  <!-- Full Name -->
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ t("checkout.fullName") }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.fullName"
                      type="text"
                      :placeholder="t('checkout.fullNamePlaceholder')"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      :class="{
                        'border-red-500 focus:border-red-500 focus:ring-red-500':
                          errors.fullName,
                      }"
                    />
                    <p v-if="errors.fullName" class="mt-2 text-sm text-red-500">
                      {{ errors.fullName }}
                    </p>
                  </div>

                  <!-- Phone Number -->
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ t("checkout.phoneNumber") }} <span class="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      v-model="formData.phoneNumber"
                      v-model:phoneCode="formData.phoneCode"
                      :error="!!errors.phoneNumber"
                      :placeholder="t('checkout.phonePlaceholder')"
                      @validation="handlePhoneValidation"
                      class="w-full"
                    />
                    <p v-if="errors.phoneNumber" class="mt-2 text-sm text-red-500">
                      {{ errors.phoneNumber }}
                    </p>
                  </div>

                  <!-- Email -->
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ t("checkout.email") }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.email"
                      type="email"
                      :placeholder="t('checkout.emailPlaceholderTicket')"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      :class="{
                        'border-red-500 focus:border-red-500 focus:ring-red-500':
                          errors.email,
                      }"
                    />
                    <p v-if="errors.email" class="mt-2 text-sm text-red-500">
                      {{ errors.email }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="mb-8">
                <h2
                  class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6"
                >
                  {{ t("checkout.paymentMethod") }}
                </h2>
                <div v-if="isLoadingPaymentMethods" class="flex justify-center py-8">
                  <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"
                  ></div>
                </div>
                <div v-else class="space-y-4">
                  <div
                    v-for="method in paymentMethods"
                    :key="method.id"
                    class="relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      formData.paymentMethodId === method.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:shadow-sm',
                    ]"
                    @click="formData.paymentMethodId = method.id"
                  >
                    <div class="flex-shrink-0 mr-4">
                      <img
                        :src="method.icon"
                        :alt="method.name"
                        class="h-10 w-auto object-contain"
                      />
                    </div>
                    <div class="flex-grow">
                      <h3 class="font-medium text-gray-900 dark:text-white">
                        {{ method.name }}
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ method.description }}
                      </p>
                    </div>
                    <div
                      class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-colors duration-200"
                      :class="[
                        formData.paymentMethodId === method.id
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300 dark:border-gray-600',
                      ]"
                    >
                      <div
                        v-if="formData.paymentMethodId === method.id"
                        class="absolute inset-0 m-0.5 rounded-full bg-white"
                      ></div>
                    </div>
                  </div>
                </div>
                <p v-if="errors.paymentMethod" class="mt-2 text-sm text-red-500">
                  {{ errors.paymentMethod }}
                </p>
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end">
                <button
                  @click="handleSubmit"
                  :disabled="!canProceed"
                  class="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {{ t("checkout.proceedToPayment") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
