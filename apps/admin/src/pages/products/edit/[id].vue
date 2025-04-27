<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div class="flex flex-col items-center gap-2">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p class="text-sm text-slate-500">Loading...</p>
      </div>
    </div>

    <!-- Content Area -->
    <div v-else class="min-h-screen bg-slate-50">
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-6">
          <!-- Header -->
          <PageHeader
            title="Edit Product"
            description="Update your product information and settings"
          >
            <template #actions>
              <!-- Language Switcher -->
              <LanguageSwitcher 
                v-model="selectedLanguage" 
                @language-changed="handleLanguageChange"
              />

              <NuxtLink 
                to="/products" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2"
              >
                <XIcon class="w-4 h-4 mr-2" />
                Cancel
              </NuxtLink>
              
              <button 
                @click="updateProduct(true)" 
                :disabled="loading"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 h-10 px-4 py-2"
              >
                <SaveIcon class="w-4 h-4 mr-2" />
                {{ loading && saveAndContinue ? 'Saving...' : 'Save & Continue' }}
              </button>

              <button 
                @click="updateProduct(false)" 
                :disabled="loading"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
              >
                <SaveAllIcon class="w-4 h-4 mr-2" />
                {{ loading && !saveAndContinue ? 'Saving...' : 'Save & Back to List' }}
              </button>
            </template>
          </PageHeader>

          <!-- Tabs -->
          <nav class="flex items-center space-x-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="tab.id !== 'inventory' || !form.hasVariants ? currentTab = tab.id : null"
              class="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all relative group"
              :class="{
                'bg-primary text-white': currentTab === tab.id,
                'text-slate-600 hover:text-slate-900 hover:bg-slate-50': currentTab !== tab.id,
                'opacity-50 cursor-not-allowed': tab.id === 'inventory' && form.hasVariants
              }"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.name }}
              <div v-if="tab.id === 'inventory' && form.hasVariants" class="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                Inventory is disabled because this product has variants. Please manage inventory for individual variants in the Variants tab.
              </div>
            </button>
          </nav>

          <div class="grid gap-6">
            <!-- Basic Info Tab -->
            <div v-show="currentTab === 'basic'">
              <ProductEditor
                v-model:name="form.name"
                v-model:slug="form.slug"
                v-model:description="form.description"
                v-model:shortDescription="form.shortDescription"
                v-model:price="form.price"
                v-model:compareAtPrice="form.compareAtPrice"
                v-model:sku="form.sku"
                v-model:barcode="form.barcode"
                :editor-options="editorOptions"
                :disable-price="form.hasVariants"
                @generate-slug="generateSlug"
              />
           
            </div>

            <!-- Media Tab -->
            <div v-show="currentTab === 'media'">
              <ProductMedia
                v-model:thumbnail="form.thumbnail"
                v-model:gallery="form.gallery"
              />
            </div>  

            <!-- Categories Tab -->
            <div v-show="currentTab === 'categories'">
              <ProductCategories
                v-model="form.categoryIds"
              />
            </div>

            <!-- Variants Tab -->
            <div v-show="currentTab === 'variants'">
              <ProductVariants
                v-model="form.variants"
                v-model:hasVariants="form.hasVariants"
              />
            </div>

            <!-- Specifications Tab -->
            <div v-show="currentTab === 'specifications'">
              <ProductSpecifications
                :productId="Number(route.params.id)"
                :locale="selectedLanguage"
              />
            </div>

            <!-- Inventory Tab -->
            <div v-show="currentTab === 'inventory'">
              <ProductInventory
                v-model:trackInventory="form.trackInventory"
                v-model:quantity="form.quantity"
                v-model:lowStockThreshold="form.lowStockThreshold"
                v-model:stockStatus="form.stockStatus"
                v-model:allowBackorders="form.allowBackorders"
                :stockMovements="form.stockMovements"
                :hasVariants="form.hasVariants"
              />
              <div v-if="form.hasVariants" class="mt-4 flex items-center p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
                <InfoIcon class="w-5 h-5 mr-2 flex-shrink-0" />
                <div>
                  <p><span class="font-medium">Thông báo:</span> Quản lý số lượng đã bị vô hiệu hóa vì sản phẩm này có biến thể.</p>
                  <p>Số lượng được quản lý riêng cho từng biến thể trong <button @click="currentTab = 'variants'" class="underline font-medium hover:text-blue-900">tab Variants</button>.</p>
                </div>
              </div>
            </div>

            <!-- SEO Tab -->
            <div v-show="currentTab === 'seo'">
              <ProductSEO
                v-model:meta-description="form.metaDescription"
                v-model:tags-input="tagsInput"
                :tags="form.tags"
                @tag-input="handleTagInput"
                @remove-tag="removeTag"
              />
            </div>

            <!-- Settings Tab -->
            <div v-show="currentTab === 'settings'">
              <ProductSettings
                v-model:published="form.published"
                v-model:featured="form.featured"
                v-model:taxable="form.taxable"
                :updated-at="form.updatedAt"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '../../../composables/useTrpc'
