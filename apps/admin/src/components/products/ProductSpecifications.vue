<template>
  <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
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

    <div v-if="loading" class="py-8 flex items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
    </div>

    <div v-else-if="specifications.length === 0" class="py-8 text-center">
      <div class="rounded-full bg-slate-100 h-12 w-12 flex items-center justify-center mx-auto mb-4">
        <ListChecksIcon class="h-6 w-6 text-slate-400" />
      </div>
      <h3 class="text-sm font-medium text-slate-900 mb-1">Chưa có thông số nào</h3>
      <p class="text-sm text-slate-500">Sản phẩm chưa có thông số kỹ thuật nào. Nhấn "Thêm thông số" để bắt đầu.</p>
    </div>

    <div v-else class="space-y-4">
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
            <tr v-for="(spec, index) in specifications" :key="spec.id || `new-${index}`" class="hover:bg-slate-50">
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
                  @click="deleteSpecification(spec, index)"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-slate-200 hover:bg-slate-100 h-8 w-8 p-0"
                >
                  <TrashIcon class="h-4 w-4 text-red-500" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end space-x-2">
        <button
          @click="cancelChanges"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-9 px-4 py-2"
        >
          Hủy thay đổi
        </button>
        <button
          @click="saveChanges"
          :disabled="saving"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-9 px-4 py-2"
        >
          <SaveIcon v-if="!saving" class="h-4 w-4 mr-2" />
          <div v-else class="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
          {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTrpc } from '../../composables/useTrpc';
import { useToast } from '../../composables/useToast';
import { PlusIcon, ListChecksIcon, TrashIcon, SaveIcon } from 'lucide-vue-next';

interface Specification {
  id?: number;
  name: string;
  value: string;
  position: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

const props = defineProps({
  productId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:specifications']);

const specifications = ref<Specification[]>([]);
const loading = ref(false);
const saving = ref(false);
const originalSpecifications = ref<Specification[]>([]);

const route = useRoute();
const trpc = useTrpc();
const { success, error: showError, warning } = useToast();

// Lấy locale từ URL query parameter
const locale = computed(() => {
  return (route.query.locale as string) || 'en';
});

// Tải thông số kỹ thuật của sản phẩm
const loadSpecifications = async () => {
  try {
    loading.value = true;
    const data = await trpc.admin.products.getProductSpecifications.query({
      productId: props.productId,
      locale: locale.value
    });
    
    specifications.value = data.map(spec => ({
      id: spec.id,
      name: spec.name,
      value: spec.value,
      position: spec.position || 0
    }));
    
    // Lưu lại bản gốc để so sánh khi cần
    originalSpecifications.value = JSON.parse(JSON.stringify(specifications.value));
  } catch (error) {
    console.error('Failed to load specifications:', error);
    showError('Không thể tải thông số kỹ thuật sản phẩm');
  } finally {
    loading.value = false;
  }
};

// Theo dõi khi locale thay đổi từ URL
watch(() => locale.value, () => {
  loadSpecifications();
});

// Thêm một thông số mới
const addSpecification = () => {
  specifications.value.push({
    name: '',
    value: '',
    position: specifications.value.length,
    isNew: true
  });
};

// Xóa một thông số
const deleteSpecification = (spec: Specification, index: number) => {
  // Nếu là thông số mới thêm vào, xóa luôn
  if (spec.isNew) {
    specifications.value.splice(index, 1);
    return;
  }
  
  // Đánh dấu thông số cần xóa
  specifications.value[index].isDeleted = true;
  
  // Ẩn khỏi giao diện
  specifications.value = specifications.value.filter(s => !s.isDeleted);
};

// Lưu các thay đổi
const saveChanges = async () => {
  try {
    saving.value = true;
    
    // Validate dữ liệu trước khi lưu
    const invalidSpecs = specifications.value.filter(spec => !spec.name || !spec.value);
    if (invalidSpecs.length > 0) {
      warning('Vui lòng điền đầy đủ tên và giá trị cho tất cả thông số kỹ thuật');
      return;
    }
    
    // Xử lý từng thông số
    for (const spec of specifications.value) {
      if (spec.isNew) {
        // Thêm mới
        await trpc.admin.products.addProductSpecification.mutate({
          productId: props.productId,
          name: spec.name,
          value: spec.value,
          locale: locale.value,
          position: spec.position
        });
      } else {
        // Cập nhật
        await trpc.admin.products.updateProductSpecification.mutate({
          id: spec.id!,
          name: spec.name,
          value: spec.value,
          locale: locale.value,
          position: spec.position
        });
      }
    }
    
    // Xóa các thông số đã đánh dấu xóa
    const deletedSpecs = originalSpecifications.value.filter(
      orig => !specifications.value.some(spec => spec.id === orig.id)
    );
    
    for (const spec of deletedSpecs) {
      await trpc.admin.products.deleteProductSpecification.mutate({
        id: spec.id!
      });
    }
    
    success('Lưu thông số kỹ thuật thành công');
    
    // Tải lại dữ liệu sau khi lưu
    await loadSpecifications();
  } catch (error) {
    console.error('Failed to save specifications:', error);
    showError('Không thể lưu thông số kỹ thuật');
  } finally {
    saving.value = false;
  }
};

// Hủy các thay đổi
const cancelChanges = () => {
  specifications.value = JSON.parse(JSON.stringify(originalSpecifications.value));
};

// Tải dữ liệu khi component được tạo
onMounted(() => {
  loadSpecifications();
});
</script> 