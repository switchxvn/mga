<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Edit Post</h1>
      <NuxtLink to="/posts" class="btn">
        Back to Posts
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <form v-else @submit.prevent="updatePost" class="max-w-3xl">
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Title</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Enter post title"
          class="input input-bordered"
          required
        />
      </div>

      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Slug</span>
        </label>
        <input
          v-model="form.slug"
          type="text"
          placeholder="Enter post slug"
          class="input input-bordered"
          required
        />
      </div>

      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Content</span>
        </label>
        <textarea
          v-model="form.content"
          placeholder="Enter post content"
          class="textarea textarea-bordered h-32"
          required
        ></textarea>
      </div>

      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Featured Image URL</span>
        </label>
        <input
          v-model="form.featuredImage"
          type="text"
          placeholder="Enter featured image URL"
          class="input input-bordered"
        />
      </div>

      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Meta Description</span>
        </label>
        <textarea
          v-model="form.metaDescription"
          placeholder="Enter meta description"
          class="textarea textarea-bordered"
        ></textarea>
      </div>

      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Tags (comma separated)</span>
        </label>
        <input
          v-model="tagsInput"
          type="text"
          placeholder="Enter tags"
          class="input input-bordered"
        />
      </div>

      <div class="form-control mb-6">
        <label class="label cursor-pointer">
          <span class="label-text">Status</span>
          <select v-model="form.status" class="select select-bordered">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
      </div>

      <div class="flex gap-4">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          Update Post
        </button>
        <button type="button" @click="resetForm" class="btn" :disabled="loading">
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from '../../../composables/useTrpc'

const trpc = useTrpc()
const route = useRoute()
const router = useRouter()
const loading = ref(true)

const initialForm = {
  title: '',
  slug: '',
  content: '',
  status: 'DRAFT',
  featuredImage: '',
  metaDescription: '',
  tags: [] as string[]
}

const form = ref({ ...initialForm })
const tagsInput = ref('')

// Convert tags input to array
watch(tagsInput, (newValue) => {
  form.value.tags = newValue.split(',').map(tag => tag.trim()).filter(Boolean)
})

const fetchPost = async () => {
  try {
    const post = await trpc.admin.posts.getPostById.query(Number(route.params.id))
    
    if (post) {
      form.value = {
        ...post,
        tags: post.tags || []
      }
      tagsInput.value = post.tags?.join(', ') || ''
    }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    // Show error notification
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
    
    // Show success notification
    router.push('/posts')
  } catch (error) {
    console.error('Failed to update post:', error)
    // Show error notification
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  fetchPost()
}

onMounted(() => {
  fetchPost()
})
</script> 