import { defineComponent, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockedRouteSlug = ref('xe-nang-dau-mga-2-5-tan');
const mockedRoutePath = ref('/san-pham/xe-nang-dau-mga-2-5-tan');
const mockedRefresh = vi.fn();

const mockedUseProductDetail = {
  productData: ref(null),
  isLoading: ref(false),
  error: ref<{ message: string } | null>(null),
  refresh: mockedRefresh,
  currentLocale: ref('vi'),
  productTitle: ref(''),
  productContent: ref(''),
  productShortDescription: ref(''),
  productContentId: ref('product-content'),
  formattedProductContent: ref(''),
  hasVideoReview: ref(false),
  tabs: ref([]),
  shareUrl: ref(''),
  shareTitle: ref(''),
  shareDescription: ref(''),
  shareImage: ref(''),
  productReviewAggregate: ref(null),
  productReviews: ref([]),
  activeTab: ref('description'),
  isPriceRequestModalOpen: ref(false),
  selectedAttributes: ref({}),
  productAttributes: ref([]),
  matchingVariant: ref(null),
  variantPrice: ref(null),
  hasRequiredAttributes: ref(false),
  isAttributeValueAvailable: vi.fn().mockReturnValue(true),
  minVariantPrice: ref(null),
  shouldShowFromPrice: ref(false),
  shouldShowPriceRequest: ref(false),
  canAddToCart: ref(false),
  canBuyNow: ref(false),
  displayPrice: ref(''),
  displayComparePrice: ref(''),
  getProductForCart: ref(null),
  handleSelectAttribute: vi.fn(),
  openPriceRequestModal: vi.fn(),
  closePriceRequestModal: vi.fn(),
  handlePriceRequestSuccess: vi.fn(),
  shareToFacebook: vi.fn(),
  shareToTwitter: vi.fn(),
  shareToLinkedIn: vi.fn(),
  shareViaEmail: vi.fn(),
  copyProductLink: vi.fn(),
  getTabIcon: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { slug: mockedRouteSlug.value },
    path: mockedRoutePath.value,
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('nuxt/app', () => ({
  useRuntimeConfig: () => ({
    public: {
      siteUrl: 'https://example.test',
    },
  }),
}));

vi.mock('~/composables/useLocalization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
    locale: ref('vi'),
  }),
}));

vi.mock('~/composables/usePageSeo', () => ({
  usePageSeo: vi.fn(),
}));

vi.mock('~/composables/useProductDetail', () => ({
  useProductDetail: () => mockedUseProductDetail,
}));

vi.mock('~/composables/useSelectableGalleryImage', () => ({
  useSelectableGalleryImage: () => ({
    activeImage: ref(''),
    selectImage: vi.fn(),
  }),
}));

vi.mock('~/composables/useCart', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
  }),
}));

vi.mock('~/composables/useSettings', () => ({
  useSettings: () => ({
    getPublicSettingValueByKey: vi.fn().mockResolvedValue('false'),
  }),
}));

vi.mock('~/utils/seo', () => ({
  buildProductSchema: vi.fn().mockReturnValue({}),
  resolveSeoCanonicalUrl: vi.fn().mockReturnValue('https://example.test/san-pham/xe-nang-dau-mga-2-5-tan'),
}));

vi.mock('~/utils/routes', () => ({
  getLocalizedRoute: vi.fn().mockReturnValue('/san-pham'),
}));

vi.mock('~/utils/productBreadcrumb', () => ({
  resolveProductBreadcrumbCategory: vi.fn().mockReturnValue(null),
  resolveProductCategoryLink: vi.fn().mockReturnValue(null),
}));

Object.assign(globalThis, {
  definePageMeta: vi.fn(),
  useRuntimeConfig: () => ({
    public: {
      siteUrl: 'https://example.test',
    },
  }),
});

describe('product slug page', () => {
  beforeEach(() => {
    mockedRouteSlug.value = 'xe-nang-dau-mga-2-5-tan';
    mockedRoutePath.value = '/san-pham/xe-nang-dau-mga-2-5-tan';
    mockedUseProductDetail.productData.value = null;
    mockedUseProductDetail.isLoading.value = false;
    mockedUseProductDetail.error.value = null;
  });

  it('keeps the loading skeleton visible instead of flashing the error state when the route slug is missing during teardown', async () => {
    mockedRouteSlug.value = '';
    mockedRoutePath.value = '/';
    mockedUseProductDetail.error.value = { message: 'Product not found' };

    const page = (await import('./[slug].vue')).default;
    const TestHost = defineComponent({
      components: { Page: page },
      template: `
        <Suspense>
          <Page />
        </Suspense>
      `,
    });

    const wrapper = mount(TestHost, {
      global: {
        stubs: {
          Breadcrumb: true,
          DetailPageSkeleton: true,
          AddToCartButton: true,
          AppImage: true,
          CrossSellProducts: true,
          PriceRequestModal: true,
          QuickPurchaseModal: true,
          ProductDetailSidebar: true,
          ProductReviewsSection: true,
          ProductSpecifications: true,
          GlobalModal: true,
          TierPricingTable: true,
          TableOfContents: true,
          UIcon: true,
          UButton: true,
          UBadge: true,
          ClientOnly: true,
          DatePicker: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.html()).toContain('detail-page-skeleton-stub');
    expect(wrapper.text()).not.toContain('Product not found');
    expect(wrapper.text()).not.toContain('products.error');
  });
});
