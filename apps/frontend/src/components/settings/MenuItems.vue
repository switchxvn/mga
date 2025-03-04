<template>
  <div class="space-y-4">
    <div v-if="error" class="text-red-500">
      {{ error }}
    </div>

    <div v-if="isLoading" class="text-gray-500">
      Đang tải...
    </div>

    <div v-else>
      <!-- Menu Items List -->
      <div class="space-y-2">
        <div v-for="item in menuItems" :key="item.id" class="p-4 border rounded">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-medium">{{ item.label }}</h3>
              <p class="text-sm text-gray-500">{{ item.href }}</p>
            </div>
            <div class="space-x-2">
              <button
                @click="handleEdit(item)"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Sửa
              </button>
              <button
                @click="handleDelete(item.id)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Form -->
      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Label</label>
          <input
            v-model="form.label"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">URL</label>
          <input
            v-model="form.href"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Order</label>
          <input
            v-model.number="form.order"
            type="number"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div class="flex items-center">
          <input
            v-model="form.hasMegaMenu"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600"
          />
          <label class="ml-2 text-sm text-gray-700">Has Mega Menu</label>
        </div>

        <div class="flex items-center">
          <input
            v-model="form.isActive"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600"
          />
          <label class="ml-2 text-sm text-gray-700">Is Active</label>
        </div>

        <button
          type="submit"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="isLoading"
        >
          {{ editingId ? 'Cập nhật' : 'Thêm mới' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMenuItems } from '../../composables/useMenuItems';
import type { MenuItem } from '@ew/shared';

const { menuItems, isLoading, error, fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();

const editingId = ref<number | null>(null);
const form = ref({
  label: '',
  href: '',
  order: 0,
  hasMegaMenu: false,
  isActive: true,
  parentId: null as number | null,
});

onMounted(() => {
  fetchMenuItems();
});

const resetForm = () => {
  form.value = {
    label: '',
    href: '',
    order: 0,
    hasMegaMenu: false,
    isActive: true,
    parentId: null,
  };
  editingId.value = null;
};

const handleEdit = (item: MenuItem) => {
  editingId.value = item.id;
  form.value = {
    label: item.label,
    href: item.href,
    order: item.order,
    hasMegaMenu: item.hasMegaMenu,
    isActive: item.isActive,
    parentId: item.parentId,
  };
};

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await updateMenuItem(editingId.value, form.value);
    } else {
      await createMenuItem(form.value);
    }
    resetForm();
  } catch (err) {
    console.error('Error submitting form:', err);
  }
};

const handleDelete = async (id: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
    try {
      await deleteMenuItem(id);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  }
};
</script> 