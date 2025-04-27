<template>
  <div>
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium">Thông số kỹ thuật</h3>
      <button
        @click="addSpecification"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-9 px-4 py-2"
      >
        <PlusIcon class="h-4 w-4 mr-2" />
        Thêm thông số
      </button>
    </div>

    <div v-if="specifications.length === 0" class="py-8 text-center">
      <div class="rounded-full bg-slate-100 h-12 w-12 flex items-center justify-center mx-auto mb-4">
        <ListChecksIcon class="h-6 w-6 text-slate-400" />
      </div>
      <h3 class="text-sm font-medium text-slate-900 mb-1">Chưa có thông số nào</h3>
      <p class="text-sm text-slate-500">Sản phẩm chưa có thông số kỹ thuật nào. Nhấn "Thêm thông số" để bắt đầu.</p>
    </div>

    <div v-else class="space-y-4 mt-6">
      <div class="border rounded-md">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-5/12">Tên thông số</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-5/12">Giá trị</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/12">Vị trí</th>
              <th class="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right w-1/12">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="(spec, index) in specifications" :key="`new-${index}`" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <input
                  type="text"
                  v-model="spec.name"
                  class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  :placeholder="'VD: Kích thước màn hình'"
                />
              </td>
              <td class="px-4 py-3">
                <input
                  type="text"
                  v-model="spec.value"
                  class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  :placeholder="'VD: 6.1 inch'"
                />
              </td>
              <td class="px-4 py-3">
                <input
                  type="number"
                  v-model="spec.position"
                  class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  min="0"
                />
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  @click="deleteSpecification(index)"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-slate-200 hover:bg-slate-100 h-8 w-8 p-0"
                >
                  <TrashIcon class="h-4 w-4 text-red-500" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { PlusIcon, ListChecksIcon, TrashIcon } from 'lucide-vue-next';

interface Specification {
  name: string;
  value: string;
  position: number;
  isNew?: boolean;
}

const props = defineProps({
  modelValue: {
    type: Array as () => Specification[],
    default: () => []
  },
  selectedLanguage: {
    type: String,
    default: 'en'
  }
});

const emit = defineEmits(['update:modelValue']);

const specifications = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Thêm một thông số mới
const addSpecification = () => {
  specifications.value = [
    ...specifications.value,
    {
      name: '',
      value: '',
      position: specifications.value.length,
      isNew: true
    }
  ];
};

// Xóa một thông số
const deleteSpecification = (index: number) => {
  const newSpecs = [...specifications.value];
  newSpecs.splice(index, 1);
  
  // Cập nhật lại vị trí
  newSpecs.forEach((spec, i) => {
    spec.position = i;
  });
  
  specifications.value = newSpecs;
};

// Theo dõi khi ngôn ngữ thay đổi
watch(() => props.selectedLanguage, () => {
  // Nếu cần thiết, có thể thêm logic xử lý khi ngôn ngữ thay đổi
  // Ví dụ: thay đổi placeholder theo ngôn ngữ
}, { immediate: true });
</script> 