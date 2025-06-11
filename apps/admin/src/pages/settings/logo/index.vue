<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useTrpc } from '@/composables/useTrpc'
import { useToast } from '@/composables/useToast'
import { useUpload } from '@/composables/useUpload'
import { 
  Globe, 
  Upload,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Star,
  Plus,
  Save,
  X
} from 'lucide-vue-next'

const { t } = useI18n()
const { hasPermission, isSuperAdmin } = usePermissions()
const trpc = useTrpc()
const toast = useToast()
const { uploadFile, isUploading } = useUpload()

// Permission check
const hasLogoPermission = computed(() => isSuperAdmin.value || hasPermission('MANAGE_LOGO'))

// Data
const logos = ref<any[]>([])
const isLoading = ref(false)
const showModal = ref(false)
const editingLogo = ref<any>(null)
const uploadProgress = ref(0)
const lightModeFile = ref<File | null>(null)
const darkModeFile = ref<File | null>(null)

// Form data
const form = ref({
  id: null as number | null,
  darkModeUrl: '',
  lightModeUrl: '',
  altText: '',
  type: 'main',
  isActive: true,
  width: null as number | null,
  height: null as number | null
})

// Logo types
const logoTypes = [
  { value: 'main', label: 'Main Logo', icon: Monitor, description: 'Primary site logo' },
  { value: 'mobile', label: 'Mobile Logo', icon: Smartphone, description: 'Mobile version of logo' },
  { value: 'favicon', label: 'Favicon', icon: Star, description: 'Browser tab icon (16x16, 32x32, .ico format)' },
  { value: 'footer', label: 'Footer Logo', icon: Globe, description: 'Logo for site footer' }
]

// Methods
const fetchLogos = async () => {
  try {
    isLoading.value = true
    logos.value = await trpc.logo.adminGetAll.query()
  } catch (error) {
    console.error('Error fetching logos:', error)
    toast.error('Failed to load logos')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  resetForm()
  editingLogo.value = null
  showModal.value = true
}

const openEditModal = (logo: any) => {
  editingLogo.value = logo
  form.value = { ...logo }
  showModal.value = true
}

const resetForm = () => {
  form.value = {
    id: null,
    darkModeUrl: '',
    lightModeUrl: '',
    altText: '',
    type: 'main',
    isActive: true,
    width: null,
    height: null
  }
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  editingLogo.value = null
  lightModeFile.value = null
  darkModeFile.value = null
  uploadProgress.value = 0
}

const handleFileUpload = async (file: File, mode = 'light') => {
  if (!file) return
  
  try {
    uploadProgress.value = 0
    
    // Determine folder based on logo type
    let folder = 'logos'
    if (form.value.type === 'favicon') {
      folder = 'favicons'
    } else if (form.value.type === 'mobile') {
      folder = 'logos/mobile'
    } else if (form.value.type === 'footer') {
      folder = 'logos/footer'
    }
    
    const result = await uploadFile({
      file,
      folder,
      onProgress: (percent: number) => {
        uploadProgress.value = percent
      }
    })
    
    if (mode === 'light') {
      form.value.lightModeUrl = result.url
    } else {
      form.value.darkModeUrl = result.url
    }
    
    toast.success(`${mode === 'light' ? 'Light mode' : 'Dark mode'} logo uploaded successfully`)
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error('Upload failed')
  } finally {
    uploadProgress.value = 0
  }
}

const onLightModeFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    lightModeFile.value = file
    handleFileUpload(file, 'light')
  }
}

const onDarkModeFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    darkModeFile.value = file
    handleFileUpload(file, 'dark')
  }
}

