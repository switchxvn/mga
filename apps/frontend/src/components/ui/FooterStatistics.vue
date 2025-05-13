<script setup lang="ts">
import { onMounted, ref, computed, FunctionalComponent } from 'vue';
import { useLocalization } from '~/composables/useLocalization';
import { v4 as uuidv4 } from 'uuid';
import { client } from '~/utils/trpc';
// Import các component icon từ lucide-vue-next
import { Eye, CalendarDays, Users, UserCircle, Clock, LucideProps } from 'lucide-vue-next';

interface Statistic {
  id: number;
  key: string;
  value: string;
  value_number: number;
  display_name: string;
  icon: string;
  description: string;
  translations?: Array<{
    locale: string;
    display_name: string;
    description: string;
  }>;
}

interface StyleSettings {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  valueColor: string;
  titleColor: string;
  borderRadius: string;
  padding: string;
  iconSize: string;
  fontSize: string;
  valueFontSize: string;
  titleFontSize: string;
  gap: string;
}

type IconComponentMap = {
  [key: string]: FunctionalComponent<LucideProps>;
};

const { locale } = useLocalization();
const currentLocale = ref(locale.value);
const statistics = ref<Statistic[]>([]);
const settings = ref<{
  is_enabled: boolean;
  display_in_footer: boolean;
  display_items: string[];
  style_settings: StyleSettings;
} | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const sessionId = ref<string>('');

const statisticsStyles = computed(() => {
  if (!settings.value || !settings.value.style_settings) {
    return {
      container: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '0.5rem',
        padding: '1rem',
        color: '#ffffff',
      },
      icon: {
        color: '#ffffff',
        fontSize: '1.5rem',
      },
      value: {
        color: '#ffffff',
        fontSize: '1.25rem',
      },
      title: {
        color: '#ffffff',
        fontSize: '0.75rem',
      },
      gap: '0.5rem',
    };
  }

  const styles = settings.value.style_settings;
  return {
    container: {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      padding: styles.padding,
      color: styles.textColor,
    },
    icon: {
      color: styles.iconColor,
      fontSize: styles.iconSize,
    },
    value: {
      color: styles.valueColor,
      fontSize: styles.valueFontSize,
    },
    title: {
      color: styles.titleColor,
      fontSize: styles.titleFontSize,
    },
    gap: styles.gap,
  };
});

// Map icon name từ DB sang component tương ứng
const getIconComponent = (iconName: string) => {
  const iconMap: IconComponentMap = {
    'Eye': Eye,
    'CalendarDays': CalendarDays,
    'Users': Users,
    'UserCircle': UserCircle,
    'Clock': Clock,
  };
  
  return iconMap[iconName] || null;
};

// Lấy hoặc tạo session ID
const getOrCreateSessionId = (): string => {
  let id = localStorage.getItem('site_stats_session_id');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('site_stats_session_id', id);
  }
  return id;
};

// Fetch dữ liệu thống kê
const fetchStatistics = async () => {
  try {
    isLoading.value = true;
    
    // Lấy cài đặt
    // @ts-ignore - Bỏ qua lỗi kiểm tra kiểu vì router chưa được setup
    settings.value = await client.siteStatistics.getSettings.query();
    
    // Nếu không bật, không làm gì cả
    if (!settings.value || !settings.value.is_enabled) {
      isLoading.value = false;
      return;
    }
    
    // Lấy thống kê
    // @ts-ignore - Bỏ qua lỗi kiểm tra kiểu vì router chưa được setup
    statistics.value = await client.siteStatistics.getVisibleStatistics.query({
      locale: currentLocale.value,
    });
    
    isLoading.value = false;
  } catch (err: any) {
    error.value = err?.message || 'Lỗi không xác định';
    isLoading.value = false;
  }
};

// Theo dõi người dùng truy cập
const trackVisit = async () => {
  try {
    if (!sessionId.value) {
      sessionId.value = getOrCreateSessionId();
    }
    
    // @ts-ignore - Bỏ qua lỗi kiểm tra kiểu vì router chưa được setup
    await client.siteStatistics.trackVisit.mutate({
      sessionId: sessionId.value,
    });
  } catch (err: any) {
    console.error('Error tracking visit:', err);
  }
};

// Cập nhật người dùng online
const updateOnlineStatus = async () => {
  try {
    if (!sessionId.value) {
      sessionId.value = getOrCreateSessionId();
    }
    
    // @ts-ignore - Bỏ qua lỗi kiểm tra kiểu vì router chưa được setup
    await client.siteStatistics.registerOnlineUser.mutate({
      sessionId: sessionId.value,
    });
  } catch (err: any) {
    console.error('Error updating online status:', err);
  }
};

// Lấy tên hiển thị dựa trên locale
const getDisplayName = (stat: Statistic): string => {
  if (stat.translations && stat.translations.length > 0) {
    const translation = stat.translations.find(t => t.locale === currentLocale.value);
    if (translation) {
      return translation.display_name;
    }
  }
  return stat.display_name;
};

// Format số cho dễ đọc
const formatNumber = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  if (value >= 1000000) {
    return value.toLocaleString() + 'M';
  }
  return value.toLocaleString();
};

onMounted(async () => {
  await fetchStatistics();
  await trackVisit();
  
  // Cập nhật online status mỗi 4 phút
  updateOnlineStatus();
  setInterval(updateOnlineStatus, 4 * 60 * 1000);
});
</script>

<template>
  <div v-if="settings && settings.is_enabled && settings.display_in_footer && statistics.length > 0" 
       class="statistics-container w-full overflow-hidden backdrop-blur-sm"
       :style="statisticsStyles.container">
    <div class="flex items-center justify-around flex-wrap">
      <div v-for="stat in statistics" 
           :key="stat.id" 
           class="statistic-item text-center p-3 flex flex-col items-center justify-center"
           :style="`gap: ${statisticsStyles.gap}`">
        <!-- Sử dụng Lucide icons -->
        <component 
          v-if="getIconComponent(stat.icon)" 
          :is="getIconComponent(stat.icon)" 
          class="statistic-icon" 
          :style="{
            color: statisticsStyles.icon.color,
            strokeWidth: 1.5,
            width: statisticsStyles.icon.fontSize,
            height: statisticsStyles.icon.fontSize
          }" 
        />
              
        <div class="statistic-value font-bold" :style="statisticsStyles.value">
          {{ formatNumber(stat.value_number) }}
        </div>
        
        <div class="statistic-title uppercase text-xs font-medium" :style="statisticsStyles.title">
          {{ getDisplayName(stat) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-container {
  transition: all 0.3s ease;
}

.statistic-item {
  transition: transform 0.3s ease;
}

.statistic-item:hover {
  transform: translateY(-3px);
}

.statistic-icon {
  transition: transform 0.3s ease;
}

.statistic-item:hover .statistic-icon {
  transform: scale(1.1);
}
</style> 