import { ref, reactive } from 'vue'
import { useTrpc } from './useTrpc'
import { useUpload } from './useUpload'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

export interface HeroSliderFormData {
  id?: number
  title: string
  description: string
  imageUrl: string
  buttonText: string
  buttonLink: string
  order: number
  isActive: boolean
  themeId: number | undefined
}

export function useHeroSlider() {
  const trpc = useTrpc()
  const { uploadImage } = useUpload()
  const router = useRouter()
  
  // State
  const isLoading = ref(false)
  const isFetching = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const themes = ref<any[]>([])
  const isDragging = ref(false)
  const imagePreview = ref<string | null>(null)
  
  // Fetch themes
  const fetchThemes = async () => {
    try {
      isLoading.value = true
      const result = await trpc.admin.theme.getAll.query()
      themes.value = result
    } catch (err: any) {
      console.error('Error fetching themes:', err)
      error.value = err.message || 'Failed to fetch themes'
    } finally {
      isLoading.value = false
    }
  }
  
  // Fetch hero slider by ID
  const fetchHeroSlider = async (sliderId: number, formData: HeroSliderFormData) => {
    try {
      isFetching.value = true
      error.value = null
      
      const result = await trpc.admin.heroSlider.getById.query(sliderId)
      
      if (!result) {
        error.value = 'Hero slider not found'
        return false
      }
      
      // Update form data with slider values
      formData.title = result.title
      formData.description = result.description || ''
      formData.imageUrl = result.imageUrl
      formData.buttonText = result.buttonText || ''
      formData.buttonLink = result.buttonLink || ''
      formData.order = result.order
      formData.isActive = result.isActive
      formData.themeId = result.themeId || undefined
      
      // Set image preview
      imagePreview.value = result.imageUrl
      
      return true
    } catch (err: any) {
      console.error('Error fetching hero slider:', err)
      error.value = err.message || 'Failed to fetch hero slider'
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to fetch hero slider'
      })
      
      return false
    } finally {
      isFetching.value = false
    }
  }
  
  // Handle image upload events
  const handleImageUpload = async (event: Event, formData: HeroSliderFormData) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return
    
    const file = input.files[0]
    await processUpload(file, formData)
  }
  
  // Handle image drop events
  const handleDrop = async (event: DragEvent, formData: HeroSliderFormData) => {
    event.preventDefault()
    isDragging.value = false
    
    if (!event.dataTransfer?.files.length) return
    
    const file = event.dataTransfer.files[0]
    if (!file.type.startsWith('image/')) {
      error.value = "Please drop an image file"
      return
    }
    
    await processUpload(file, formData)
  }
  
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = true
  }
  
  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = false
  }
  
  // Process image upload
  const processUpload = async (file: File, formData: HeroSliderFormData) => {
    try {
      error.value = null
      
      // Upload image using composable
      const imageUrl = await uploadImage(file, 'hero-sliders')
      
      // Update form data with image URL
      formData.imageUrl = imageUrl
      
      // Show image preview
      imagePreview.value = imageUrl
      
    } catch (err: any) {
      console.error('Error uploading image:', err)
      error.value = err.message || 'Failed to upload image'
      
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: err.message || 'Failed to upload image'
      })
    }
  }
  
  // Validate form
  const validateForm = (formData: HeroSliderFormData): boolean => {
    // Check theme selection
    if (!formData.themeId) {
      error.value = 'Please select a theme'
      
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a theme'
      })
      
      return false
    }
    
    // Check for required title
    if (!formData.title) {
      error.value = 'Please enter a title'
      
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a title'
      })
      
      return false
    }
    
    // Check for image
    if (!formData.imageUrl) {
      error.value = 'Please upload an image'
      
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please upload an image'
      })
      
      return false
    }
    
    return true
  }
  
  // Create hero slider
  const createHeroSlider = async (formData: HeroSliderFormData) => {
    if (!validateForm(formData)) return
    
    try {
      isSaving.value = true
      error.value = null
      
      // Create the slider
      await trpc.admin.heroSlider.create.mutate(formData)
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Hero slider created successfully',
        timer: 1500,
        showConfirmButton: false
      })
      
      // Redirect back to the hero sliders page
      router.push({
        path: '/hero-slider',
        query: { themeId: formData.themeId }
      })
      
    } catch (err: any) {
      console.error('Error creating hero slider:', err)
      error.value = err.message || 'Failed to create hero slider'
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to create hero slider'
      })
    } finally {
      isSaving.value = false
    }
  }
  
  // Update hero slider
  const updateHeroSlider = async (formData: HeroSliderFormData) => {
    if (!validateForm(formData) || !formData.id) return
    
    try {
      isSaving.value = true
      error.value = null
      
      // Extract data to match API structure
      const updateData = {
        id: formData.id,
        data: {
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          buttonText: formData.buttonText,
          buttonLink: formData.buttonLink,
          order: formData.order,
          isActive: formData.isActive,
          themeId: formData.themeId
        }
      }
      
      // Update the slider
      await trpc.admin.heroSlider.update.mutate(updateData)
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Hero slider updated successfully',
        timer: 1500,
        showConfirmButton: false
      })
      
      // Redirect back to the hero sliders page
      router.push({
        path: '/hero-slider',
        query: { themeId: formData.themeId }
      })
      
    } catch (err: any) {
      console.error('Error updating hero slider:', err)
      error.value = err.message || 'Failed to update hero slider'
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to update hero slider'
      })
    } finally {
      isSaving.value = false
    }
  }
  
  // Cancel and go back
  const cancelAndGoBack = () => {
    router.back()
  }
  
  // Reset image
  const resetImage = (formData: HeroSliderFormData) => {
    imagePreview.value = null
    formData.imageUrl = ''
  }
  
  return {
    // State
    isLoading,
    isFetching,
    isSaving,
    error,
    themes,
    isDragging,
    imagePreview,
    
    // Methods
    fetchThemes,
    fetchHeroSlider,
    handleImageUpload,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    processUpload,
    createHeroSlider,
    updateHeroSlider,
    cancelAndGoBack,
    resetImage
  }
} 