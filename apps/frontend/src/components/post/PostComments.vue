<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTrpc } from '~/composables/useTrpc';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';
import { CommentStatus } from '@ew/shared';

const props = defineProps<{
  postId: number;
}>();

const { t } = useI18n();
const { user } = useAuth();
const trpc = useTrpc();

const isLoggedIn = computed(() => !!user.value);

const comments = ref<any[]>([]);
const content = ref('');
const authorName = ref('');
const authorEmail = ref('');
const parentId = ref<number | null>(null);
const replyingTo = ref<string | null>(null);
const isLoading = ref(false);
const totalComments = ref(0);
const currentPage = ref(1);
const limit = ref(10);
const errorMessage = ref('');

// Xử lý loading comments
onMounted(() => {
  loadComments();
});

const loadComments = async () => {
  isLoading.value = true;
  try {
    const result = await trpc.comment.list.query({
      postId: props.postId,
      page: currentPage.value,
      limit: limit.value
    });
    
    comments.value = result.items;
    totalComments.value = result.total;
  } catch (error) {
    console.error('Error loading comments:', error);
    errorMessage.value = t('comments.error_loading');
  } finally {
    isLoading.value = false;
  }
};

// Xử lý submit comment
const submitComment = async () => {
  if (!content.value.trim()) {
    errorMessage.value = t('comments.content_required');
    return;
  }

  if (!isLoggedIn.value && (!authorName.value.trim() || !authorEmail.value.trim())) {
    errorMessage.value = t('comments.author_info_required');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await trpc.comment.create.mutate({
      content: content.value,
      postId: props.postId,
      parentId: parentId.value,
      authorName: !isLoggedIn.value ? authorName.value : undefined,
      authorEmail: !isLoggedIn.value ? authorEmail.value : undefined
    });

    // Reset form
    content.value = '';
    authorName.value = '';
    authorEmail.value = '';
    parentId.value = null;
    replyingTo.value = null;

    // Refresh comments
    await loadComments();
  } catch (error) {
    console.error('Error submitting comment:', error);
    errorMessage.value = t('comments.error_submitting');
  } finally {
    isLoading.value = false;
  }
};

