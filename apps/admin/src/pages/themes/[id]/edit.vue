<script setup lang="ts">
import { ref, reactive, onMounted, provide, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trpc } from '@/trpc'
import { Palette } from 'lucide-vue-next'
import { Theme, ColorMode } from '@ew/shared'

// Get route params
const route = useRoute()
const router = useRouter()
const themeId = computed(() => Number(route.params.id))

// Set page title
provide('pageTitle', 'Chỉnh sửa Theme')

// State
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const formErrors = ref<Record<string, string>>({})

// Form
const themeForm = reactive({
  name: '',
  colors: {
    light: {
      primary: generateDefaultShades('#4F46E5'),
      secondary: generateDefaultShades('#EC4899'),
      tertiary: generateDefaultShades('#0EA5E9')
    },
    dark: {
      primary: generateDefaultShades('#6366F1'),
      secondary: generateDefaultShades('#F472B6'),
      tertiary: generateDefaultShades('#38BDF8')
    }
  },
  isActive: false
})

// Generate default color shades if needed
function generateDefaultShades(baseColor: string) {
  return {
    '50': lightenDarkenColor(baseColor, 150),
    '100': lightenDarkenColor(baseColor, 120),
    '200': lightenDarkenColor(baseColor, 90),
    '300': lightenDarkenColor(baseColor, 60),
    '400': lightenDarkenColor(baseColor, 30),
    '500': baseColor,
    '600': lightenDarkenColor(baseColor, -30),
    '700': lightenDarkenColor(baseColor, -60),
    '800': lightenDarkenColor(baseColor, -90),
    '900': lightenDarkenColor(baseColor, -120)
  }
}

// Helper function to lighten or darken a color
function lightenDarkenColor(color: string, amount: number): string {
  let hex = color.replace('#', '')
  
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  const newR = Math.min(255, Math.max(0, r + amount))
  const newG = Math.min(255, Math.max(0, g + amount))
  const newB = Math.min(255, Math.max(0, b + amount))
  
  const rr = ((newR.toString(16).length === 1) ? '0' + newR.toString(16) : newR.toString(16))
  const gg = ((newG.toString(16).length === 1) ? '0' + newG.toString(16) : newG.toString(16))
  const bb = ((newB.toString(16).length === 1) ? '0' + newB.toString(16) : newB.toString(16))
  
  return `#${rr}${gg}${bb}`
}