import slugify from 'slugify'
import { useHead } from 'nuxt/app'
import { useToast } from 'vue-toastification'

// Import Lucide icons
import {
  FileTextIcon,
  ImageIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
  SaveAllIcon,
  SaveIcon,
  FolderIcon,
  LayersIcon,
  PackageIcon,
  InfoIcon,
  ClipboardListIcon
} from 'lucide-vue-next'

// Import components
import PageHeader from '../../../components/common/header/PageHeader.vue'
import ProductEditor from '../../../components/products/ProductEditor.vue'
import ProductMedia from '../../../components/products/ProductMedia.vue'
import ProductSEO from '../../../components/products/ProductSEO.vue'
import ProductSettings from '../../../components/products/ProductSettings.vue'
import ProductCategories from '../../../components/products/ProductCategories.vue'
import ProductVariants from '../../../components/products/ProductVariants.vue'
import ProductInventory from '../../../components/products/ProductInventory.vue'
import ProductSpecifications from '../../../components/products/ProductSpecifications.vue'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher.vue'

const trpc = useTrpc()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const loading = ref(true)
const saveAndContinue = ref(false)

// Initialize currentTab from query params or default to 'basic'
const currentTab = ref(route.query.tab?.toString() || 'basic')

// Initialize selectedLanguage
const selectedLanguage = ref('')
const defaultLanguage = ref('')

// Handle language change
const handleLanguageChange = (code: string) => {
  // Kiểm tra nếu code trùng với ngôn ngữ hiện tại thì không làm gì
  if (code === selectedLanguage.value) return;
  
  // Lưu translations hiện tại trước khi chuyển ngôn ngữ
  if (selectedLanguage.value && form.value.name !== undefined) {
    form.value.translations[selectedLanguage.value] = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description,
      shortDescription: form.value.shortDescription,
      metaDescription: form.value.metaDescription
    }
  }
  
  // Cập nhật selectedLanguage
  selectedLanguage.value = code;
  
  // Kiểm tra xem đã có dữ liệu cho ngôn ngữ mới chưa
  if (form.value.translations[code]) {
    // Nếu có, cập nhật form với dữ liệu từ translations
    const translation = form.value.translations[code];
    form.value.name = translation.name || '';
    form.value.slug = translation.slug || '';
    form.value.description = translation.description || '';
    form.value.shortDescription = translation.shortDescription || '';
    form.value.metaDescription = translation.metaDescription || '';
  } else {
    // Nếu chưa có, reset form để nhập mới
    form.value.name = '';
    form.value.slug = '';
    form.value.description = '';
    form.value.shortDescription = '';
    form.value.metaDescription = '';
  }
  
  // Chỉ cập nhật URL nếu khác với ngôn ngữ trong URL hiện tại
  if (route.query.locale !== code) {
    router.push({
      query: {
        ...route.query,
        locale: code
      }
    });
  }
}

// Watch for tab changes and update URL
watch(currentTab, (newTab) => {
  // Tránh gọi router.replace liên tục nếu giá trị tab không thay đổi
  if (route.query.tab?.toString() !== newTab) {
    router.replace({ 
      query: { 
        ...route.query,
        tab: newTab 
      }
    })
  }
  
  // Debug khi chọn tab variants - giảm số lượng log
  if (newTab === 'variants' && process.env.NODE_ENV !== 'production') {
    console.log('Variants tab selected. hasVariants:', form.value.hasVariants)
  }
})

