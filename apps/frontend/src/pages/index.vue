<script setup lang="ts">
import { useTrpc } from '../composables/useTrpc';
import { ref, onMounted } from '../composables/useVueComposables';
import { useSeo } from '../composables/useSeo';
import { useRoute } from 'vue-router';

// Định nghĩa kiểu dữ liệu cho bài viết
interface Post {
  id: number | string;
  title: string;
  content: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  authorId?: number;
  published?: boolean;
  author?: {
    name: string;
    email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const route = useRoute();
const trpc = useTrpc();
const latestPosts = ref<Post[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    // Fetch posts
    await fetchLatestPosts();
  } catch (err) {
    console.error('Error in page initialization:', err);
  }
});

async function fetchLatestPosts() {
  isLoading.value = true;
  error.value = null;
  try {
    // Gọi tRPC endpoint để lấy danh sách bài viết mới nhất
    const result = await trpc.post.all.query();
    latestPosts.value = result.slice(0, 3); // Chỉ lấy 3 bài viết mới nhất
  } catch (err: any) {
    console.error('Failed to fetch latest posts:', err);
    error.value = err.message || 'Đã xảy ra lỗi khi tải bài viết';
  } finally {
    isLoading.value = false;
  }
}

const getAuthorName = (author) => {
  if (author?.profile) {
    const firstName = author.profile.firstName || '';
    const lastName = author.profile.lastName || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }
  return author?.username || author?.email?.split('@')[0] || 'Ẩn danh';
};
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-primary text-primary-foreground py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Chào mừng đến với ứng dụng của chúng tôi</h1>
        <p class="text-xl mb-8 max-w-3xl mx-auto">
          Một ứng dụng hiện đại sử dụng Nuxt 3, NestJS và tRPC trong một monorepo Nx.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink to="/posts">
            <Button variant="outline" class="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
              Xem bài viết
            </Button>
          </NuxtLink>
          <NuxtLink to="/register">
            <Button class="w-full sm:w-auto">
              Đăng ký ngay
            </Button>
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Latest Posts Section -->
    <section class="py-16 bg-muted/50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">Bài viết mới nhất</h2>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
          <p>{{ error }}</p>
          <Button 
            @click="fetchLatestPosts" 
            variant="destructive"
            class="mt-2"
          >
            Thử lại
          </Button>
        </div>
        
        <!-- Posts grid -->
        <div v-else-if="latestPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card 
            v-for="post in latestPosts" 
            :key="post.id" 
            class="hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <CardTitle>{{ post.title }}</CardTitle>
              <CardDescription>
                {{ new Date(post.createdAt).toLocaleDateString('vi-VN') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p class="line-clamp-3 text-muted-foreground">{{ post.content }}</p>
            </CardContent>
            <CardFooter class="justify-between">
              <span class="text-sm text-muted-foreground">
                {{ getAuthorName(post.author) }}
              </span>
              <NuxtLink :to="`/posts/${post.id}`">
                <Button variant="ghost" size="sm" class="text-primary">
                  Xem chi tiết
                </Button>
              </NuxtLink>
            </CardFooter>
          </Card>
        </div>
        
        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-muted-foreground mb-4">Chưa có bài viết nào</p>
          <NuxtLink to="/posts/new">
            <Button>
              Tạo bài viết đầu tiên
            </Button>
          </NuxtLink>
        </div>
        
        <!-- View all button -->
        <div v-if="latestPosts.length > 0" class="text-center mt-10">
          <NuxtLink to="/posts">
            <Button size="lg">
              Xem tất cả bài viết
            </Button>
          </NuxtLink>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-12 text-center">Tính năng</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div class="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <CardTitle class="text-center">Hiệu suất cao</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-center text-muted-foreground">
                Được xây dựng với Nuxt 3 và NestJS, ứng dụng cung cấp hiệu suất tối ưu và thời gian phản hồi nhanh.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div class="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <CardTitle class="text-center">Bảo mật</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-center text-muted-foreground">
                Hệ thống xác thực và phân quyền mạnh mẽ, bảo vệ dữ liệu người dùng và nội dung.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div class="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <CardTitle class="text-center">Thiết kế hiện đại</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-center text-muted-foreground">
                Giao diện người dùng trực quan, đáp ứng và dễ sử dụng trên mọi thiết bị.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </div>
</template>
