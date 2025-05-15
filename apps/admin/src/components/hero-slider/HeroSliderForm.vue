<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-2">
      <label>{{ t('hero_slider.title') }}</label>
      <input v-model="form.title" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>{{ t('hero_slider.description') }}</label>
      <textarea v-model="form.description" class="textarea textarea-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>{{ t('hero_slider.imageUrl') }}</label>
      <input v-model="form.imageUrl" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>{{ t('hero_slider.buttonText') }}</label>
      <input v-model="form.buttonText" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>{{ t('hero_slider.buttonLink') }}</label>
      <input v-model="form.buttonLink" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>{{ t('hero_slider.order') }}</label>
      <input v-model.number="form.order" type="number" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>{{ t('hero_slider.active') }}</label>
      <input type="checkbox" v-model="form.isActive" />
    </div>
    <div class="flex gap-2">
      <button type="submit" class="btn btn-primary">{{ t('actions.save') }}</button>
      <button type="button" class="btn" @click="$emit('cancel')">{{ t('actions.cancel') }}</button>
    </div>
  </form>
</template>
<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useLocalization } from '@/composables/useLocalization'

const { t } = useLocalization()
const props = defineProps<{ slider?: any }>()
const emit = defineEmits(['save', 'cancel'])
const form = reactive({
  title: '',
  description: '',
  imageUrl: '',
  buttonText: '',
  buttonLink: '',
  isActive: true,
  order: 0
})
watch(() => props.slider, (val) => {
  if (val) Object.assign(form, val)
}, { immediate: true })
function onSubmit() {
  emit('save', { ...form })
}
</script> 