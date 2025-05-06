<script setup lang="ts">
import { ref, reactive, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useTrpc } from '../../composables/useTrpc'
import { useToast } from '../../composables/useToast'
import { Palette } from 'lucide-vue-next'
import { ColorMode } from '@ew/shared'

// Set page title
provide('pageTitle', 'Tạo Theme mới')

const router = useRouter()
const trpc = useTrpc()
const toast = useToast()
const isSubmitting = ref(false)
const formErrors = ref<Record<string, string>>({})

// Theme form
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

// Generate default color shades
function generateDefaultShades(baseColor: string) {
  // For simplicity, we're using the same color for all shades in this example
  // In a real app, you would generate proper color shades
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
  
  isSubmitting.value = true
  
  try {
    const result = await trpc.admin.theme.create.mutate({
      name: themeForm.name,
      colors: themeForm.colors,
      isActive: themeForm.isActive
    })
    
    toast.success('Tạo theme thành công')
    
    // Navigate to the theme detail page
    router.push(`/themes/${result.id}`)
  } catch (error) {
    console.error('Failed to create theme:', error)
    toast.error('Không thể tạo theme')
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
const resetForm = () => {
  themeForm.name = ''
  themeForm.isActive = false
  formErrors.value = {}
}

// Cancel and go back
const cancelForm = () => {
  router.push('/themes')
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <Palette class="inline-block mr-2 w-7 h-7" />
        Tạo Theme mới
      </h1>
    </div>
    
    <div class="grid grid-cols-1 gap-6">
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
                @click="resetForm"
                :disabled="isSubmitting"
              >
                Xóa hết
              </UButton>
              <UButton
                variant="ghost"
                @click="cancelForm"
                :disabled="isSubmitting"
              >
                Hủy
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                Tạo Theme
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