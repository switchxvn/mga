<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { XCircleIcon } from 'lucide-vue-next';

const props = defineProps<{
  specification: {
    id?: number;
    translations: {
      locale: string;
      name: string;
      value: string;
    }[];
  };
}>();

const emit = defineEmits<{
  (e: 'update:specification', value: typeof props.specification): void;
  (e: 'remove'): void;
}>();

const { locales, currentLocale } = useLocalization();

const defaultTranslation = computed(() => 
  props.specification.translations.find(t => t.locale === currentLocale.value) || props.specification.translations[0]
);

const errors = ref<Record<string, string>>({});

function updateTranslation(locale: string, field: string, value: string) {
  const translations = props.specification.translations.map(t => 
    t.locale === locale ? { ...t, [field]: value } : t
  );
  emit('update:specification', { ...props.specification, translations });
}

function validate() {
  errors.value = {};
  
  if (!defaultTranslation.value.name) {
    errors.value.name = 'Specification name is required';
  }
  
  if (!defaultTranslation.value.value) {
    errors.value.value = 'Specification value is required';
  }

  return Object.keys(errors.value).length === 0;
}

defineExpose({ validate });
</script>

<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div class="px-4 py-6 sm:p-8">
      <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <!-- Specification Name -->
        <div class="sm:col-span-3">
          <label for="specificationName" class="block text-sm font-medium leading-6 text-gray-900">
            Name
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="text"
                id="specificationName"
                :value="defaultTranslation.name"
                @input="updateTranslation(defaultTranslation.locale, 'name', ($event.target as HTMLInputElement).value)"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.name }"
              />
            </div>
            <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
          </div>
        </div>

        <!-- Specification Value -->
        <div class="sm:col-span-3">
          <label for="specificationValue" class="block text-sm font-medium leading-6 text-gray-900">
            Value
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="text"
                id="specificationValue"
                :value="defaultTranslation.value"
                @input="updateTranslation(defaultTranslation.locale, 'value', ($event.target as HTMLInputElement).value)"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.value }"
              />
            </div>
            <p v-if="errors.value" class="mt-2 text-sm text-red-600">{{ errors.value }}</p>
          </div>
        </div>

        <!-- Translations -->
        <div class="col-span-full" v-if="locales.length > 1">
          <div class="mt-6 space-y-8">
            <div v-for="locale in locales" :key="locale" v-show="locale !== currentLocale">
              <h4 class="text-sm font-medium text-gray-900">{{ locale.toUpperCase() }}</h4>
              
              <div class="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <!-- Name Translation -->
                <div>
                  <label :for="'specificationName-' + locale" class="block text-sm font-medium leading-6 text-gray-900">
                    Name
                  </label>
                  <div class="mt-2">
                    <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                      <input
                        type="text"
                        :id="'specificationName-' + locale"
                        :value="specification.translations.find(t => t.locale === locale)?.name"
                        @input="updateTranslation(locale, 'name', ($event.target as HTMLInputElement).value)"
                        class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>

                <!-- Value Translation -->
                <div>
                  <label :for="'specificationValue-' + locale" class="block text-sm font-medium leading-6 text-gray-900">
                    Value
                  </label>
                  <div class="mt-2">
                    <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                      <input
                        type="text"
                        :id="'specificationValue-' + locale"
                        :value="specification.translations.find(t => t.locale === locale)?.value"
                        @input="updateTranslation(locale, 'value', ($event.target as HTMLInputElement).value)"
                        class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
      <button
        type="button"
        class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
        @click="emit('remove')"
      >
        <XCircleIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        Remove Specification
      </button>
    </div>
  </div>
</template> 