<template>
  <div class="min-h-screen bg-gray-50/30">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b px-6 py-4 mb-6">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Edit Post</h1>
          <p class="text-sm text-gray-500 mt-1">Update your post content and settings</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/posts" class="btn btn-outline">
            Cancel
          </NuxtLink>
          <button @click="updatePost" :disabled="loading" class="btn btn-primary">
            <i class="fas fa-save mr-2"></i>
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-6 pb-12">
      <div class="grid grid-cols-3 gap-6">
        <!-- Main Form Section -->
        <div class="col-span-2 space-y-6">
          <!-- Basic Info Card -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Title</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Enter a descriptive title"
                  class="input input-bordered w-full"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Slug</span>
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="form.slug"
                    type="text"
                    placeholder="url-friendly-slug"
                    class="input input-bordered flex-1"
                    required
                  />
                  <button @click="generateSlug" class="btn btn-outline btn-square">
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>
                <label class="label">
                  <span class="label-text-alt text-gray-500">URL: /posts/{{ form.slug }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Content Card -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Content</h2>
            
            <div class="form-control">
              <QuillEditor
                v-model:content="form.content"
                placeholder="Write your post content here..."
                theme="snow"
                toolbar="full"
                class="min-h-[400px]"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Status</h2>
            
            <div class="form-control">
              <select v-model="form.status" class="select select-bordered w-full">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <label class="label">
                <span class="label-text-alt">Last updated: {{ formatDate(form.updatedAt) }}</span>
              </label>
            </div>
          </div>

          <!-- Featured Image Card -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Featured Image</h2>
            
            <div class="space-y-4">
              <div v-if="form.featuredImage" class="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img :src="form.featuredImage" alt="Featured image" class="w-full h-full object-cover" />
              </div>
              <div v-else class="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span class="text-gray-500">No image selected</span>
              </div>
              
              <div class="form-control">
                <input
                  v-model="form.featuredImage"
                  type="text"
                  placeholder="Enter image URL or upload"
                  class="input input-bordered w-full"
                />
                <label class="label">
                  <span class="label-text-alt">Recommended size: 1200x630px</span>
                </label>
              </div>
              
              <button class="btn btn-outline w-full">
                <i class="fas fa-upload mr-2"></i>
                Upload Image
              </button>
            </div>
          </div>

          <!-- SEO Card -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">SEO Settings</h2>
            
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Meta Description</span>
                </label>
                <textarea
                  v-model="form.metaDescription"
                  placeholder="Enter SEO meta description"
                  class="textarea textarea-bordered h-24"
                ></textarea>
                <label class="label">
                  <span class="label-text-alt">{{ form.metaDescription?.length || 0 }}/160 characters</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Tags</span>
                </label>
                <input
                  v-model="tagsInput"
                  type="text"
                  placeholder="Enter tags, separated by commas"
                  class="input input-bordered"
                />
                <label class="label">
                  <span class="label-text-alt">Example: technology, web development, tutorial</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '../../../composables/useTrpc'
import { formatDate } from '../../../utils/date'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const trpc = useTrpc()
const route = useRoute()
const router = useRouter()
const loading = ref(true)

interface PostForm {
  title: string
  slug: string
  content: string
  status: 'DRAFT' | 'PUBLISHED'
  featuredImage: string
  metaDescription: string
  tags: string[]
  updatedAt: string
}

const initialForm: PostForm = {
  title: '',
  slug: '',
  content: '',
  status: 'DRAFT',
  featuredImage: '',
  metaDescription: '',
  tags: [],
  updatedAt: new Date().toISOString()
}

const form = ref({ ...initialForm })
const tagsInput = ref('')

// Convert tags input to array
watch(tagsInput, (newValue) => {
  form.value.tags = newValue.split(',').map(tag => tag.trim()).filter(Boolean)
})

// Generate slug from title
const generateSlug = () => {
  if (form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}

// Watch title changes to suggest slug
watch(() => form.value.title, (newTitle) => {
  if (!form.value.slug) {
    generateSlug()
  }
})

const fetchPost = async () => {
  try {
    const post = await trpc.admin.posts.getPostById.query(Number(route.params.id))
    
    if (post) {
      form.value = {
        ...initialForm,
        ...post,
        tags: post.tags || []
      }
      tagsInput.value = post.tags?.join(', ') || ''
    }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    // Show error toast
    router.push('/posts')
  } finally {
    loading.value = false
  }
}

const updatePost = async () => {
  try {
    loading.value = true
    await trpc.admin.posts.updatePost.mutate({
      id: Number(route.params.id),
      data: {
        ...form.value,
        tags: form.value.tags
      }
    })
    
    // Show success toast
    router.push('/posts')
  } catch (error) {
    console.error('Failed to update post:', error)
    // Show error toast
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPost()
})
</script>

<style>
.quill-editor {
  @apply bg-white;
}
.ql-toolbar {
  @apply border rounded-t-lg !important;
}
.ql-container {
  @apply border rounded-b-lg !important;
  min-height: 200px;
}
</style> 