const saveLogo = async () => {
  try {
    // Validation
    if (!form.value.lightModeUrl && !form.value.darkModeUrl) {
      toast.error('Please provide at least one logo URL')
      return
    }
    
    const logoData = {
      darkModeUrl: form.value.type === 'favicon' ? undefined : (form.value.darkModeUrl || undefined),
      lightModeUrl: form.value.lightModeUrl || undefined,
      altText: form.value.altText || undefined,
      type: form.value.type,
      isActive: form.value.isActive,
      width: form.value.width || undefined,
      height: form.value.height || undefined
    }
    
    if (editingLogo.value) {
      // Update existing logo
      await trpc.logo.adminUpdate.mutate({
        id: form.value.id!,
        data: logoData
      })
      toast.success('Logo updated successfully')
    } else {
      // Create new logo
      await trpc.logo.adminCreate.mutate(logoData)
      toast.success('Logo created successfully')
    }
    
    // If this is a favicon update, notify about cache refresh
    if (form.value.type === 'favicon') {
      toast.success('Favicon updated! Changes may take a few moments to appear in browser tabs.')
    }
    
    closeModal()
    await fetchLogos()
  } catch (error) {
    console.error('Error saving logo:', error)
    toast.error('Failed to save logo')
  }
}

const deleteLogo = async (logoId: number) => {
  if (!confirm('Are you sure you want to delete this logo?')) return
  
  try {
    await trpc.logo.adminDelete.mutate(logoId)
    toast.success('Logo deleted successfully')
    await fetchLogos()
  } catch (error) {
    console.error('Error deleting logo:', error)
    toast.error('Failed to delete logo')
  }
}

const toggleActive = async (logo: any) => {
  try {
    await trpc.logo.adminUpdate.mutate({
      id: logo.id,
      data: { isActive: !logo.isActive }
    })
    toast.success('Logo status updated')
    await fetchLogos()
  } catch (error) {
    console.error('Error updating logo status:', error)
    toast.error('Failed to update logo status')
  }
}

const getLogoTypeInfo = (type: string) => {
  return logoTypes.find(t => t.value === type) || logoTypes[0]
}

const getColorVariant = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'blue',
    green: 'green',
    purple: 'purple',
    orange: 'orange',
    red: 'red',
    pink: 'pink',
    indigo: 'indigo',
    gray: 'gray',
    cyan: 'cyan',
    yellow: 'yellow',
    emerald: 'emerald'
  }
  return colorMap[color] || 'gray'
}

// Computed
const groupedLogos = computed(() => {
  const groups: Record<string, any[]> = {}
  logos.value.forEach((logo: any) => {
    if (!groups[logo.type]) {
      groups[logo.type] = []
    }
    groups[logo.type].push(logo)
  })
  return groups
})

