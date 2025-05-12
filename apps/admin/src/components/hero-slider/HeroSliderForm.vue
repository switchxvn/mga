<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-2">
      <label>Title</label>
      <input v-model="form.title" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>Description</label>
      <textarea v-model="form.description" class="textarea textarea-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>Image URL</label>
      <input v-model="form.imageUrl" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>Button Text</label>
      <input v-model="form.buttonText" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>Button Link</label>
      <input v-model="form.buttonLink" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>Order</label>
      <input v-model.number="form.order" type="number" class="input input-bordered w-full" />
    </div>
    <div class="mb-2">
      <label>Active</label>
      <input type="checkbox" v-model="form.isActive" />
    </div>
    <div class="flex gap-2">
      <button type="submit" class="btn btn-primary">Save</button>
      <button type="button" class="btn" @click="$emit('cancel')">Cancel</button>
    </div>
  </form>
</template>
<script setup lang="ts">
import { reactive, watch, toRefs } from 'vue'
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