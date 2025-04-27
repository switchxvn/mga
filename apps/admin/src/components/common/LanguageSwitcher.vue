<template>
  <div class="language-switcher relative">
    <button 
      @click.stop="isLanguageOpen = !isLanguageOpen"
      class="inline-flex items-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
    >
      <div class="w-5 h-5 flex items-center justify-center rounded-sm overflow-hidden bg-primary text-white text-xs font-medium">
        <template v-if="modelValue && currentLanguage">
          <img 
            v-if="!flagLoadError"
            :src="getFlagPath(modelValue)"
            :alt="`${currentLanguage?.nativeName} flag`"
            class="w-5 h-5 object-cover"
            @error="handleFlagError"
            @load="flagLoadError = false"
          />
          <template v-else>{{ modelValue.toUpperCase().slice(0, 2) }}</template>
        </template>
        <template v-else>--</template>
      </div>
      <span>{{ currentLanguage?.nativeName || 'Select Language' }}</span>
      <ChevronDownIcon 
        class="h-4 w-4 transition-transform"
        :class="{ 'rotate-180': isLanguageOpen }"
      />
    </button>

    <!-- Dropdown menu -->
    <div 
      v-if="isLanguageOpen" 
      class="absolute z-50 mt-1 min-w-[240px] rounded-md shadow-lg bg-white ring-1 ring-black/5 focus:outline-none"
    >
      <div v-if="loadingLanguages" class="py-4 px-4 text-center">
        <div class="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
        <span class="mt-2 text-sm text-slate-500 block">Loading languages...</span>
      </div>
      <div v-else-if="languages.length === 0" class="py-4 px-4 text-center text-sm text-slate-500">
        No languages available
      </div>
      <div v-else class="py-1">
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="selectLanguage(lang.code)"
          class="flex items-center w-full h-10 px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
          :class="{ 'bg-slate-50': modelValue === lang.code }"
        >
          <div class="w-5 h-5 flex-shrink-0 flex items-center justify-center mr-2 rounded-sm overflow-hidden bg-primary text-white text-xs font-medium">
            <img 
              :src="getFlagPath(lang.code)"
              :alt="`${lang.nativeName} flag`"
              class="w-5 h-5 object-cover"
              :key="lang.code"
              @error="(e) => handleListFlagError(e, lang.code)"
            />
            <template v-if="flagErrors[lang.code]">{{ lang.code.toUpperCase().slice(0, 2) }}</template>
          </div>
          <span class="truncate">{{ lang.nativeName }}</span>
          <span v-if="lang.code === defaultLanguage" class="ml-1 text-xs text-slate-500 flex-shrink-0">(Default)</span>
          <CheckIcon
            v-if="modelValue === lang.code"
            class="h-4 w-4 ml-auto flex-shrink-0 text-primary"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next';
import { useTrpc } from '../../composables/useTrpc';

interface Language {
  id: number;
  name: string;
  code: string;
  nativeName: string;
  flagCode: string;
  isDefault: boolean;
  isActive: boolean;
}

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'language-changed']);

const router = useRouter();
const route = useRoute();
const trpc = useTrpc();

const languages = ref<Language[]>([]);
const defaultLanguage = ref('');
const isLanguageOpen = ref(false);
const loadingLanguages = ref(true);

// Biến để theo dõi lỗi tải hình
const flagLoadError = ref(false);
const flagErrors = ref<Record<string, boolean>>({});

// Lấy ngôn ngữ hiện tại
const currentLanguage = computed(() => {
  return languages.value.find(l => l.code === props.modelValue);
});

// Hàm lấy đường dẫn đúng cho hình cờ
const getFlagPath = (code: string) => {
  const language = languages.value.find(l => l.code === code);
  if (!language) return '';
  
  // Đảm bảo flagCode là chữ thường
  const flagCode = language.flagCode.toLowerCase();
  
  // Kiểm tra xem có dùng đuôi .svg hay không
  if (flagCode.endsWith('.svg')) {
    return `/images/flag/${flagCode}`;
  }
  
  return `/images/flag/${flagCode}.svg`;
};

// Xử lý click outside để đóng dropdown
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.language-switcher')) {
    isLanguageOpen.value = false;
  }
};

// Hàm chọn ngôn ngữ
const selectLanguage = (code: string) => {
  // Đóng dropdown
  isLanguageOpen.value = false;
  
  // Emit sự kiện cập nhật modelValue
  emit('update:modelValue', code);
  
  // Emit sự kiện đã đổi ngôn ngữ
  emit('language-changed', code);
  
  // Cập nhật URL parameter
  updateUrlParameter(code);
};

// Cập nhật URL parameter
const updateUrlParameter = (code: string) => {
  router.replace({ 
    query: { 
      ...route.query,
      locale: code 
    }
  });
};

// Xử lý khi hình ảnh flag bị lỗi
const handleFlagError = () => {
  flagLoadError.value = true;
};

// Xử lý lỗi hình trong danh sách
const handleListFlagError = (event: Event, code: string) => {
  flagErrors.value[code] = true;
  // Ẩn ảnh lỗi
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};

// Kiểm tra xem hình có tồn tại không
const preloadImage = (src: string, code: string) => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      flagErrors.value[code] = false;
      resolve();
    };
    img.onerror = () => {
      flagErrors.value[code] = true;
      resolve();
    };
    img.src = src;
  });
};

// Load languages và set default language
const loadLanguages = async () => {
  try {
    loadingLanguages.value = true;
    
    const [langs, defaultLang] = await Promise.all([
      trpc.admin.languages.getLanguages.query(),
      trpc.admin.languages.getDefaultLanguage.query()
    ]);
    
    languages.value = langs;
    defaultLanguage.value = defaultLang?.code || '';
    
    // Nếu chưa có modelValue, lấy từ URL hoặc default
    if (!props.modelValue) {
      const localeFromUrl = route.query.locale as string;
      
      if (localeFromUrl && languages.value.some(lang => lang.code === localeFromUrl)) {
        emit('update:modelValue', localeFromUrl);
      } else {
        emit('update:modelValue', defaultLang?.code || '');
      }
    }
    
    // Preload hình cờ
    if (process.client) {
      // Chờ một chút để đảm bảo DOM đã cập nhật
      setTimeout(async () => {
        for (const lang of languages.value) {
          await preloadImage(getFlagPath(lang.code), lang.code);
        }
      }, 100);
    }
  } catch (error) {
    console.error('Failed to fetch languages:', error);
  } finally {
    loadingLanguages.value = false;
  }
};

onMounted(() => {
  loadLanguages();
  
  // Thêm event listener cho click outside
  if (process.client) {
    document.addEventListener('click', handleClickOutside);
  }
  
  // Kiểm tra URL parameter khi component mounted
  const localeFromUrl = route.query.locale as string;
  if (localeFromUrl && localeFromUrl !== props.modelValue) {
    emit('update:modelValue', localeFromUrl);
  }
});

onBeforeUnmount(() => {
  // Xóa event listener khi component unmounted
  if (process.client) {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
  width: auto;
}

/* Dropdown menu */
.absolute {
  z-index: 50 !important;
}
</style> 