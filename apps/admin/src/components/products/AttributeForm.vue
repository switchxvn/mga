<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocalization } from '../../composables/useLocalization';
import { PlusCircleIcon, XCircleIcon } from 'lucide-vue-next';

const props = defineProps<{
  attribute: {
    id?: number;
    translations: {
      locale: string;
      name: string;
    }[];
    values: {
      id?: number;
      translations: {
        locale: string;
        value: string;
      }[];
    }[];
  };
}>();

const emit = defineEmits<{
  (e: 'update:attribute', value: typeof props.attribute): void;
  (e: 'remove'): void;
}>();

const { locales, currentLocale } = useLocalization();

const defaultTranslation = computed(() => 
  props.attribute.translations.find(t => t.locale === currentLocale.value) || props.attribute.translations[0]
);

const errors = ref<Record<string, string>>({});

function updateAttribute(field: string, value: any) {
  emit('update:attribute', { ...props.attribute, [field]: value });
}

function updateTranslation(locale: string, field: string, value: string) {
  const translations = props.attribute.translations.map(t => 
    t.locale === locale ? { ...t, [field]: value } : t
  );
  emit('update:attribute', { ...props.attribute, translations });
}

function updateValueTranslation(valueIndex: number, locale: string, value: string) {
  const values = props.attribute.values.map((v, index) => {
    if (index !== valueIndex) return v;
    const translations = v.translations.map(t => 
      t.locale === locale ? { ...t, value } : t
    );
    return { ...v, translations };
  });
  emit('update:attribute', { ...props.attribute, values });
}

function addValue() {
  const values = [
    ...props.attribute.values,
    {
      translations: locales.value.map(locale => ({
        locale,
        value: ''
      }))
    }
  ];
  emit('update:attribute', { ...props.attribute, values });
}

function removeValue(index: number) {
  const values = props.attribute.values.filter((_, i) => i !== index);
  emit('update:attribute', { ...props.attribute, values });
}

function validate() {
  errors.value = {};
  
  if (!defaultTranslation.value.name) {
    errors.value.name = 'Attribute name is required';
  }
  
  if (props.attribute.values.length === 0) {
    errors.value.values = 'At least one value is required';
  }

  const hasEmptyValues = props.attribute.values.some(v => 
    !v.translations.find(t => t.locale === currentLocale.value)?.value
  );

  if (hasEmptyValues) {
    errors.value.values = 'All values must have a name';
  }

  return Object.keys(errors.value).length === 0;
}

defineExpose({ validate });
</script>

<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div class="px-4 py-6 sm:p-8">
      <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <!-- Attribute Name -->
        <div class="sm:col-span-4">
          <label for="attributeName" class="block text-sm font-medium leading-6 text-gray-900">
            Attribute Name
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-2">
            <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
              <input
                type="text"
                id="attributeName"
                :value="defaultTranslation.name"
                @input="updateTranslation(defaultTranslation.locale, 'name', ($event.target as HTMLInputElement).value)"
                class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                :class="{ 'border-red-500': errors.name }"
              />
            </div>
            <p v-if="errors.name" class="mt-2 text-sm text-red-600">{{ errors.name }}</p>
          </div>
        </div>

        <!-- Attribute Values -->
        <div class="col-span-full">
          <label class="block text-sm font-medium leading-6 text-gray-900">
            Values
            <span class="text-red-500">*</span>
          </label>
          <p v-if="errors.values" class="mt-2 text-sm text-red-600">{{ errors.values }}</p>
          
          <div class="mt-4 space-y-4">
            <div v-for="(value, valueIndex) in attribute.values" :key="valueIndex" class="flex items-center gap-x-4">
              <div class="flex-1">
                <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                  <input
                    type="text"
                    :value="value.translations.find(t => t.locale === currentLocale)?.value"
                    @input="updateValueTranslation(valueIndex, currentLocale, ($event.target as HTMLInputElement).value)"
                    class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    :placeholder="`Value ${valueIndex + 1}`"
                  />
                </div>
              </div>
              <button
                type="button"
                class="rounded-full p-1 text-red-600 hover:bg-red-50"
                @click="removeValue(valueIndex)"
              >
                <XCircleIcon class="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              class="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="addValue"
            >
              <PlusCircleIcon class="mx-auto h-6 w-6 text-gray-400" />
              <span class="mt-2 block text-sm font-semibold text-gray-900">Add value</span>
            </button>
          </div>
        </div>

        <!-- Translations -->
        <div class="col-span-full" v-if="locales.length > 1">
          <div class="mt-6 space-y-8">
            <div v-for="locale in locales" :key="locale" v-show="locale !== currentLocale">
              <h4 class="text-sm font-medium text-gray-900">{{ locale.toUpperCase() }}</h4>
              
              <!-- Attribute Name Translation -->
              <div class="mt-2">
                <label :for="'attributeName-' + locale" class="block text-sm font-medium leading-6 text-gray-900">
                  Name
                </label>
                <div class="mt-2">
                  <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                    <input
                      type="text"
                      :id="'attributeName-' + locale"
                      :value="attribute.translations.find(t => t.locale === locale)?.name"
                      @input="updateTranslation(locale, 'name', ($event.target as HTMLInputElement).value)"
                      class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>

              <!-- Value Translations -->
              <div class="mt-4 space-y-4">
                <div v-for="(value, valueIndex) in attribute.values" :key="valueIndex">
                  <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600">
                    <input
                      type="text"
                      :value="value.translations.find(t => t.locale === locale)?.value"
                      @input="updateValueTranslation(valueIndex, locale, ($event.target as HTMLInputElement).value)"
                      class="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      :placeholder="`Value ${valueIndex + 1}`"
                    />
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
        Remove Attribute
      </button>
    </div>
  </div>
</template> 