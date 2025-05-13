import { ref } from 'vue'
import { useNuxtApp } from '#app'

export function useHeroSlider() {
  const { $trpc } = useNuxtApp()
  const sliders = ref([])
  const themes = ref([])
  const loading = ref(false)

  async function fetchThemes() {
    loading.value = true
    try {
      const res = await $trpc.admin.theme.getAll.query()
      themes.value = res
    } finally {
      loading.value = false
    }
  }

  async function fetchSliders(themeId: number) {
    loading.value = true
    try {
      const res = await $trpc.admin.heroSlider.getAll.query({ themeId })
      sliders.value = res
    } finally {
      loading.value = false
    }
  }

  async function createSlider(data: any) {
    loading.value = true
    try {
      const res = await $trpc.admin.heroSlider.create.mutate(data)
      await fetchSliders(data.themeId)
      return res
    } finally {
      loading.value = false
    }
  }

  async function updateSlider(id: number, data: any) {
    loading.value = true
    try {
      const res = await $trpc.admin.heroSlider.update.mutate({ id, data })
      await fetchSliders(data.themeId)
      return res
    } finally {
      loading.value = false
    }
  }

  async function deleteSlider(id: number, themeId: number) {
    loading.value = true
    try {
      await $trpc.admin.heroSlider.delete.mutate(id)
      await fetchSliders(themeId)
    } finally {
      loading.value = false
    }
  }

  async function reorderSliders(orderList: any[], themeId: number) {
    loading.value = true
    try {
      await $trpc.admin.heroSlider.reorder.mutate(orderList)
      await fetchSliders(themeId)
    } finally {
      loading.value = false
    }
  }

  async function uploadImage(file: File) {
    // Gọi API upload-image.post.ts
    const formData = new FormData()
    formData.append('file', file)
    // TODO: lấy presignedUrl, key, uploadId, url từ API backend nếu cần
    // Giả sử đã có API upload-image
    const res = await fetch('/api/admin-upload/upload-image', {
      method: 'POST',
      body: formData
    })
    if (!res.ok) throw new Error('Upload failed')
    return await res.json()
  }

  return {
    sliders,
    themes,
    loading,
    fetchThemes,
    fetchSliders,
    createSlider,
    updateSlider,
    deleteSlider,
    reorderSliders,
    uploadImage
  }
} 