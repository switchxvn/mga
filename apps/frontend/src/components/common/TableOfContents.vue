<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from "vue";
import { useLocalization } from "~/composables/useLocalization";

const props = defineProps<{
  contentSelector: string; // CSS selector cho phần nội dung chứa các thẻ h2
  title?: string; // Tiêu đề cho phần danh mục
  offset?: number; // Offset khi scroll (mặc định là 80px)
  collapsible?: boolean; // Có cho phép thu gọn không
  defaultCollapsed?: boolean; // Trạng thái thu gọn mặc định
}>();

const { t } = useLocalization();
const tableOfContents = ref<{ id: string; text: string; level: number }[]>([]);
const isCollapsed = ref(props.defaultCollapsed || false);
const isInitialized = ref(false);

// Hàm toggle collapse
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Hàm tạo ID từ text
const createIdFromText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/--+/g, "-") // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .trim();
};

// Hàm tạo danh mục từ nội dung
const generateTableOfContents = () => {
  if (typeof window === "undefined") return; // Kiểm tra nếu đang ở server-side

  // Đợi một chút để đảm bảo DOM đã được cập nhật
  setTimeout(() => {
    const contentElement = document.querySelector(props.contentSelector);
    if (!contentElement) {
      console.warn(`Element with selector "${props.contentSelector}" not found`);
      return;
    }

    // Tìm tất cả các thẻ h2 trong nội dung
    const headings = contentElement.querySelectorAll("h2");
    const toc: { id: string; text: string; level: number }[] = [];

    headings.forEach((heading, index) => {
      const text = heading.textContent || `Mục ${index + 1}`;
      const id = heading.id || createIdFromText(text);

      // Nếu heading chưa có id, thêm id vào
      if (!heading.id) {
        heading.id = id;
      }

      toc.push({
        id,
        text,
        level: 2, // h2 có level là 2
      });
    });

    tableOfContents.value = toc;
    isInitialized.value = true;
  }, 100);
};

// Theo dõi thay đổi của nội dung và cập nhật danh mục
const observeContentChanges = () => {
  if (typeof window === "undefined") return;

  const contentElement = document.querySelector(props.contentSelector);
  if (!contentElement) return;

  const observer = new MutationObserver(() => {
    generateTableOfContents();
  });

  observer.observe(contentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
};

// Hàm xử lý sự kiện tab-changed
const handleTabChanged = () => {
  // Đợi DOM cập nhật xong
  nextTick(() => {
    // Đợi thêm một chút để đảm bảo transition đã hoàn thành
    setTimeout(() => {
      generateTableOfContents();
    }, 200);
  });
};

// Hàm scroll đến heading
const scrollToHeading = (id: string) => {
  if (typeof window === "undefined") return;

  const element = document.getElementById(id);
  if (!element) return;

  const offset = props.offset || 80; // Mặc định offset là 80px

  // Tính toán vị trí scroll
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  // Scroll đến vị trí với hiệu ứng mượt
  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  // Thêm hash vào URL nhưng không scroll lại
  history.pushState(null, "", `#${id}`);
};

// Hàm xử lý transition
const startTransition = (el: HTMLElement) => {
  el.style.height = "auto";
  const height = el.scrollHeight;
  el.style.height = "0px";
  // Trigger a reflow
  el.offsetHeight;
  el.style.height = `${height}px`;
};

const endTransition = (el: HTMLElement) => {
  el.style.height = "";
};

// Khởi tạo danh mục khi component được mount
onMounted(() => {
  // Đợi DOM cập nhật xong
  nextTick(() => {
    generateTableOfContents();
    const observer = observeContentChanges();

    // Kiểm tra nếu có hash trong URL, scroll đến heading tương ứng
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        scrollToHeading(id);
      }, 500); // Đợi 500ms để đảm bảo nội dung đã được render
    }

    // Lắng nghe sự kiện tab-changed
    if (typeof window !== "undefined") {
      window.addEventListener("tab-changed", handleTabChanged);
    }

    // Cleanup khi component bị hủy
    onBeforeUnmount(() => {
      if (observer) {
        observer.disconnect();
      }

      if (typeof window !== "undefined") {
        window.removeEventListener("tab-changed", handleTabChanged);
      }
    });
  });
});

