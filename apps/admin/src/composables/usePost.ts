import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { useTrpc } from './useTrpc'
import slugify from 'slugify'

interface PostTranslation {
  locale: string
  title: string
  slug: string
  content: string
  shortDescription?: string
  metaDescription?: string
  metaTitle?: string
  metaKeywords?: string
  ogImage?: string
}

interface PostForm {
  title: string
  slug: string
  content: string
  shortDescription: string
  published: boolean
  thumbnail: string
  metaDescription: string
  tags: string[]
  categoryIds: number[]
  updatedAt: string
  translations: Record<string, {
    title: string
    slug: string
    content: string
    shortDescription: string
    metaDescription: string
    thumbnail: string
  }>
}

export function usePost() {
  const router = useRouter()
  const toast = useToast()
  const trpc = useTrpc()

  const loading = ref(false)
  const saveAndContinue = ref(false)
  const selectedLanguage = ref('')
  const tagsInput = ref('')

  const initialForm: PostForm = {
    title: '',
    slug: '',
    content: '',
    shortDescription: '',
    published: false,
    thumbnail: '',
    metaDescription: '',
    tags: [],
    categoryIds: [],
    updatedAt: new Date().toISOString(),
    translations: {}
  }

  const form = ref<PostForm>({ ...initialForm })

  const generateSlug = () => {
    if (form.value.title) {
      form.value.slug = slugify(form.value.title, {
        lower: true,
        strict: true,
        locale: selectedLanguage.value,
        trim: true
      })
    }
  }

  const handleTagInput = (e: KeyboardEvent) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
    // Handle Space key
    else if (e.key === ' ') {
      e.preventDefault()
      addTag()
    }
    // Handle Backspace when input is empty
    else if (e.key === 'Backspace' && tagsInput.value === '') {
      e.preventDefault()
      form.value.tags.pop()
    }
  }

  const addTag = () => {
    const tag = tagsInput.value.trim()
    if (tag && !form.value.tags.includes(tag)) {
      form.value.tags.push(tag)
      tagsInput.value = ''
    }
  }

  const removeTag = (index: number) => {
    form.value.tags.splice(index, 1)
  }

  const fetchPost = async (id: number) => {
    try {
      loading.value = true
      const post = await trpc.admin.posts.getPostById.query(id)
      
      if (post) {
        // Initialize translations
        const translations: Record<string, any> = {}
        
        post.translations?.forEach((translation: any) => {
          translations[translation.locale] = {
            title: translation.title,
            slug: translation.slug,
            content: translation.content,
            shortDescription: translation.shortDescription || '',
            metaDescription: translation.metaDescription,
            thumbnail: translation.ogImage
          }
        })

        form.value = {
          title: post.translations?.find((t: any) => t.locale === selectedLanguage.value)?.title || post.title || '',
          slug: post.translations?.find((t: any) => t.locale === selectedLanguage.value)?.slug || '',
          content: post.translations?.find((t: any) => t.locale === selectedLanguage.value)?.content || post.content || '',
          shortDescription: post.translations?.find((t: any) => t.locale === selectedLanguage.value)?.shortDescription || post.shortDescription || '',
          published: post.published,
          thumbnail: post.translations?.find((t: any) => t.locale === selectedLanguage.value)?.ogImage || post.thumbnail || '',
          metaDescription: post.translations?.find((t: any) => t.locale === selectedLanguage.value)?.metaDescription || '',
          tags: post.postTags?.map((tag: any) => tag.tag.name) || [],
          categoryIds: post.categories?.map((category: any) => category.id) || [],
          updatedAt: post.updatedAt,
          translations
        }
        tagsInput.value = form.value.tags.join(', ')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      router.push('/posts')
    } finally {
      loading.value = false
    }
  }

  const updatePost = async (id: number, continueEditing = false) => {
    try {
      loading.value = true
      saveAndContinue.value = continueEditing

      // Save current content to translations before updating
      form.value.translations[selectedLanguage.value] = {
        title: form.value.title,
        slug: form.value.slug,
        content: form.value.content,
        shortDescription: form.value.shortDescription,
        metaDescription: form.value.metaDescription,
        thumbnail: form.value.thumbnail
      }

      // Prepare translations array for API
      const translations = Object.entries(form.value.translations).map(([locale, content]) => ({
        locale,
        title: content.title,
        slug: content.slug,
        content: content.content,
        shortDescription: content.shortDescription,
        metaDescription: content.metaDescription,
        ogImage: content.thumbnail
      }))

      await trpc.admin.posts.updatePost.mutate({
        id: id,
        data: {
          title: form.value.title,
          content: form.value.content,
          shortDescription: form.value.shortDescription,
          status: form.value.published ? 'PUBLISHED' : 'DRAFT',
          thumbnail: form.value.thumbnail || '',
          metaDescription: form.value.metaDescription || '',
          translations,
          tags: form.value.tags,
          categoryIds: form.value.categoryIds
        }
      })

      toast.success('Post updated successfully!')

      if (!continueEditing) {
        router.push('/posts')
      } else {
        // Refresh the post data
        await fetchPost(id)
      }
    } catch (error: any) {
      console.error('Failed to update post:', error)
      
      let errorMessage = ''
      
      // Handle tRPC error
      if (error.cause) {
        errorMessage += error.cause
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += 'Failed to update post. Please try again.'
      }
      
      toast.error(errorMessage, {
        timeout: 8000,
        closeButton: true,
        icon: true,
        closeOnClick: false,
        pauseOnHover: true
      })
    } finally {
      loading.value = false
      saveAndContinue.value = false
    }
  }

  return {
    form,
    loading,
    saveAndContinue,
    selectedLanguage,
    tagsInput,
    generateSlug,
    handleTagInput,
    addTag,
    removeTag,
    fetchPost,
    updatePost
  }
} 