<template>
  <div>
    <h2>{{ t('hero_slider.manager') }}</h2>
    <ThemeSelector v-model="selectedThemeId" />
    <button class="btn btn-primary mb-2" @click="addSlider">{{ t('hero_slider.addSlider') }}</button>
    <Draggable v-model="sliders" @end="onOrderChange">
      <template #item="{element}">
        <HeroSliderItem :slider="element" @edit="editSlider" @delete="deleteSlider" />
      </template>
    </Draggable>
    <Dropzone @file-drop="onImageDrop" />
    <HeroSliderForm v-if="editingSlider" :slider="editingSlider" @save="saveSlider" @cancel="cancelEdit" />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHeroSlider } from '@/composables/useHeroSlider'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
const selectedThemeId = ref<number | null>(null)
const editingSlider = ref<any>(null)
const {
  sliders,
  fetchSliders,
  createSlider,
  updateSlider,
  deleteSlider: deleteSliderApi,
  reorderSliders,
  uploadImage
} = useHeroSlider()

watch(selectedThemeId, (val) => {
  if (val) fetchSliders(val)
}, { immediate: true })

function addSlider() {
  editingSlider.value = { title: '', description: '', imageUrl: '', buttonText: '', buttonLink: '', isActive: true, order: sliders.value.length, themeId: selectedThemeId.value }
}
function editSlider(slider: any) {
  editingSlider.value = { ...slider }
}
function deleteSlider(slider: any) {
  if (confirm(t('hero_slider.confirmDelete'))) {
    deleteSliderApi(slider.id, selectedThemeId.value as number)
  }
}
function saveSlider(data: any) {
  if (data.id) {
    updateSlider(data.id, data)
  } else {
    createSlider(data)
  }
  editingSlider.value = null
}
function cancelEdit() {
  editingSlider.value = null
}
async function onImageDrop(file: File) {
  try {
    const res = await uploadImage(file)
    if (editingSlider.value) editingSlider.value.imageUrl = res.url
  } catch (e) {
    alert('Upload ảnh thất bại')
  }
}
function onOrderChange() {
  if (!selectedThemeId.value) return
  const orderList = sliders.value.map((s: any, idx: number) => ({ id: s.id, order: idx }))
  reorderSliders(orderList, selectedThemeId.value as number)
}
</script> 