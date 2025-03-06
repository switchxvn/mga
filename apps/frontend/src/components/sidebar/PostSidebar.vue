<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTrpc } from '../../composables/useTrpc';

const props = defineProps<{
  postId: number;
  authorInfo?: any;
}>();

const trpc = useTrpc();
const popularPosts = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref({
  popular: true,
  categories: true
});

async function fetchPopularPosts() {
  try {
    loading.value.popular = true;
    const result = await trpc.post.popular.query({ 
      limit: 5,
      excludeId: props.postId 
    });
    popularPosts.value = result;
  } catch (error) {
    console.error('Failed to fetch popular posts:', error);
  } finally {
    loading.value.popular = false;
  }
}

async function fetchCategories() {
  try {
    loading.value.categories = true;
    const result = await trpc.category.all.query();
    categories.value = result;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  } finally {
    loading.value.categories = false;
  }
}

onMounted(() => {
  fetchPopularPosts();
  fetchCategories();
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
</script>

<template>
  <div class="post-sidebar">
    <!-- Author Info -->
    <div v-if="authorInfo" class="post-sidebar__section">
      <h3 class="post-sidebar__title">Tác giả</h3>
      <div class="post-sidebar__author">
        <div class="post-sidebar__author-avatar">
          {{ authorInfo.name ? authorInfo.name.charAt(0) : 'U' }}
        </div>
        <div>
          <p class="post-sidebar__author-name">{{ authorInfo.name }}</p>
          <p v-if="authorInfo.bio" class="post-sidebar__author-bio">{{ authorInfo.bio }}</p>
        </div>
      </div>
    </div>

    <!-- Popular Posts -->
    <div class="post-sidebar__section">
      <h3 class="post-sidebar__title">Bài viết phổ biến</h3>
      
      <div v-if="loading.popular" class="post-sidebar__loading">
        <div class="post-sidebar__loading-spinner"></div>
      </div>
      
      <div v-else-if="popularPosts.length === 0" class="post-sidebar__empty">
        Không có bài viết phổ biến
      </div>
      
      <ul v-else class="post-sidebar__post-list">
        <li v-for="post in popularPosts" :key="post.id" class="post-sidebar__post-item">
          <NuxtLink 
            :to="`/bai-viet/${post.slug || post.id}`" 
            class="post-sidebar__post-item-link"
          >
            <div class="post-sidebar__post-item-content">
              <div v-if="post.ogImage" class="post-sidebar__post-item-image">
                <img :src="post.ogImage" :alt="post.title">
              </div>
              <div>
                <h4 class="post-sidebar__post-item-title">{{ post.title }}</h4>
                <p class="post-sidebar__post-item-date">{{ formatDate(post.createdAt) }}</p>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Categories -->
    <div class="post-sidebar__section">
      <h3 class="post-sidebar__title">Danh mục</h3>
      
      <div v-if="loading.categories" class="post-sidebar__loading">
        <div class="post-sidebar__loading-spinner"></div>
      </div>
      
      <div v-else-if="categories.length === 0" class="post-sidebar__empty">
        Không có danh mục
      </div>
      
      <div v-else class="post-sidebar__categories">
        <NuxtLink 
          v-for="category in categories" 
          :key="category.id"
          :to="`/danh-muc/${category.slug || category.id}`"
          class="post-sidebar__category"
        >
          {{ category.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- Subscribe -->
    <div class="post-sidebar__section post-sidebar__section--highlight">
      <h3 class="post-sidebar__title">Đăng ký nhận tin</h3>
      <p class="post-sidebar__author-bio mb-4">Nhận thông báo khi có bài viết mới</p>
      
      <form class="post-sidebar__form">
        <input 
          type="email" 
          placeholder="Email của bạn" 
          class="post-sidebar__form-input"
        >
        <button 
          type="submit" 
          class="post-sidebar__form-button"
        >
          Đăng ký
        </button>
      </form>
    </div>
  </div>
</template> 