const tabs = [
  { 
    id: 'basic', 
    name: 'Basic Info', 
    icon: FileTextIcon
  },
  { 
    id: 'media', 
    name: 'Media', 
    icon: ImageIcon
  },
  {
    id: 'categories',
    name: 'Categories',
    icon: FolderIcon
  },
  {
    id: 'variants',
    name: 'Variants',
    icon: LayersIcon
  },
  {
    id: 'specifications',
    name: 'Specifications',
    icon: ClipboardListIcon
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: PackageIcon
  },
  { 
    id: 'seo', 
    name: 'SEO', 
    icon: SearchIcon
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: SettingsIcon
  }
]

interface ProductVariant {
  id?: number
  name: string
  sku: string
  barcode: string
  price: number
  compareAtPrice: number | null
  quantity: number
  stock: number
  options: Record<string, string>
}

interface ProductForm {
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice: number | null
  sku: string
  barcode: string
  published: boolean
  featured: boolean
  taxable: boolean
  thumbnail: string
  gallery: string[]
  metaDescription: string
  tags: string[]
  categoryIds: number[]
  hasVariants: boolean
  variants: ProductVariant[]
  trackInventory: boolean
  quantity: number
  lowStockThreshold: number
  stockStatus: string
  allowBackorders: boolean
  stockMovements: any[]
  updatedAt: string
  translations: Record<string, {
    name: string
    slug: string
    description: string
    shortDescription: string
    metaDescription: string
  }>
}

const initialForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: 0,
  compareAtPrice: null,
  sku: '',
  barcode: '',
  published: false,
  featured: false,
  taxable: true,
  thumbnail: '',
  gallery: [],
  metaDescription: '',
  tags: [],
  categoryIds: [],
  hasVariants: false,
  variants: [],
  trackInventory: true,
  quantity: 0,
  lowStockThreshold: 5,
  stockStatus: 'in_stock',
  allowBackorders: false,
  stockMovements: [],
  updatedAt: new Date().toISOString(),
  translations: {}
}

const form = ref({ ...initialForm })
const tagsInput = ref('')

// Update page title dynamically - chỉnh sửa để tránh re-render liên tục
useHead({
  title: computed(() => form.value.name 
    ? `Edit: ${form.value.name} - Admin Dashboard`
    : 'Edit Product - Admin Dashboard')
})

const handleTagInput = (e: KeyboardEvent) => {
  // Handle Enter key
  if (e.key === 'Enter') {
    e.preventDefault()
    addTag()
  }
  // Handle Space key
  else if (e.key === ' ') {
    e.preventDefault()
    addTag()
  }
  // Handle Backspace when input is empty
  else if (e.key === 'Backspace' && tagsInput.value === '') {
    e.preventDefault()
    form.value.tags.pop()
  }
}

const addTag = () => {
  const tag = tagsInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagsInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

// Generate slug from name with Vietnamese support
const generateSlug = () => {
  if (form.value.name) {
    form.value.slug = slugify(form.value.name, {
      lower: true,           // Convert to lowercase
      strict: true,          // Strip special characters except replacement
      locale: 'vi',          // Vietnamese language
      trim: true             // Trim leading and trailing replacement chars
    })
  }
}

// Tối ưu watch cho form.value.name để không trigger generateSlug quá thường xuyên
const debouncedNameWatcher = (() => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (newName: string) => {
    if (timeout) clearTimeout(timeout);
    
    if (newName) {
      timeout = setTimeout(() => {
        generateSlug();
        timeout = null;
      }, 300);
    }
  };
})();

// Thay thế watch để sử dụng debounce
watch(() => form.value.name, debouncedNameWatcher, { immediate: false });