// Theo dõi thay đổi của selector
watch(
  () => props.contentSelector,
  () => {
    generateTableOfContents();
  }
);

// Tự động cập nhật lại khi component được hiển thị
onMounted(() => {
  // Đợi một chút để đảm bảo DOM đã được cập nhật
  setTimeout(() => {
    generateTableOfContents();
  }, 300);
});
</script>

<template>
  <div v-if="tableOfContents.length > 0" class="table-of-contents bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div
      class="table-of-contents__header"
      :class="{ 'cursor-pointer': props.collapsible }"
      @click="props.collapsible ? toggleCollapse() : undefined"
    >
      <h3 class="table-of-contents__title">
        {{ title || t("products.tableOfContents") || "Nội dung chính" }}
      </h3>
      <button
        v-if="props.collapsible"
        class="table-of-contents__toggle"
        type="button"
        @click.stop="toggleCollapse()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :class="{ 'rotate-180': isCollapsed }"
          class="h-5 w-5 transition-transform duration-200"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
    <transition
      name="collapse-transition"
      @enter="startTransition"
      @after-enter="endTransition"
      @before-leave="startTransition"
      @after-leave="endTransition"
    >
      <ul v-show="!isCollapsed" class="table-of-contents__list">
        <li
          v-for="(item, index) in tableOfContents"
          :key="index"
          class="table-of-contents__item"
          :class="`table-of-contents__item--level-${item.level}`"
        >
          <a
            :href="`#${item.id}`"
            class="table-of-contents__link"
            @click.prevent="scrollToHeading(item.id)"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </transition>
  </div>
  <div v-else-if="isInitialized" class="table-of-contents table-of-contents--empty bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div class="table-of-contents__header">
      <h3 class="table-of-contents__title">
        {{ title || t("products.tableOfContents") || "Nội dung chính" }}
      </h3>
    </div>
    <p class="table-of-contents__empty-message">
      {{ t("products.noTableOfContents") || "Không tìm thấy mục nào trong nội dung" }}
    </p>
  </div>
</template>

<style scoped>
.table-of-contents {
  margin: 0 0 1.5rem 0;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.dark .table-of-contents {
  background-color: #1f2937;
  border: none;
}

.table-of-contents__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.table-of-contents__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.dark .table-of-contents__title {
  color: #f9fafb;
}

.table-of-contents__toggle {
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .table-of-contents__toggle {
  color: #9ca3af;
}

.table-of-contents__list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
  transition: height 0.3s ease-in-out;
}

.collapse-transition-enter-active,
.collapse-transition-leave-active {
  transition: height 0.3s ease-in-out, opacity 0.3s ease;
  overflow: hidden;
}

.collapse-transition-enter-from,
.collapse-transition-leave-to {
  height: 0 !important;
  opacity: 0;
}

.table-of-contents__item {
  margin-bottom: 0.5rem;
  padding-left: 0;
}

.table-of-contents__item--level-2 {
  padding-left: 0;
}

.table-of-contents__item--level-3 {
  padding-left: 1rem;
}

.table-of-contents__link {
  display: inline-block;
  color: #4b5563;
  text-decoration: none;
  transition: color 0.2s;
  padding: 0.25rem 0;
  position: relative;
  cursor: pointer;
}

.table-of-contents__link:hover {
  color: #0ea5e9;
}

.dark .table-of-contents__link {
  color: #d1d5db;
}

.dark .table-of-contents__link:hover {
  color: #38bdf8;
}

.table-of-contents--empty {
  opacity: 0.8;
}

.table-of-contents__empty-message {
  color: #6b7280;
  font-style: italic;
  margin-top: 0;
}

.dark .table-of-contents__empty-message {
  color: #9ca3af;
}

@media (max-width: 640px) {
  .table-of-contents {
    padding: 1.5rem;
  }
}
</style>