onMounted(() => {
  if (hasLogoPermission.value) {
    fetchLogos()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Access Denied -->
    <div v-if="!hasLogoPermission" class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
      <Globe class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('settings.access_denied', 'Access Denied') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {{ t('settings.logo_access_denied_message', 'You don\'t have permission to manage logos and favicons.') }}
      </p>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <Globe class="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Logo & Favicon Management
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your site logos, favicons and brand assets
              </p>
            </div>
          </div>
          
          <UButton
            icon="i-lucide-plus"
            color="emerald"
            @click="openCreateModal"
          >
            Add New Logo
          </UButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>

      <!-- Logo Groups -->
      <div v-else class="space-y-6">
        <div v-for="(logoGroup, type) in groupedLogos" :key="type" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <component :is="getLogoTypeInfo(type).icon" class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ getLogoTypeInfo(type).label }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ getLogoTypeInfo(type).description }}
                </p>
              </div>
            </div>
            <UBadge color="emerald" variant="soft">
              {{ logoGroup.length }} logo(s)
            </UBadge>
          </div>

          <!-- Logo Items -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="logo in logoGroup" :key="logo.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <!-- Logo Preview -->
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                <div class="space-y-2">
                  <!-- Light Mode -->
                  <div v-if="logo.lightModeUrl" class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">Light:</span>
                    <img 
                      :src="logo.lightModeUrl" 
                      :alt="logo.altText || 'Logo'"
                      :style="{ width: logo.width ? `${logo.width}px` : 'auto', height: logo.height ? `${logo.height}px` : 'auto' }"
                      class="max-w-[100px] max-h-[50px] object-contain"
                    />
                  </div>
                  
                  <!-- Dark Mode -->
                  <div v-if="logo.darkModeUrl" class="flex items-center space-x-2">
                    <span class="text-xs text-gray-500">Dark:</span>
                    <div class="bg-gray-800 p-2 rounded">
                      <img 
                        :src="logo.darkModeUrl" 
                        :alt="logo.altText || 'Logo'"
                        :style="{ width: logo.width ? `${logo.width}px` : 'auto', height: logo.height ? `${logo.height}px` : 'auto' }"
                        class="max-w-[100px] max-h-[50px] object-contain"
                      />
                    </div>
                  </div>
                  
                  <!-- No Image -->
                  <div v-if="!logo.lightModeUrl && !logo.darkModeUrl" class="text-center text-gray-400">
                    <Globe class="h-8 w-8 mx-auto mb-2" />
                    <span class="text-xs">No image</span>
                  </div>
                </div>
              </div>

              <!-- Logo Info -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ logo.altText || `${getLogoTypeInfo(logo.type).label}` }}
                  </span>
                  <div class="flex items-center space-x-1">
                    <UButton
                      :icon="logo.isActive ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                      :color="logo.isActive ? 'green' : 'gray'"
                      size="xs"
                      variant="ghost"
                      @click="toggleActive(logo)"
                    />
                    <UButton
                      icon="i-lucide-edit-2"
                      color="blue"
                      size="xs"
                      variant="ghost"
                      @click="openEditModal(logo)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="red"
                      size="xs"
                      variant="ghost"
                      @click="deleteLogo(logo.id)"
                    />
                  </div>
                </div>
                
                <div class="text-xs text-gray-500 space-y-1">
                  <div v-if="logo.width && logo.height">
                    Size: {{ logo.width }}x{{ logo.height }}px
                  </div>
                  <div>
                    Status: 
                    <span :class="logo.isActive ? 'text-green-600' : 'text-red-600'">
                      {{ logo.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="Object.keys(groupedLogos).length === 0" class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <Globe class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Logos Found
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
            Get started by adding your first logo or favicon.
          </p>
          <UButton
            icon="i-lucide-plus"
            color="emerald"
            @click="openCreateModal"
          >
            Add First Logo
          </UButton>
        </div>
      </div>
    </template>

    <!-- Logo Modal -->
    <UModal v-model="showModal" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingLogo ? 'Edit Logo' : 'Add New Logo' }}
            </h3>
            <UButton
              icon="i-lucide-x"
              color="gray"
              variant="ghost"
              size="xs"
              @click="closeModal"
            />
          </div>
        </template>

        <div class="space-y-6">
          <!-- Logo Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo Type
            </label>
            <USelectMenu
              v-model="form.type"
              :options="logoTypes"
              option-attribute="label"
              value-attribute="value"
            >
              <template #option="{ option }">
                <div class="flex items-center space-x-3">
                  <component :is="option.icon" class="h-4 w-4" />
                  <div>
                    <div class="text-sm font-medium">{{ option.label }}</div>
                    <div class="text-xs text-gray-500">{{ option.description }}</div>
                  </div>
                </div>
              </template>
            </USelectMenu>
          </div>

          <!-- Light Mode Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ form.type === 'favicon' ? 'Favicon File' : 'Light Mode Logo' }}
            </label>
            <div class="space-y-3">
              <!-- Favicon Notice -->
              <div v-if="form.type === 'favicon'" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div class="flex items-start space-x-2">
                  <Star class="h-4 w-4 text-blue-500 mt-0.5" />
                  <div class="text-sm text-blue-700 dark:text-blue-300">
                    <p class="font-medium mb-1">Favicon Requirements:</p>
                    <ul class="list-disc list-inside space-y-1 text-xs">
                      <li>Recommended sizes: 16x16, 32x32, 48x48 pixels</li>
                      <li>Format: .ico, .png, or .svg</li>
                      <li>For best compatibility, use .ico format</li>
                      <li>Only one file needed (light mode only for favicon)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <!-- URL Input -->
              <UInput
                v-model="form.lightModeUrl"
                :placeholder="form.type === 'favicon' ? 'https://example.com/favicon.ico' : 'https://example.com/logo-light.png'"
                icon="i-lucide-link"
              />
              
              <!-- Upload Button -->
              <div class="flex items-center space-x-3">
                <UButton
                  icon="i-lucide-upload"
                  color="blue"
                  variant="outline"
                  size="sm"
                  :loading="isUploading && uploadProgress > 0"
                  @click="$refs.lightModeFileInput?.click()"
                >
                  {{ isUploading && uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Upload File' }}
                </UButton>
                
                <!-- File input (hidden) -->
                <input
                  ref="lightModeFileInput"
                  type="file"
                  :accept="form.type === 'favicon' ? '.ico,.png,.svg,image/x-icon,image/png,image/svg+xml' : 'image/*'"
                  class="hidden"
                  @change="onLightModeFileSelect"
                />
                
                <!-- Upload Progress -->
                <div v-if="isUploading && uploadProgress > 0" class="flex-1">
                  <UProgress :value="uploadProgress" />
                </div>
              </div>
            </div>
          </div>

          <!-- Dark Mode Upload -->
          <div v-if="form.type !== 'favicon'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dark Mode Logo
            </label>
            <div class="space-y-3">
              <!-- URL Input -->
              <UInput
                v-model="form.darkModeUrl"
                placeholder="https://example.com/logo-dark.png"
                icon="i-lucide-link"
              />
              
              <!-- Upload Button -->
              <div class="flex items-center space-x-3">
                <UButton
                  icon="i-lucide-upload"
                  color="blue"
                  variant="outline"
                  size="sm"
                  :loading="isUploading && uploadProgress > 0"
                  @click="$refs.darkModeFileInput?.click()"
                >
                  {{ isUploading && uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Upload File' }}
                </UButton>
                
                <!-- File input (hidden) -->
                <input
                  ref="darkModeFileInput"
                  type="file"
                  accept="image/*,.ico"
                  class="hidden"
                  @change="onDarkModeFileSelect"
                />
                
                <!-- Upload Progress -->
                <div v-if="isUploading && uploadProgress > 0" class="flex-1">
                  <UProgress :value="uploadProgress" />
                </div>
              </div>
            </div>
          </div>

          <!-- Alt Text -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alt Text
            </label>
            <UInput
              v-model="form.altText"
              placeholder="Company Logo"
            />
          </div>

          <!-- Dimensions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Width (px)
              </label>
              <UInput
                v-model.number="form.width"
                type="number"
                placeholder="Auto"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (px)
              </label>
              <UInput
                v-model.number="form.height"
                type="number"
                placeholder="Auto"
              />
            </div>
          </div>

          <!-- Active Status -->
          <div class="flex items-center space-x-3">
            <UToggle v-model="form.isActive" />
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <!-- Preview -->
          <div v-if="form.lightModeUrl || form.darkModeUrl" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h4>
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <div v-if="form.lightModeUrl" class="flex items-center space-x-3">
                <span class="text-xs text-gray-500 w-12">{{ form.type === 'favicon' ? 'Favicon:' : 'Light:' }}</span>
                <div class="flex items-center space-x-2">
                  <img 
                    :src="form.lightModeUrl" 
                    :alt="form.altText || 'Logo Preview'"
                    :style="{ width: form.width ? `${form.width}px` : 'auto', height: form.height ? `${form.height}px` : 'auto' }"
                    :class="form.type === 'favicon' ? 'max-w-[32px] max-h-[32px]' : 'max-w-[150px] max-h-[75px]'"
                    class="object-contain border border-gray-200 rounded"
                    @error="$event.target.style.display = 'none'"
                  />
                  <span v-if="form.type === 'favicon'" class="text-xs text-gray-500">
                    ({{ form.width || 'auto' }}x{{ form.height || 'auto' }})
                  </span>
                </div>
              </div>
              <div v-if="form.darkModeUrl && form.type !== 'favicon'" class="flex items-center space-x-3">
                <span class="text-xs text-gray-500 w-12">Dark:</span>
                <div class="bg-gray-800 p-2 rounded">
                  <img 
                    :src="form.darkModeUrl" 
                    :alt="form.altText || 'Logo Preview'"
                    :style="{ width: form.width ? `${form.width}px` : 'auto', height: form.height ? `${form.height}px` : 'auto' }"
                    class="max-w-[150px] max-h-[75px] object-contain"
                    @error="$event.target.style.display = 'none'"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end space-x-3">
            <UButton
              color="gray"
              variant="ghost"
              @click="closeModal"
            >
              Cancel
            </UButton>
            <UButton
              icon="i-lucide-save"
              color="emerald"
              @click="saveLogo"
            >
              {{ editingLogo ? 'Update Logo' : 'Create Logo' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template> 