// Fetch product data
const fetchProduct = async () => {
  try {
    loading.value = true
    
    // Tránh log quá nhiều trong production
    if (process.env.NODE_ENV !== 'production') {
      console.log('Fetching product with ID:', route.params.id, 'and language:', selectedLanguage.value)
    }
    
    const product = await trpc.admin.products.getProductById.query(Number(route.params.id))
    
    if (product) {
      // Giảm số lượng logging không cần thiết
      if (process.env.NODE_ENV !== 'production') {
        console.log('Product loaded successfully')
      }
      
      // Initialize translations
      const translations: Record<string, any> = {}
      
      if (Array.isArray(product.translations)) {
        product.translations.forEach(translation => {
          translations[translation.locale] = {
            name: translation.title || '',
            slug: translation.slug || '',
            description: translation.content || '',
            shortDescription: translation.shortDescription || '',
            metaDescription: translation.metaDescription || ''
          }
        })
      }

      // Xử lý price đúng cách
      let productPrice = 0
      if (product.price !== null && product.price !== undefined) {
        // Nếu price là string, convert sang number
        if (typeof product.price === 'string') {
          productPrice = parseFloat(product.price) || 0
        } else if (typeof product.price === 'number') {
          productPrice = product.price
        }
      }

      // Xử lý comparePrice
      let comparePrice = null
      if ((product as any).comparePrice !== null && (product as any).comparePrice !== undefined) {
        if (typeof (product as any).comparePrice === 'string') {
          comparePrice = parseFloat((product as any).comparePrice) || null
        } else if (typeof (product as any).comparePrice === 'number') {
          comparePrice = (product as any).comparePrice
        }
      }

      // Xử lý product tags an toàn
      const productTags: string[] = []
      // Sử dụng as any để tránh lỗi linter
      const productTagsArray = (product as any).productTags
      if (Array.isArray(productTagsArray)) {
        productTagsArray.forEach(tag => {
          if (tag && typeof tag === 'object' && tag.tag && typeof tag.tag === 'object' && tag.tag.name) {
            productTags.push(tag.tag.name)
          }
        })
      }

      // Xử lý variants an toàn
      const variants: ProductVariant[] = []
      if (Array.isArray(product.variants)) {
        console.log('Processing variants:', product.variants.length)
        
        // Phân tích tên variant để tạo options
        // Trong trường hợp này, có thể dựa vào translations để tạo options đơn giản
        // Tạo một option duy nhất là "Type" (hoặc "Loại" trong tiếng Việt)
        const optionName = selectedLanguage.value === 'vi' ? 'Loại' : 'Type'
        
        product.variants.forEach(variant => {
          console.log('Processing variant:', variant)
          
          const variantName = Array.isArray(variant.translations) 
            ? variant.translations.find(t => t?.locale === selectedLanguage.value)?.name || ''
            : ''
          
          console.log('Variant name:', variantName)

          // Xử lý variant price đúng cách
          let variantPrice = 0
          if (variant.price !== null && variant.price !== undefined) {
            if (typeof variant.price === 'string') {
              variantPrice = parseFloat(variant.price) || 0
            } else if (typeof variant.price === 'number') {
              variantPrice = variant.price
            }
          }

          // Xử lý variant comparePrice
          let variantComparePrice = null
          if ((variant as any).comparePrice !== null && (variant as any).comparePrice !== undefined) {
            if (typeof (variant as any).comparePrice === 'string') {
              variantComparePrice = parseFloat((variant as any).comparePrice) || null
            } else if (typeof (variant as any).comparePrice === 'number') {
              variantComparePrice = (variant as any).comparePrice
            }
          }

          // Tạo đối tượng options dựa vào tên biến thể
          const variantOptions: Record<string, string> = {}
          if (variantName) {
            variantOptions[optionName] = variantName
          }

          variants.push({
            id: variant.id,
            name: variantName,
            sku: variant.sku || '',
            barcode: (variant as any).barcode || '',
            price: variantPrice,
            compareAtPrice: variantComparePrice,
            quantity: variant.quantity || 0,
            stock: variant.quantity || 0,  // Sử dụng quantity làm giá trị mặc định cho stock
            options: variantOptions
          })
        })
      }

      console.log('Final variants:', variants)

      // Lấy translation theo ngôn ngữ hiện tại
      const currentTranslation = product.translations?.find(t => t.locale === selectedLanguage.value);
      
      form.value = {
        name: currentTranslation?.title || '',
        slug: currentTranslation?.slug || '',
        description: currentTranslation?.content || '',
        shortDescription: currentTranslation?.shortDescription || '',
        price: productPrice,
        compareAtPrice: comparePrice,
        sku: product.sku || '',
        barcode: (product as any).barcode || '',
        published: Boolean(product.published),
        featured: Boolean((product as any).isFeatured),
        taxable: (product as any).taxable === undefined ? true : Boolean((product as any).taxable),
        thumbnail: product.thumbnail || '',
        gallery: Array.isArray(product.gallery) ? product.gallery : [],
        metaDescription: currentTranslation?.metaDescription || '',
        tags: productTags,
        categoryIds: Array.isArray(product.categories) ? product.categories.map(category => category.id) : [],
        hasVariants: Boolean(variants.length > 0),
        variants,
        trackInventory: (product as any).trackInventory === undefined ? true : Boolean((product as any).trackInventory),
        quantity: typeof product.quantity === 'number' ? product.quantity : 0,
        lowStockThreshold: (product as any).lowStockThreshold === undefined ? 5 : Number((product as any).lowStockThreshold),
        stockStatus: (product as any).stockStatus || 'in_stock',
        allowBackorders: (product as any).allowBackorders === undefined ? false : Boolean((product as any).allowBackorders),
        stockMovements: (product as any).stockMovements || [],
        updatedAt: product.updatedAt,
        translations
      }

      console.log('Form updated with variants:', form.value.variants)

      // Giảm số lượng log debug không cần thiết
      if (process.env.NODE_ENV !== 'production') {
        console.log('Form updated with variants count:', form.value.variants.length)
      }

      // Log giá trị price để debug
      console.log('Product price from API:', product.price);
      console.log('Product price after processing:', productPrice);
      
      tagsInput.value = form.value.tags.join(', ')
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    router.push('/products')
  } finally {
    loading.value = false
  }
}

// Đăng ký các lifecycle hooks
onMounted(() => {
  // Khởi tạo dữ liệu
  initData();
});

// Hàm khởi tạo dữ liệu
const initData = async () => {
  // Chỉ chạy khi selectedLanguage chưa được thiết lập
  if (selectedLanguage.value) return;
  
  // Kiểm tra URL parameter khi component mounted
  const localeFromUrl = route.query.locale as string;
  
  // Nếu có locale trong URL, sử dụng giá trị đó
  if (localeFromUrl) {
    selectedLanguage.value = localeFromUrl;
  } else {
    // Nếu không, lấy ngôn ngữ mặc định từ hệ thống
    try {
      const defaultLang = await trpc.admin.languages.getDefaultLanguage.query();
      selectedLanguage.value = defaultLang?.code || 'en';
      
      // Sử dụng router.push thay vì replace để tránh trigger nhiều lần
      if (route.query.locale !== selectedLanguage.value) {
        router.push({ 
          query: { 
            ...route.query,
            locale: selectedLanguage.value 
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch default language:', error);
      selectedLanguage.value = 'en'; // Fallback nếu không lấy được ngôn ngữ mặc định
    }
  }
  
  // Khởi tạo dữ liệu sau khi đã có selectedLanguage
  await fetchProduct();
};

// Update product
const updateProduct = async (continueEditing = false) => {
  try {
    loading.value = true
    saveAndContinue.value = continueEditing

    // Save current content to translations before updating
    form.value.translations[selectedLanguage.value] = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description,
      shortDescription: form.value.shortDescription,
      metaDescription: form.value.metaDescription
    }

    // Prepare translations array for API
    const translations = Object.entries(form.value.translations).map(([locale, content]) => ({
      locale,
      title: content.name,
      slug: content.slug,
      content: content.description,
      shortDescription: content.shortDescription,
      metaDescription: content.metaDescription
    }))

    const updateData: any = {
      price: form.value.price,
      comparePrice: form.value.compareAtPrice,
      sku: form.value.sku,
      thumbnail: form.value.thumbnail,
      gallery: form.value.gallery,
      published: form.value.published,
      quantity: form.value.quantity,
      isFeatured: form.value.featured,
      translations
    }

    // Conditionally add optional fields
    if (typeof form.value.barcode === 'string') {
      updateData.barcode = form.value.barcode
    }
    
    if (typeof form.value.taxable === 'boolean') {
      updateData.taxable = form.value.taxable
    }

    if (Array.isArray(form.value.tags)) {
      updateData.tags = form.value.tags
    }

    if (Array.isArray(form.value.categoryIds)) {
      updateData.categoryIds = form.value.categoryIds
    }

    if (typeof form.value.hasVariants === 'boolean') {
      updateData.hasVariants = form.value.hasVariants
    }

    if (Array.isArray(form.value.variants)) {
      updateData.variants = form.value.variants.map(variant => {
        // Chuẩn bị dữ liệu cho variant
        const variantData: any = {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          comparePrice: variant.compareAtPrice,
          quantity: variant.quantity,
          stock: variant.stock
        }

        // Xử lý translations dựa trên options
        const optionName = selectedLanguage.value === 'vi' ? 'Loại' : 'Type'
        const optionValue = variant.options[optionName] || variant.name

        // Thêm translations nếu có giá trị
        if (optionValue) {
          variantData.translations = [
            {
              locale: selectedLanguage.value,
              name: optionValue
            }
          ]
        }

        return variantData
      })
    }

    if (typeof form.value.trackInventory === 'boolean') {
      updateData.trackInventory = form.value.trackInventory
    }

    if (typeof form.value.lowStockThreshold === 'number') {
      updateData.lowStockThreshold = form.value.lowStockThreshold
    }

    if (typeof form.value.stockStatus === 'string') {
      updateData.stockStatus = form.value.stockStatus
    }

    if (typeof form.value.allowBackorders === 'boolean') {
      updateData.allowBackorders = form.value.allowBackorders
    }

    await trpc.admin.products.updateProduct.mutate({
      id: Number(route.params.id),
      data: updateData
    })

    toast.success('Product updated successfully!')

    if (!continueEditing) {
      router.push('/products')
    } else {
      // Chỉ refresh data nếu thực sự cần thiết
      await fetchProduct()
    }
  } catch (error: any) {
    console.error('Failed to update product:', error)
    
    // Hiển thị thông báo lỗi với ngôn ngữ hiện tại
    let errorMessage = `[${selectedLanguage.value}] `
    
    // Handle tRPC error
    if (error.cause) {
      errorMessage += error.cause
    } else if (error.message) {
      errorMessage += error.message
    } else {
      errorMessage += 'Failed to update product. Please try again.'
    }
    
    toast.error(errorMessage, {
      timeout: 8000,
      closeButton: true,
      icon: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true
    })
  } finally {
    loading.value = false
    saveAndContinue.value = false
  }
}

// Quill Editor Options
const editorOptions = ref({
  theme: 'snow',
  modules: {}
})

// Initialize editor options on client-side only
if (process.client) {
  editorOptions.value.modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  }
}

// Thêm cleanup khi component unmount
onBeforeUnmount(() => {
  // Cleanup để tránh memory leak
  selectedLanguage.value = '';
  form.value = { ...initialForm };
  loading.value = false;
  saveAndContinue.value = false;
});
</script>

<style>
.quill-editor {
  @apply bg-white rounded-lg overflow-hidden;
}

.ql-toolbar {
  @apply border-0 border-b border-slate-200 bg-white px-6 !important;
}

.ql-container {
  @apply border-0 bg-white !important;
}

.ql-editor {
  @apply min-h-[400px] text-slate-700 px-6 !important;
}

.ql-editor h1 {
  @apply text-3xl font-bold mb-4;
}

.ql-editor h2 {
  @apply text-2xl font-semibold mb-3;
}

.ql-editor h3 {
  @apply text-xl font-semibold mb-3;
}

.ql-editor p {
  @apply mb-4 text-base leading-relaxed;
}

.ql-editor ul, .ql-editor ol {
  @apply mb-4 pl-6;
}

.ql-editor ul {
  @apply list-disc;
}

.ql-editor ol {
  @apply list-decimal;
}

.ql-editor blockquote {
  @apply border-l-4 border-slate-200 pl-4 italic my-4;
}

.ql-editor img {
  @apply max-w-full rounded-lg my-4;
}

.ql-editor pre {
  @apply bg-slate-100 p-4 rounded-lg my-4 overflow-x-auto;
}

.ql-editor code {
  @apply font-mono text-sm bg-slate-100 px-1.5 py-0.5 rounded;
}

/* Prose styles for preview */
.prose {
  @apply text-slate-700;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-slate-900 font-semibold mt-8 mb-4;
}

.prose p {
  @apply mb-4;
}

.prose ul, .prose ol {
  @apply mb-4 pl-6;
}

.prose ul {
  @apply list-disc;
}

.prose ol {
  @apply list-decimal;
}

.prose a {
  @apply text-primary hover:text-primary/80;
}

.prose img {
  @apply rounded-lg my-8;
}

.prose blockquote {
  @apply border-l-4 border-slate-200 pl-4 italic my-6;
}

.prose code {
  @apply bg-slate-100 px-1.5 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-slate-900 text-slate-50 p-4 rounded-lg my-6 overflow-x-auto;
}

.language-switcher {
  position: relative;
  display: inline-block;
  width: auto;
}

/* Dropdown menu */
.absolute {
  z-index: 50 !important;
}
</style> 