<template>
  <div>
    <!-- Input field with button -->
    <UFormGroup :label="label" :error="error">
      <div class="flex gap-2">
        <UInput
          :value="modelValue"
          :placeholder="placeholder"
          :error="!!error"
          class="flex-1"
          @input="onModelValueUpdate"
        />
        <UButton
          type="button"
          variant="soft"
          color="gray"
          @click="showIconSelector = true"
          class="flex-shrink-0"
          :title="buttonTitle"
        >
          <SearchIcon class="w-4 h-4" />
        </UButton>
      </div>
      <div v-if="modelValue" class="mt-2 flex items-center gap-2">
        <span class="text-sm text-gray-600">{{ selectedLabel }}:</span>
        <div class="flex items-center justify-center px-2 py-1 bg-gray-100 rounded-md">
          <component 
            :is="getSelectedIcon()" 
            class="w-4 h-4 mr-1 text-gray-600"
          />
          <span class="text-sm text-gray-600">{{ modelValue }}</span>
        </div>
      </div>
    </UFormGroup>

    <!-- Icon Selector Modal -->
    <UModal v-model="showIconSelector" :ui="{ width: 'xl:max-w-6xl lg:max-w-4xl md:max-w-2xl' }">
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">{{ modalTitle }}</h3>
          <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="showIconSelector = false" />
        </div>
        
        <div class="mb-4">
          <UInput v-model="iconSearch" icon="i-heroicons-magnifying-glass" placeholder="Search icons..." />
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 max-h-[60vh] overflow-y-auto">
          <button
            v-for="(icon, name) in filteredIcons"
            :key="name"
            type="button"
            class="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-md transition-colors"
            @click="handleSelectIcon(name)"
          >
            <component :is="icon" class="w-6 h-6 mb-1" />
            <span class="text-xs text-center text-gray-600 truncate max-w-full">{{ name }}</span>
          </button>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SearchIcon,
  HelpCircleIcon,
  FileTextIcon,
  SettingsIcon,
  CheckIcon,
  XIcon,
  ChevronDownIcon,
  SaveIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  MailIcon,
  MessageSquareIcon,
  HeartIcon,
  StarIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  ImageIcon,
  VideoIcon,
  MusicIcon,
  BookIcon,
  BookmarkIcon,
  FlagIcon,
  BellIcon,
  AlertCircleIcon,
  InfoIcon,
  LinkIcon,
  ExternalLinkIcon,
  UploadIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
  EditIcon,
  ScissorsIcon,
  CopyIcon,
  LayersIcon,
  FolderIcon,
  PrinterIcon,
  SmartphoneIcon,
  TabletIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  CloudIcon,
  UmbrellaIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  KeyIcon,
  WifiIcon,
  WifiOffIcon,
  BatteryIcon,
  BluetoothIcon,
  PowerIcon,
  MenuIcon,
  RefreshCwIcon,
  RotateCwIcon,
  RepeatIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
    required: false
  },
  label: {
    type: String,
    default: 'Icon'
  },
  error: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select Lucide icon'
  },
  buttonTitle: {
    type: String,
    default: 'Select icon'
  },
  modalTitle: {
    type: String,
    default: 'Select Icon'
  },
  selectedLabel: {
    type: String,
    default: 'Selected icon'
  }
})

const emit = defineEmits(['update:modelValue'])

const showIconSelector = ref(false)
const iconSearch = ref('')

// Danh sách icon phổ biến với các icon chính xác
const icons = {
  'home': HomeIcon,
  'settings': SettingsIcon,
  'user': UserIcon,
  'file': FileTextIcon,
  'search': SearchIcon,
  'calendar': CalendarIcon,
  'mail': MailIcon,
  'message': MessageSquareIcon,
  'heart': HeartIcon,
  'star': StarIcon,
  'check': CheckIcon,
  'x': XIcon,
  'plus': PlusIcon,
  'minus': MinusIcon,
  'shopping-cart': ShoppingCartIcon,
  'credit-card': CreditCardIcon,
  'phone': PhoneIcon,
  'map-pin': MapPinIcon,
  'camera': CameraIcon,
  'image': ImageIcon,
  'video': VideoIcon,
  'music': MusicIcon,
  'book': BookIcon,
  'bookmark': BookmarkIcon,
  'flag': FlagIcon,
  'bell': BellIcon,
  'alert-circle': AlertCircleIcon,
  'info': InfoIcon,
  'help-circle': HelpCircleIcon,
  'link': LinkIcon,
  'external-link': ExternalLinkIcon,
  'upload': UploadIcon,
  'download': DownloadIcon,
  'share': ShareIcon,
  'trash': TrashIcon,
  'edit': EditIcon,
  'scissors': ScissorsIcon,
  'copy': CopyIcon,
  'layers': LayersIcon,
  'folder': FolderIcon,
  'file-text': FileTextIcon,
  'save': SaveIcon,
  'printer': PrinterIcon,
  'smartphone': SmartphoneIcon,
  'tablet': TabletIcon,
  'monitor': MonitorIcon,
  'moon': MoonIcon,
  'sun': SunIcon,
  'cloud': CloudIcon,
  'umbrella': UmbrellaIcon,
  'eye': EyeIcon,
  'eye-off': EyeOffIcon,
  'lock': LockIcon,
  'unlock': UnlockIcon,
  'key': KeyIcon,
  'wifi': WifiIcon,
  'wifi-off': WifiOffIcon,
  'battery': BatteryIcon,
  'bluetooth': BluetoothIcon,
  'power': PowerIcon,
  'menu': MenuIcon,
  'refresh': RefreshCwIcon,
  'rotate': RotateCwIcon,
  'repeat': RepeatIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,
  'arrow-up': ArrowUpIcon,
  'arrow-down': ArrowDownIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'zoom-in': ZoomInIcon,
  'zoom-out': ZoomOutIcon
}

// Filter icons based on search input
const filteredIcons = computed(() => {
  if (!iconSearch.value) return icons;
  
  return Object.entries(icons).reduce((filtered, [name, icon]) => {
    if (name.includes(iconSearch.value.toLowerCase())) {
      filtered[name] = icon;
    }
    return filtered;
  }, {} as Record<string, typeof HelpCircleIcon>);
})

// Handle icon selection
const handleSelectIcon = (iconName: string) => {
  emit('update:modelValue', iconName)
  showIconSelector.value = false
}

// Handle input field update
const onModelValueUpdate = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

// Trong script setup, thêm hàm getSelectedIcon
const getSelectedIcon = () => {
  if (!props.modelValue) return HelpCircleIcon;
  return icons[props.modelValue as keyof typeof icons] || HelpCircleIcon;
};
</script> 