// Xử lý reply
const startReply = (comment: any) => {
  parentId.value = comment.id;
  replyingTo.value = comment.user?.profile?.firstName || comment.authorName || t('comments.anonymous');
  // Scroll to comment form
  setTimeout(() => {
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

const cancelReply = () => {
  parentId.value = null;
  replyingTo.value = null;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const isFormValid = computed(() => {
  if (!content.value.trim()) return false;
  if (!isLoggedIn.value && (!authorName.value.trim() || !authorEmail.value.trim())) return false;
  return true;
});

const pagesArray = computed(() => {
  if (!totalComments.value) return [];
  const totalPages = Math.ceil(totalComments.value / limit.value);
  return Array.from({ length: totalPages }, (_, i) => i + 1);
});

const changePage = (page: number) => {
  currentPage.value = page;
  loadComments();
};

// Random avatar colors
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-teal-500'
  ];
  
  // Generate a simple hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color
  return colors[Math.abs(hash) % colors.length];
};
</script>

<template>
  <div class="comments-section mt-12 border-t border-gray-200 dark:border-gray-700 pt-10">
    <h3 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center pl-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      {{ t('comments.title') }}
      <span class="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
        ({{ totalComments }})
      </span>
    </h3>

    <!-- Error message -->
    <div v-if="errorMessage" class="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ errorMessage }}
    </div>

    <!-- Comment form -->
    <div id="comment-form" class="comment-form mb-10 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-200">
      <h4 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        <span v-if="replyingTo" class="flex items-center text-primary-600 dark:text-primary-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          {{ t('comments.replying_to', { name: replyingTo }) }}
        </span>
        <span v-else class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {{ t('comments.leave_comment') }}
        </span>
      </h4>
      
      <div v-if="replyingTo" class="mb-3">
        <button @click="cancelReply" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center hover:underline transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ t('comments.cancel_reply') }}
        </button>
      </div>
      
      <!-- Login notice for guests -->
      <div v-if="!isLoggedIn" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium text-sm text-gray-600 dark:text-gray-300">
                {{ t('comments.name') }} <span class="text-rose-500">*</span>
              </span>
            </label>
            <input 
              v-model="authorName" 
              type="text" 
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200" 
              :placeholder="t('comments.name_placeholder')"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium text-sm text-gray-600 dark:text-gray-300">
                {{ t('comments.email') }} <span class="text-rose-500">*</span>
              </span>
            </label>
            <input 
              v-model="authorEmail" 
              type="email" 
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200" 
              :placeholder="t('comments.email_placeholder')"
            />
          </div>
        </div>
      </div>
      
      <!-- Comment text -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium text-sm text-gray-600 dark:text-gray-300">
            {{ t('comments.content') }} <span class="text-rose-500">*</span>
          </span>
        </label>
        <textarea 
          v-model="content" 
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[120px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200" 
          :placeholder="t('comments.content_placeholder')"
        ></textarea>
      </div>
      
      <!-- Notice about moderation -->
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-4 italic flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ t('comments.moderation_notice') }}</span>
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="submitComment" 
          class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition-colors duration-300 flex items-center disabled:opacity-60 disabled:pointer-events-none disabled:bg-gray-400" 
          :disabled="!isFormValid || isLoading"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {{ t('comments.submit') }}
        </button>
      </div>
    </div>

    <!-- Comments list -->
    <div class="comments-list space-y-6">
      <!-- Loading state -->
      <div v-if="isLoading && comments.length === 0" class="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-lg">{{ t('comments.loading') }}</span>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="comments.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
        <div class="w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          {{ t('comments.no_comments') }}
        </p>
      </div>
      
      <!-- Comment list -->
      <div v-else>
        <transition-group name="comment" tag="div" class="space-y-6">
          <div v-for="comment in comments" :key="comment.id" class="comment-item group">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200">
              <div class="flex items-start gap-4">
                <!-- Avatar -->
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full text-white flex items-center justify-center text-xl font-semibold shadow-sm" :class="getAvatarColor(comment.user?.profile?.firstName || comment.authorName || 'A')">
                    {{ (comment.user?.profile?.firstName?.charAt(0) || comment.authorName?.charAt(0) || 'A').toUpperCase() }}
                  </div>
                </div>
                
                <!-- Comment content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center flex-wrap gap-2 mb-1">
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ comment.user?.profile?.firstName || comment.authorName || t('comments.anonymous') }}
                    </h4>
                    <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ formatDate(comment.createdAt) }}</span>
                    </div>
                  </div>
                  
                  <div class="prose dark:prose-invert prose-sm max-w-none mt-2 text-gray-700 dark:text-gray-300">
                    {{ comment.content }}
                  </div>
                  
                  <div class="mt-3">
                    <button 
                      @click="startReply(comment)" 
                      class="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      {{ t('comments.reply') }}
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Nested replies -->
              <div v-if="comment.replies && comment.replies.length > 0" class="ml-12 pl-4 border-l-2 border-gray-100 dark:border-gray-700 mt-4 space-y-4">
                <div v-for="reply in comment.replies" :key="reply.id" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <div class="avatar">
                      <div class="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-semibold shadow-sm" :class="getAvatarColor(reply.user?.profile?.firstName || reply.authorName || 'A')">
                        {{ (reply.user?.profile?.firstName?.charAt(0) || reply.authorName?.charAt(0) || 'A').toUpperCase() }}
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center flex-wrap gap-2 mb-1">
                        <h5 class="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {{ reply.user?.profile?.firstName || reply.authorName || t('comments.anonymous') }}
                        </h5>
                        <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{{ formatDate(reply.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="prose dark:prose-invert prose-sm max-w-none text-sm mt-1 text-gray-700 dark:text-gray-300">
                        {{ reply.content }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
        
        <!-- Pagination -->
        <div v-if="pagesArray.length > 1" class="flex justify-center mt-8">
          <nav class="relative z-0 inline-flex shadow-sm -space-x-px rounded-md" aria-label="Pagination">
            <button 
              v-for="page in pagesArray" 
              :key="page" 
              @click="changePage(page)"
              :class="[
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                page === currentPage 
                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-400' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-enter-active,
.comment-leave-active {
  transition: all 0.3s ease;
}
.comment-enter-from,
.comment-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style> 