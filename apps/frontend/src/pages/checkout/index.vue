<script setup lang="ts">
import { formatPrice, ProductType, OrderType } from "@ew/shared";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import PhoneInput from "~/components/form/PhoneInput.vue";
import { useLocalization } from "~/composables/useLocalization";
import { useNotification } from "~/composables/useNotification";
import { useCart } from "~/composables/useCart";
import { useTrpc } from "~/composables/useTrpc";

const router = useRouter();
const { t } = useLocalization();
const trpc = useTrpc();
const notification = useNotification();
const { 
  cartItems, 
  cartSummary, 
  isLoading: isCartLoading, 
  initialize: initializeCart,
  clearCart
} = useCart();

// Page metadata
useHead({
  title: t('checkout.title'),
  meta: [
    { name: 'description', content: t('checkout.subtitle') }
  ]
});

// Form data
const formData = ref({
  fullName: "",
  phoneCode: "+84",
  phoneNumber: "",
  email: "",
  paymentMethodId: 0,
  shippingAddress: {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Vietnam",
    postalCode: "",
  },
  billingAddress: {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Vietnam",
    postalCode: "",
  },
  useSameAddress: true,
  notes: "",
});

// Validation
const errors = ref<Record<string, string>>({});
const isPhoneValid = ref(false);
const isProcessing = ref(false);

// Payment methods
const paymentMethods = ref<any[]>([]);
const isLoadingPaymentMethods = ref(false);

// Computed
const isEmpty = computed(() => !cartItems || cartItems.length === 0);

const hasPhysicalItems = computed(() => {
  if (!cartItems) return false;
  return cartItems.some((item: any) => 
    !item.product?.type || item.product.type === ProductType.PHYSICAL
  );
});

const hasDigitalItems = computed(() => {
  if (!cartItems) return false;
  return cartItems.some((item: any) => 
    item.product?.type === ProductType.DIGITAL
  );
});

const requiresShipping = computed(() => hasPhysicalItems.value);

  const canProceed = computed(() => {
    const basicValidation = (
      formData.value.fullName &&
      formData.value.phoneNumber &&
      formData.value.email &&
      isPhoneValid.value &&
      formData.value.paymentMethodId &&
      !Object.keys(errors.value).length &&
      !isEmpty.value
    );

    if (!basicValidation) return false;

    // Additional validation for physical items requiring shipping
    if (requiresShipping.value) {
      return (
        formData.value.shippingAddress.fullName &&
        formData.value.shippingAddress.phone &&
        formData.value.shippingAddress.address &&
        formData.value.shippingAddress.city &&
        formData.value.shippingAddress.country
      );
    }

    return true;
  });

// Get product title with locale
const getProductTitle = (item: any) => {
  const translation = item.product?.translations?.find((t: any) => t.locale === 'vi') ||
                     item.product?.translations?.[0];
  return translation?.title || item.product?.title || 'Unknown Product';
};

// Get product description
const getProductDescription = (item: any) => {
  const translation = item.product?.translations?.find((t: any) => t.locale === 'vi') ||
                     item.product?.translations?.[0];
  return translation?.shortDescription || translation?.description || '';
};

// Calculate item total with discount
const getItemTotal = (item: any) => {
  return item.finalPrice * item.quantity;
};

// Get discount amount for item
const getItemDiscount = (item: any) => {
  if (item.discountPercent > 0) {
    const originalTotal = item.unitPrice * item.quantity;
    const discountAmount = originalTotal * (item.discountPercent / 100);
    return discountAmount;
  }
  return 0;
};