// Fetch theme data
const fetchTheme = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await trpc.admin.theme.getTheme.query({ id: themeId.value })
    
    // Copy data to form
    themeForm.name = data.name
    
    // If the colors are complete, use them. Otherwise, generate defaults
    if (data.colors) {
      // For light mode
      if (data.colors.light) {
        if (data.colors.light.primary && Object.keys(data.colors.light.primary).length === 10) {
          themeForm.colors.light.primary = data.colors.light.primary
        } else if (data.colors.light.primary && data.colors.light.primary['500']) {
          themeForm.colors.light.primary = generateDefaultShades(data.colors.light.primary['500'])
        }
        
        if (data.colors.light.secondary && Object.keys(data.colors.light.secondary).length === 10) {
          themeForm.colors.light.secondary = data.colors.light.secondary
        } else if (data.colors.light.secondary && data.colors.light.secondary['500']) {
          themeForm.colors.light.secondary = generateDefaultShades(data.colors.light.secondary['500'])
        }
        
        if (data.colors.light.tertiary && Object.keys(data.colors.light.tertiary).length === 10) {
          themeForm.colors.light.tertiary = data.colors.light.tertiary
        } else if (data.colors.light.tertiary && data.colors.light.tertiary['500']) {
          themeForm.colors.light.tertiary = generateDefaultShades(data.colors.light.tertiary['500'])
        }
      }
      
      // For dark mode
      if (data.colors.dark) {
        if (data.colors.dark.primary && Object.keys(data.colors.dark.primary).length === 10) {
          themeForm.colors.dark.primary = data.colors.dark.primary
        } else if (data.colors.dark.primary && data.colors.dark.primary['500']) {
          themeForm.colors.dark.primary = generateDefaultShades(data.colors.dark.primary['500'])
        }
        
        if (data.colors.dark.secondary && Object.keys(data.colors.dark.secondary).length === 10) {
          themeForm.colors.dark.secondary = data.colors.dark.secondary
        } else if (data.colors.dark.secondary && data.colors.dark.secondary['500']) {
          themeForm.colors.dark.secondary = generateDefaultShades(data.colors.dark.secondary['500'])
        }
        
        if (data.colors.dark.tertiary && Object.keys(data.colors.dark.tertiary).length === 10) {
          themeForm.colors.dark.tertiary = data.colors.dark.tertiary
        } else if (data.colors.dark.tertiary && data.colors.dark.tertiary['500']) {
          themeForm.colors.dark.tertiary = generateDefaultShades(data.colors.dark.tertiary['500'])
        }
      }
    }
    
    themeForm.isActive = data.isActive
  } catch (err: any) {
    console.error('Failed to fetch theme:', err)
    error.value = err.message || 'Không thể tải thông tin theme'
    
    UNotification.show({
      text: 'Không thể tải thông tin theme',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Update color shades whenever the base color changes
watch(() => themeForm.colors.light.primary['500'], (newVal) => {
  themeForm.colors.light.primary = generateDefaultShades(newVal)
})

watch(() => themeForm.colors.light.secondary['500'], (newVal) => {
  themeForm.colors.light.secondary = generateDefaultShades(newVal)
})

watch(() => themeForm.colors.light.tertiary['500'], (newVal) => {
  themeForm.colors.light.tertiary = generateDefaultShades(newVal)
})

watch(() => themeForm.colors.dark.primary['500'], (newVal) => {
  themeForm.colors.dark.primary = generateDefaultShades(newVal)
})

watch(() => themeForm.colors.dark.secondary['500'], (newVal) => {
  themeForm.colors.dark.secondary = generateDefaultShades(newVal)
})

watch(() => themeForm.colors.dark.tertiary['500'], (newVal) => {
  themeForm.colors.dark.tertiary = generateDefaultShades(newVal)
})

// Validate form
const validateForm = () => {
  const errors: Record<string, string> = {}
  
  if (!themeForm.name.trim()) {
    errors.name = 'Tên theme không được để trống'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

// Submit form
const submitForm = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    await trpc.admin.theme.updateTheme.mutate({
      id: themeId.value,
      name: themeForm.name,
      colors: themeForm.colors,
      isActive: themeForm.isActive
    })
    
    UNotification.show({
      text: 'Cập nhật theme thành công',
      type: 'success'
    })
    
    // Navigate back to the theme detail page
    router.push(`/themes/${themeId.value}`)
  } catch (error) {
    console.error('Failed to update theme:', error)
    UNotification.show({
      text: 'Không thể cập nhật theme',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Cancel and go back
const cancelForm = () => {
  router.push(`/themes/${themeId.value}`)
}

// Load data on mount
onMounted(() => {
  fetchTheme()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center">
        <Palette class="mr-2 w-7 h-7 text-primary-500" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Chỉnh sửa Theme</h1>
      </div>
      <div class="flex gap-2">
        <UButton
          color="gray"
          variant="soft"
          icon="i-heroicons-arrow-left"
          @click="cancelForm"
        >
          Quay lại
        </UButton>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <ULoading class="w-8 h-8 text-primary-500" />
      <span class="ml-2 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
    </div>
    
    <!-- Error state -->
    <UCard v-else-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50">
      <div class="flex items-center text-red-600 dark:text-red-400">
        <i class="i-heroicons-exclamation-circle mr-2 text-xl"></i>
        <span>{{ error }}</span>
      </div>
      <UButton color="gray" variant="ghost" class="mt-2" @click="fetchTheme">
        Thử lại
      </UButton>
    </UCard>
    
    <!-- Edit form -->
    <div v-else class="grid grid-cols-1 gap-6">
      <UCard>
        <form @submit.prevent="submitForm">
          <div class="space-y-6">
            <!-- Theme Name -->
            <div class="space-y-2">
              <UFormGroup
                label="Tên Theme"
                required
                help="Nhập tên dễ nhớ để phân biệt với các theme khác"
                :error="formErrors.name"
              >
                <UInput
                  v-model="themeForm.name"
                  placeholder="Ví dụ: Theme mặc định, Theme Mùa hè, ..."
                  :error="!!formErrors.name"
                />
              </UFormGroup>
            </div>
            
            <!-- Light Mode Colors -->
            <UFormGroup
              label="Màu sắc Light Mode"
              help="Chọn màu sắc chính cho giao diện sáng"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu chính (Primary)
                  </label>
                  <UColorPicker
                    v-model="themeForm.colors.light.primary['500']"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu phụ (Secondary)
                  </label>
                  <UColorPicker
                    v-model="themeForm.colors.light.secondary['500']"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu bổ sung (Tertiary)
                  </label>
                  <UColorPicker
                    v-model="themeForm.colors.light.tertiary['500']"
                    class="w-full"
                  />
                </div>
              </div>
            </UFormGroup>
            
            <!-- Dark Mode Colors -->
            <UFormGroup
              label="Màu sắc Dark Mode"
              help="Chọn màu sắc chính cho giao diện tối"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu chính (Primary)
                  </label>
                  <UColorPicker
                    v-model="themeForm.colors.dark.primary['500']"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu phụ (Secondary)
                  </label>
                  <UColorPicker
                    v-model="themeForm.colors.dark.secondary['500']"
                    class="w-full"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Màu bổ sung (Tertiary)
                  </label>
                  <UColorPicker
                    v-model="themeForm.colors.dark.tertiary['500']"
                    class="w-full"
                  />
                </div>
              </div>
            </UFormGroup>
            
            <!-- Active Status -->
            <UFormGroup>
              <UToggle
                v-model="themeForm.isActive"
                label="Kích hoạt theme này"
                description="Theme sẽ được áp dụng ngay cho website khi được kích hoạt"
                color="primary"
              />
            </UFormGroup>
            
            <!-- Form Actions -->
            <div class="flex justify-end space-x-2">
              <UButton
                variant="ghost"
                @click="cancelForm"
                :disabled="saving"
              >
                Hủy
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="saving"
                :disabled="saving"
              >
                Lưu thay đổi
              </UButton>
            </div>
          </div>
        </form>
      </UCard>
      
      <!-- Theme Preview -->
      <UCard>
        <template #header>
          <div class="font-medium">Xem trước Theme</div>
        </template>
        
        <div class="space-y-6">
          <div class="p-4 rounded-lg" :style="{ backgroundColor: themeForm.colors.light.primary['50'] }">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
              <!-- Primary colors -->
              <div>
                <h3 class="text-base font-medium mb-2">Màu Primary</h3>
                <div class="flex flex-col space-y-2">
                  <div class="flex items-center space-x-2" 
                      v-for="(shade, index) in ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']" 
                      :key="shade">
                    <div class="w-6 h-6 rounded-full" 
                        :style="{ backgroundColor: themeForm.colors.light.primary[shade] }"></div>
                    <span class="text-xs">{{ shade }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Secondary colors -->
              <div>
                <h3 class="text-base font-medium mb-2">Màu Secondary</h3>
                <div class="flex flex-col space-y-2">
                  <div class="flex items-center space-x-2" 
                      v-for="(shade, index) in ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']" 
                      :key="shade">
                    <div class="w-6 h-6 rounded-full" 
                        :style="{ backgroundColor: themeForm.colors.light.secondary[shade] }"></div>
                    <span class="text-xs">{{ shade }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Tertiary colors -->
              <div>
                <h3 class="text-base font-medium mb-2">Màu Tertiary</h3>
                <div class="flex flex-col space-y-2">
                  <div class="flex items-center space-x-2" 
                      v-for="(shade, index) in ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']" 
                      :key="shade">
                    <div class="w-6 h-6 rounded-full" 
                        :style="{ backgroundColor: themeForm.colors.light.tertiary[shade] }"></div>
                    <span class="text-xs">{{ shade }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sample UI Preview with the colors -->
          <div class="border rounded-lg p-4 dark:border-gray-700">
            <h3 class="text-base font-medium mb-4">Mẫu giao diện</h3>
            
            <div class="flex flex-col space-y-4">
              <!-- Button examples -->
              <div class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Buttons</h4>
                <div class="flex flex-wrap gap-2">
                  <button class="px-4 py-2 rounded-md text-white" 
                    :style="{ backgroundColor: themeForm.colors.light.primary['500'] }">
                    Primary Button
                  </button>
                  <button class="px-4 py-2 rounded-md text-white" 
                    :style="{ backgroundColor: themeForm.colors.light.secondary['500'] }">
                    Secondary Button
                  </button>
                  <button class="px-4 py-2 rounded-md text-white" 
                    :style="{ backgroundColor: themeForm.colors.light.tertiary['500'] }">
                    Tertiary Button
                  </button>
                </div>
              </div>
              
              <!-- Text examples -->
              <div class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Typography</h4>
                <div class="space-y-1">
                  <div :style="{ color: themeForm.colors.light.primary['700'] }" class="text-lg font-bold">
                    This is a heading with primary color
                  </div>
                  <div :style="{ color: themeForm.colors.light.secondary['600'] }" class="text-base">
                    This is body text with secondary color
                  </div>
                  <div :style="{ color: themeForm.colors.light.tertiary['500'] }" class="text-sm">
                    This is small text with tertiary color
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template> 