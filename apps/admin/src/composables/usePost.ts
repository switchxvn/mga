import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrpc } from './useTrpc'
import { useToast } from './useToast'
import { useLocalization } from './useLocalization'
import { PostStatus } from '@ew/shared'
import type { AdminPost, PaginatedResponse } from '@ew/shared'
import Swal from 'sweetalert2'
import slugify from 'slugify'
import { FileTextIcon, ImageIcon, SearchIcon, SettingsIcon, FolderIcon } from 'lucide-vue-next'

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

interface Language {
  id: number
  name: string
  code: string
  nativeName: string
  flagCode: string
  isDefault: boolean
  isActive: boolean
}

export function usePost() {
  const route = useRoute()
  const router = useRouter()
  const trpc = useTrpc()
  const toast = useToast()
  const { t } = useLocalization()

  // Post list state
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const search = ref('')
  const publishedFilter = ref<boolean | undefined>(undefined)
  const page = ref(1)
  const pageSize = ref(10)
  const posts = ref<PaginatedResponse<AdminPost>>({
    items: [],
    total: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 1
  })

  // Selection and sorting state
  const selectedPosts = ref<number[]>([])
  const sortBy = ref('createdAt')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // Image zoom state
  const selectedImage = ref<string | null>(null)
  const isZoomModalOpen = ref(false)

  // Edit/Create state
  const postId = computed(() => {
    const id = route.params.id
    return id ? Number(id) : undefined
  })
  
  const loading = ref(false)
  const saveAndContinue = ref(false)
  const errors = ref<Record<string, string>>({})

  // Initialize currentTab from query params or default to 'basic'
  const currentTab = ref(route.query.tab?.toString() || 'basic')

  // Watch for tab changes and update URL
  watch(currentTab, (newTab) => {
    router.replace({ 
      query: { 
        ...route.query,
        tab: newTab 
      }
    })
  })

  const tabs = computed(() => [
    {
      id: 'basic',
      name: t('posts.tabs.basicInfo'),
      icon: FileTextIcon
    },
    {
      id: 'media',
      name: t('posts.tabs.media'),
      icon: ImageIcon
    },
    {
      id: 'categories',
      name: t('posts.tabs.categories'),
      icon: FolderIcon
    },
    {
      id: 'seo',
      name: t('posts.tabs.seo'),
      icon: SearchIcon
    },
    {
      id: 'settings',
      name: t('posts.tabs.settings'),
      icon: SettingsIcon
    }
  ])

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
  const tagsInput = ref('')

  // Editor options
  const editorOptions = {
    placeholder: t('posts.editor.contentPlaceholder'),
    autofocus: false,
    modules: {}
  }

  // Language handling
  const languages = ref<Language[]>([])
  const selectedLanguage = ref('')
  const defaultLanguage = ref('')
  const isLanguageOpen = ref(false)

  // ----- POST LIST METHODS -----

  // Initialize from route query
  const initFromRoute = () => {
    search.value = route.query.search?.toString() || ''
    publishedFilter.value = route.query.published === 'true' 
      ? true 
      : route.query.published === 'false' 
        ? false 
        : undefined
    page.value = Number(route.query.page) || 1
  }

  // Update URL query parameters
  const updateQueryParams = () => {
    const query: Record<string, string | undefined> = {
      page: page.value > 1 ? page.value.toString() : undefined,
      search: search.value || undefined,
      published: publishedFilter.value !== undefined ? publishedFilter.value.toString() : undefined
    }

    // Remove undefined values
    Object.keys(query).forEach(key => query[key] === undefined && delete query[key])

    router.replace({ query })
  }

  // Fetch posts
  const fetchPosts = async () => {
    try {
      isLoading.value = true
      error.value = null

      const result = await trpc.admin.posts.getAllPosts.query({
        page: page.value,
        limit: pageSize.value,
        search: search.value || undefined,
        published: publishedFilter.value
      })

      posts.value = result
    } catch (err: any) {
      error.value = err.message || t('messages.error')
      console.error("Error loading posts:", err)
    } finally {
      isLoading.value = false
    }
  }

  // Delete a post
  const deletePost = async (id: number) => {
    const result = await Swal.fire({
      title: t('messages.confirmDelete'),
      text: t('posts.confirmDelete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('actions.confirm'),
      cancelButtonText: t('actions.cancel'),
      confirmButtonColor: '#DC2626',
    })

    if (!result.isConfirmed) return

    try {
      await trpc.admin.posts.deletePost.mutate(id)
      await fetchPosts()
      
      toast.success(t('posts.deleteSuccess'))
    } catch (err: any) {
      error.value = err.message || t('posts.deleteError')
      console.error("Error deleting post:", err)
      
      toast.error(err.message || t('posts.deleteError'))
    }
  }

  // Toggle post published status
  const togglePublished = async (post: AdminPost) => {
    const newStatus = !post.published
    
    const result = await Swal.fire({
      title: newStatus ? t('posts.publishPost') : t('posts.unpublishPost'),
      text: newStatus ? t('posts.confirmPublish', { title: post.title }) : t('posts.confirmUnpublish', { title: post.title }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: newStatus ? t('posts.yesPublish') : t('posts.yesUnpublish'),
      cancelButtonText: t('actions.cancel'),
      confirmButtonColor: newStatus ? '#10B981' : '#6B7280',
    })

    if (!result.isConfirmed) return

    try {
      await trpc.admin.posts.updatePostStatus.mutate({
        id: post.id,
        status: newStatus ? PostStatus.PUBLISHED : PostStatus.DRAFT
      })
      
      post.published = newStatus

      toast.success(newStatus ? t('posts.publishSuccess') : t('posts.unpublishSuccess'))
    } catch (err: any) {
      const errorMessage = err.message || t('posts.statusUpdateError')
      error.value = errorMessage
      console.error("Error updating post status:", err)
      
      toast.error(errorMessage)
    }
  }

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    const selectedCount = selectedPosts.value.length
    if (!selectedCount) return

    let confirmConfig: any = {
      icon: 'question' as const,
      showCancelButton: true,
      confirmButtonText: t('actions.confirm'),
      cancelButtonText: t('actions.cancel'),
      title: '',
      text: '',
      confirmButtonColor: ''
    }

    switch (action) {
      case 'publish':
        confirmConfig = {
          ...confirmConfig,
          title: t('posts.bulkPublishTitle'),
          text: t('posts.bulkPublishText', { count: selectedCount }),
          confirmButtonColor: '#10B981',
          confirmButtonText: t('posts.bulkPublishConfirm')
        }
        break
      case 'unpublish':
        confirmConfig = {
          ...confirmConfig,
          title: t('posts.bulkUnpublishTitle'),
          text: t('posts.bulkUnpublishText', { count: selectedCount }),
          confirmButtonColor: '#6B7280',
          confirmButtonText: t('posts.bulkUnpublishConfirm')
        }
        break
      case 'delete':
        confirmConfig = {
          ...confirmConfig,
          title: t('posts.bulkDeleteTitle'),
          text: t('posts.bulkDeleteText', { count: selectedCount }),
          confirmButtonColor: '#DC2626',
          confirmButtonText: t('posts.bulkDeleteConfirm'),
          icon: 'warning' as const
        }
        break
    }

    const result = await Swal.fire(confirmConfig)
    if (!result.isConfirmed) return

    try {
      isLoading.value = true

      switch (action) {
        case 'publish':
          await Promise.all(
            selectedPosts.value.map(postId => {
              return trpc.admin.posts.updatePostStatus.mutate({
                id: postId,
                status: PostStatus.PUBLISHED
              })
            })
          )
          break
        case 'unpublish':
          await Promise.all(
            selectedPosts.value.map(postId => {
              return trpc.admin.posts.updatePostStatus.mutate({
                id: postId,
                status: PostStatus.DRAFT
              })
            })
          )
          break
        case 'delete':
          await Promise.all(
            selectedPosts.value.map(postId => 
              trpc.admin.posts.deletePost.mutate(postId)
            )
          )
          break
      }

      // Refresh posts list
      await fetchPosts()
      selectedPosts.value = []

      toast.success(t('posts.bulkActionSuccess', { action: t(`posts.bulk${action}`) }))
    } catch (err: any) {
      error.value = err.message || t('posts.bulkActionError', { action })
      console.error(`Error performing ${action} on posts:`, err)
      
      toast.error(err.message || t('posts.bulkActionError', { action }))
    } finally {
      isLoading.value = false
    }
  }

  // Selection handling
  const toggleSelectAll = () => {
    if (selectedPosts.value.length === posts.value.items.length) {
      selectedPosts.value = []
    } else {
      selectedPosts.value = posts.value.items.map(post => post.id)
    }
  }

  const togglePostSelection = (postId: number) => {
    const index = selectedPosts.value.indexOf(postId)
    if (index === -1) {
      selectedPosts.value.push(postId)
    } else {
      selectedPosts.value.splice(index, 1)
    }
  }

  const clearSelection = () => {
    selectedPosts.value = []
  }

  // Image zoom handling
  const openZoomModal = (image: string) => {
    selectedImage.value = image
    isZoomModalOpen.value = true
  }

  const closeZoomModal = () => {
    selectedImage.value = null
    isZoomModalOpen.value = false
  }

  // Format date helper
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  // ----- POST EDIT/CREATE METHODS -----

  // Tag handling
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

  // Generate slug from title with Vietnamese support
  const generateSlug = () => {
    if (form.value.title) {
      form.value.slug = slugify(form.value.title, {
        lower: true,
        strict: true,
        locale: 'vi',
        trim: true
      })
    }
  }

  const fetchLanguages = async () => {
    try {
      const [langs, defaultLang] = await Promise.all([
        trpc.admin.languages.getLanguages.query(),
        trpc.admin.languages.getDefaultLanguage.query()
      ])
      languages.value = langs
      defaultLanguage.value = defaultLang?.code || ''
      selectedLanguage.value = defaultLang?.code || ''
    } catch (error) {
      console.error('Failed to fetch languages:', error)
    }
  }

  // Watch for language changes
  watch(selectedLanguage, (newLang, oldLang) => {
    if (oldLang) {
      // Save current form data to translations
      form.value.translations[oldLang] = {
        title: form.value.title,
        slug: form.value.slug,
        content: form.value.content,
        shortDescription: form.value.shortDescription,
        metaDescription: form.value.metaDescription,
        thumbnail: form.value.thumbnail
      }
    }

    // Load translation data if available
    if (newLang && form.value.translations[newLang]) {
      const translation = form.value.translations[newLang]
      form.value.title = translation.title
      form.value.slug = translation.slug
      form.value.content = translation.content
      form.value.shortDescription = translation.shortDescription
      form.value.metaDescription = translation.metaDescription
      form.value.thumbnail = translation.thumbnail
    } else if (newLang === defaultLanguage.value) {
      // Don't clear form for default language
    } else {
      // Clear form for new language
      form.value.title = ''
      form.value.slug = ''
      form.value.content = ''
      form.value.shortDescription = ''
      form.value.metaDescription = ''
      // Keep thumbnail the same across languages
    }
  })

  // Flag image error handling
  const onFlagImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = '/images/flag/placeholder.svg'
  }

  // Form validation
  const validateForm = (): boolean => {
    errors.value = {}
    
    // Check required fields in default language
    if (selectedLanguage.value === defaultLanguage.value) {
      if (!form.value.title) {
        errors.value.title = t('posts.errors.titleRequired')
      }
      if (!form.value.slug) {
        errors.value.slug = t('posts.errors.slugRequired')
      }
      if (!form.value.content) {
        errors.value.content = t('posts.errors.contentRequired')
      }
    }
    
    return Object.keys(errors.value).length === 0
  }

  // Fetch specific post for editing
  const fetchPost = async (id?: number) => {
    const postIdToFetch = id || postId.value
    if (!postIdToFetch) return
    
    loading.value = true
    
    try {
      const post = await trpc.admin.posts.getPostById.query(postIdToFetch)
      
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

        // Get translation for current language
        const translation = post.translations?.find(t => t.locale === selectedLanguage.value)
        
        form.value = {
          title: translation?.title  || '',
          slug: translation?.slug || '',
          content: translation?.content || post.content || '',
          shortDescription: translation?.shortDescription || post.shortDescription || '',
          published: post.published,
          thumbnail: translation?.ogImage || post.thumbnail || '',
          metaDescription: translation?.metaDescription || '',
          tags: post.postTags?.map(tag => tag.name) || [],
          categoryIds: post.categories?.map(c => c.id) || [],
          updatedAt: post.updatedAt || new Date().toISOString(),
          translations
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch post:', error)
      toast.error(error.message || t('posts.fetchError'))
      router.push('/posts')
    } finally {
      loading.value = false
    }
  }

  // Create new post
  const createPost = async (continueEditing = false) => {
    if (!validateForm()) {
      toast.error(t('posts.validation.checkRequiredFields'))
      return
    }

    // Save current language data to translations
    if (selectedLanguage.value) {
      form.value.translations[selectedLanguage.value] = {
        title: form.value.title,
        slug: form.value.slug,
        content: form.value.content,
        shortDescription: form.value.shortDescription,
        metaDescription: form.value.metaDescription,
        thumbnail: form.value.thumbnail
      }
    }

    saveAndContinue.value = continueEditing
    loading.value = true

    try {
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

      const result = await trpc.admin.posts.createPost.mutate({
        title: form.value.title,
        content: form.value.content,
        shortDescription: form.value.shortDescription,
        status: form.value.published ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        thumbnail: form.value.thumbnail,
        translations,
        tags: form.value.tags,
        categoryIds: form.value.categoryIds
      })

      toast.success(t('posts.createSuccess'))

      if (continueEditing) {
        // Redirect to edit page
        router.push(`/posts/edit/${result.id}`)
      } else {
        // Redirect to posts list
        router.push('/posts')
      }
    } catch (error: any) {
      console.error('Failed to create post:', error)
      toast.error(error.message || t('posts.createError'))
    } finally {
      loading.value = false
    }
  }

  // Update existing post
  const updatePost = async (id?: number, continueEditing = false) => {
    const postIdToUpdate = id || postId.value
    if (!postIdToUpdate) return

    if (!validateForm()) {
      toast.error(t('posts.validation.checkRequiredFields'))
      return
    }

    // Save current language data to translations
    if (selectedLanguage.value) {
      form.value.translations[selectedLanguage.value] = {
        title: form.value.title,
        slug: form.value.slug,
        content: form.value.content,
        shortDescription: form.value.shortDescription,
        metaDescription: form.value.metaDescription,
        thumbnail: form.value.thumbnail
      }
    }

    saveAndContinue.value = continueEditing
    loading.value = true

    try {
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
        id: postIdToUpdate,
        data: {
          title: form.value.title,
          content: form.value.content,
          shortDescription: form.value.shortDescription,
          status: form.value.published ? 'PUBLISHED' : 'DRAFT',
          thumbnail: form.value.thumbnail || '',
          translations,
          tags: form.value.tags,
          categoryIds: form.value.categoryIds
        }
      })

      toast.success(t('posts.updateSuccess'))

      if (!continueEditing) {
        // Redirect to posts list
        router.push('/posts')
      } else {
        // Refresh the post data
        await fetchPost(postIdToUpdate)
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
        errorMessage += t('posts.updateError')
      }
      
      toast.error(errorMessage)
    } finally {
      loading.value = false
      saveAndContinue.value = false
    }
  }

  // Computed property to check if bulk actions should be shown
  const showBulkActions = computed(() => selectedPosts.value.length > 0)

  return {
    // State - Posts List
    isLoading,
    error,
    search,
    publishedFilter,
    page,
    pageSize,
    posts,
    selectedPosts,
    sortBy,
    sortOrder,
    selectedImage,
    isZoomModalOpen,
    showBulkActions,
    
    // State - Edit/Create
    loading,
    saveAndContinue,
    currentTab,
    tabs,
    form,
    tagsInput,
    errors,
    editorOptions,
    languages,
    selectedLanguage,
    defaultLanguage,
    isLanguageOpen,
    postId,
    
    // Methods - Posts List
    initFromRoute,
    updateQueryParams,
    fetchPosts,
    deletePost,
    togglePublished,
    handleBulkAction,
    toggleSelectAll,
    togglePostSelection,
    clearSelection,
    openZoomModal,
    closeZoomModal,
    formatDate,
    
    // Methods - Edit/Create
    handleTagInput,
    addTag,
    removeTag,
    generateSlug,
    fetchLanguages,
    onFlagImageError,
    fetchPost,
    createPost,
    updatePost,
    validateForm
  }
} 