// Methods
const validateForm = () => {
  const newErrors: Record<string, string> = {};

  // Basic validation
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

  // Shipping address validation for physical items
  if (requiresShipping.value) {
    if (!formData.value.shippingAddress.fullName) {
      newErrors.shippingFullName = t("validation.required", { field: t("checkout.shipping.fullName") });
    }
    if (!formData.value.shippingAddress.phone) {
      newErrors.shippingPhone = t("validation.required", { field: t("checkout.shipping.phone") });
    }
    if (!formData.value.shippingAddress.address) {
      newErrors.shippingAddress = t("validation.required", { field: t("checkout.shipping.address") });
    }
    if (!formData.value.shippingAddress.city) {
      newErrors.shippingCity = t("validation.required", { field: t("checkout.shipping.city") });
    }
    if (!formData.value.shippingAddress.country) {
      newErrors.shippingCountry = t("validation.required", { field: t("checkout.shipping.country") });
    }
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
  if (isEmpty.value) {
    notification.error({ title: t("checkout.emptyCart") });
    return;
  }

  isProcessing.value = true;
  try {
    // Prepare order items from cart
    const items = cartItems!.map((item: any) => {
      // Determine product type
      let productType = ProductType.PHYSICAL;
      if (item.product?.type) {
        productType = item.product.type;
      }

      return {
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: getItemTotal(item),
        originalPrice: item.unitPrice * item.quantity,
        discountPercent: item.discountPercent || 0,
        productType: productType,
      };
    });

    // Prepare addresses for physical items
    const shippingAddress = requiresShipping.value ? {
      fullName: formData.value.shippingAddress.fullName,
      phone: formData.value.shippingAddress.phone,
      email: formData.value.shippingAddress.email || formData.value.email,
      address: formData.value.shippingAddress.address,
      city: formData.value.shippingAddress.city,
      state: formData.value.shippingAddress.state,
      country: formData.value.shippingAddress.country,
      postalCode: formData.value.shippingAddress.postalCode,
    } : undefined;

    const billingAddress = requiresShipping.value ? (
      formData.value.useSameAddress ? shippingAddress : {
        fullName: formData.value.billingAddress.fullName,
        phone: formData.value.billingAddress.phone,
        email: formData.value.billingAddress.email || formData.value.email,
        address: formData.value.billingAddress.address,
        city: formData.value.billingAddress.city,
        state: formData.value.billingAddress.state,
        country: formData.value.billingAddress.country,
        postalCode: formData.value.billingAddress.postalCode,
      }
    ) : undefined;

    // Determine order type
    const orderType = hasDigitalItems.value && !hasPhysicalItems.value 
      ? OrderType.TICKET 
      : OrderType.STANDARD;

    const { order, payment } = await trpc.order.createOrder.mutate({
      phoneCode: formData.value.phoneCode,
      phoneNumber: formData.value.phoneNumber,
      email: formData.value.email || undefined,
      customerName: formData.value.fullName,
      orderType: orderType,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      paymentMethod:
        paymentMethods.value.find((m) => m.id === formData.value.paymentMethodId)?.code ||
        "",
      payment_method_id: formData.value.paymentMethodId,
      notes: formData.value.notes || undefined,
      items: items,
      totalAmount: cartSummary?.total || 0,
      returnUrl: `${window.location.origin}/checkout/success`,
      cancelUrl: `${window.location.origin}/checkout/cancel`,
    });

    // Clear cart after successful order creation
    await clearCart();

    // Redirect to payment URL if available, otherwise go to success page
    if (payment.payment_url) {
      window.location.href = payment.payment_url;
    } else {
      router.push(`/checkout/success?order_id=${order.id}`);
    }
  } catch (error) {
    console.error("Error processing checkout:", error);
    notification.error({ title: t("checkout.errorProcessing") });
  } finally {
    isProcessing.value = false;
  }
};

// Watch for same address checkbox
watch(() => formData.value.useSameAddress, (useSame) => {
  if (useSame && requiresShipping.value) {
    formData.value.billingAddress = { ...formData.value.shippingAddress };
  }
});

// Lifecycle
onMounted(async () => {
  // Initialize cart
  await initializeCart();
  
  // Check if cart is empty and redirect
  if (isEmpty.value) {
    notification.warning({ title: t("checkout.emptyCart") });
    router.push("/cart");
    return;
  }

  await fetchPaymentMethods();
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

        <!-- Loading State -->
        <div v-if="isCartLoading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-lg text-gray-600 dark:text-gray-400 ml-4">{{ t("cart.loading") }}</p>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="isEmpty" class="text-center py-12">
          <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg inline-block">
            <h2 class="text-xl font-semibold mb-2">{{ t("checkout.emptyCart") }}</h2>
            <p class="mb-4">{{ t("checkout.emptyCartDescription") }}</p>
            <NuxtLink
              to="/products"
              class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
            >
              {{ t("cart.empty.shopNow") }}
            </NuxtLink>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {{ t("checkout.orderSummary") }}
              </h2>
              
              <!-- Cart Items -->
              <div class="space-y-4 mb-6">
                <div
                  v-for="item in cartItems"
                  :key="item.id"
                  class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img
                      :src="item.product?.thumbnail || '/images/default/product-placeholder.jpg'"
                      :alt="getProductTitle(item)"
                      class="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>

                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ getProductTitle(item) }}
                    </h3>
                    
                    <!-- Variant Info -->
                    <div v-if="item.variant" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ t('cart.variant') }}: {{ item.variant.name }}
                    </div>

                    <!-- Quantity and Price -->
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-xs text-gray-600 dark:text-gray-400">
                        {{ t('cart.quantity') }}: {{ item.quantity }}
                      </span>
                      <div class="text-right">
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">
                          {{ formatPrice(getItemTotal(item)) }}
                        </span>
                        <div 
                          v-if="item.discountPercent > 0" 
                          class="text-xs text-gray-500 line-through"
                        >
                          {{ formatPrice(item.unitPrice * item.quantity) }}
                        </div>
                      </div>
                    </div>

                    <!-- Discount Info -->
                    <div v-if="getItemDiscount(item) > 0" class="text-xs text-green-600 dark:text-green-400 mt-1">
                      {{ t('cart.saved') }}: {{ formatPrice(getItemDiscount(item)) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="border-t dark:border-gray-700 pt-4 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ t("cart.summary.subtotal") }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ formatPrice(cartSummary?.subtotal || 0) }}
                  </span>
                </div>
                
                <div v-if="cartSummary?.totalDiscount && cartSummary.totalDiscount > 0" class="flex justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">{{ t("cart.summary.discount") }}</span>
                  <span class="font-medium text-green-600 dark:text-green-400">
                    -{{ formatPrice(cartSummary.totalDiscount) }}
                  </span>
                </div>
                
                <div class="flex justify-between text-lg font-semibold border-t dark:border-gray-600 pt-3">
                  <span class="text-gray-900 dark:text-white">{{ t("cart.summary.total") }}</span>
                  <span class="text-primary-600 dark:text-primary-400">
                    {{ formatPrice(cartSummary?.total || 0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Form -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:p-8 space-y-8">
              <!-- Contact Information -->
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {{ t("checkout.contactInformation") }}
                </h2>
                <div class="space-y-6">
                  <!-- Full Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t("checkout.fullName") }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.fullName"
                      type="text"
                      :placeholder="t('checkout.fullNamePlaceholder')"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      :class="{
                        'border-red-500 focus:border-red-500 focus:ring-red-500': errors.fullName,
                      }"
                    />
                    <p v-if="errors.fullName" class="mt-2 text-sm text-red-500">
                      {{ errors.fullName }}
                    </p>
                  </div>

                  <!-- Phone Number -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t("checkout.email") }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.email"
                      type="email"
                      :placeholder="t('checkout.emailPlaceholder')"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      :class="{
                        'border-red-500 focus:border-red-500 focus:ring-red-500': errors.email,
                      }"
                    />
                    <p v-if="errors.email" class="mt-2 text-sm text-red-500">
                      {{ errors.email }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Shipping Address (only for physical items) -->
              <div v-if="requiresShipping">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {{ t("checkout.shipping.title") }}
                </h2>
                <div class="space-y-6">
                  <!-- Shipping Full Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t("checkout.shipping.fullName") }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.shippingAddress.fullName"
                      type="text"
                      :placeholder="t('checkout.shipping.fullNamePlaceholder')"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      :class="{
                        'border-red-500 focus:border-red-500 focus:ring-red-500': errors.shippingFullName,
                      }"
                    />
                    <p v-if="errors.shippingFullName" class="mt-2 text-sm text-red-500">
                      {{ errors.shippingFullName }}
                    </p>
                  </div>

                  <!-- Shipping Phone -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t("checkout.shipping.phone") }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.shippingAddress.phone"
                      type="tel"
                      :placeholder="t('checkout.shipping.phonePlaceholder')"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      :class="{
                        'border-red-500 focus:border-red-500 focus:ring-red-500': errors.shippingPhone,
                      }"
                    />
                    <p v-if="errors.shippingPhone" class="mt-2 text-sm text-red-500">
                      {{ errors.shippingPhone }}
                    </p>
                  </div>

                  <!-- Shipping Address -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ t("checkout.shipping.address") }} <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.shippingAddress.address"
                      type="text"
                      :placeholder="t('checkout.shipping.addressPlaceholder')"
                      class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      :class="{
                        'border-red-500 focus:border-red-500 focus:ring-red-500': errors.shippingAddress,
                      }"
                    />
                    <p v-if="errors.shippingAddress" class="mt-2 text-sm text-red-500">
                      {{ errors.shippingAddress }}
                    </p>
                  </div>

                  <!-- City and State -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t("checkout.shipping.city") }} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.shippingAddress.city"
                        type="text"
                        :placeholder="t('checkout.shipping.cityPlaceholder')"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        :class="{
                          'border-red-500 focus:border-red-500 focus:ring-red-500': errors.shippingCity,
                        }"
                      />
                      <p v-if="errors.shippingCity" class="mt-2 text-sm text-red-500">
                        {{ errors.shippingCity }}
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t("checkout.shipping.state") }}
                      </label>
                      <input
                        v-model="formData.shippingAddress.state"
                        type="text"
                        :placeholder="t('checkout.shipping.statePlaceholder')"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <!-- Country and Postal Code -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t("checkout.shipping.country") }} <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.shippingAddress.country"
                        type="text"
                        :placeholder="t('checkout.shipping.countryPlaceholder')"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        :class="{
                          'border-red-500 focus:border-red-500 focus:ring-red-500': errors.shippingCountry,
                        }"
                      />
                      <p v-if="errors.shippingCountry" class="mt-2 text-sm text-red-500">
                        {{ errors.shippingCountry }}
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t("checkout.shipping.postalCode") }}
                      </label>
                      <input
                        v-model="formData.shippingAddress.postalCode"
                        type="text"
                        :placeholder="t('checkout.shipping.postalCodePlaceholder')"
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>

                  <!-- Use same address for billing -->
                  <div class="flex items-center">
                    <input
                      id="useSameAddress"
                      v-model="formData.useSameAddress"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label for="useSameAddress" class="ml-2 block text-sm text-gray-900 dark:text-white">
                      {{ t("checkout.useSameAddressForBilling") }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {{ t("checkout.additionalNotes") }}
                </h2>
                <textarea
                  v-model="formData.notes"
                  rows="4"
                  :placeholder="t('checkout.notesPlaceholder')"
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 resize-none"
                ></textarea>
              </div>

              <!-- Payment Method -->
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {{ t("checkout.paymentMethod") }}
                </h2>
                <div v-if="isLoadingPaymentMethods" class="flex justify-center py-8">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
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
              <div class="flex justify-end pt-6">
                <button
                  @click="handleSubmit"
                  :disabled="!canProceed || isProcessing"
                  class="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span v-if="isProcessing" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  {{ isProcessing ? t("checkout.processing") : t("checkout.proceedToPayment") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>