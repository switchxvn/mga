# Post Reviews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add approved review listing and pending review submission for individual post detail pages using the existing review system.

**Architecture:** Extend the shared `Review` model with a nullable `postId` relation, update public review router and frontend review service to query/submit post-linked reviews, then add a focused post detail payload plus a dedicated review section/form on the post detail page. Follow the existing product/service review slice so data loading and UX stay consistent.

**Tech Stack:** NestJS, TypeORM, tRPC, Nuxt 3, Vue 3, Vitest

---

### Task 1: Lock router-level post review payload behavior

**Files:**
- Modify: `/Users/abc/project/mga/apps/backend/src/modules/trpc/routers/review.router.spec.ts`
- Modify: `/Users/abc/project/mga/apps/backend/src/modules/trpc/routers/review.router.ts`
- Test: `/Users/abc/project/mga/apps/backend/src/modules/trpc/routers/review.router.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('accepts post detail review payloads without serviceTypeId', () => {
  const parsed = submitReviewSchema.parse({
    authorName: 'Nguyen Van C',
    profession: 'Dieu phoi kho',
    rating: 5,
    postId: 44,
    translations: [
      {
        locale: 'vi',
        title: 'Noi dung huu ich',
        content: 'Bai viet de hieu va giup toi chot cau hinh nhanh hon.',
      },
    ],
  });

  expect(parsed.postId).toBe(44);
  expect(parsed.serviceTypeId).toBeUndefined();
});

it('keeps post-linked reviews pending and preserves postId', () => {
  const result = buildPublicReviewCreateInput({
    authorName: 'Nguyen Van C',
    profession: 'Dieu phoi kho',
    rating: 5,
    postId: 44,
    visitDate: undefined,
    translations: [
      {
        locale: 'vi',
        title: 'Noi dung huu ich',
        content: 'Bai viet de hieu va giup toi chot cau hinh nhanh hon.',
      },
    ],
  });

  expect(result.postId).toBe(44);
  expect(result.status).toBe(ReviewStatus.PENDING);
  expect(result.featured).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/abc/project/mga && npx vitest run apps/backend/src/modules/trpc/routers/review.router.spec.ts`
Expected: FAIL because `submitReviewSchema` and `buildPublicReviewCreateInput` do not yet support `postId`.

- [ ] **Step 3: Write minimal implementation**

```ts
const reviewsFilterSchema = z.object({
  postId: z.number().optional(),
  // existing fields...
});

export const submitReviewSchema = z.object({
  postId: z.number().min(1).optional(),
  // existing fields...
});

export function buildPublicReviewCreateInput(input: z.infer<typeof submitReviewSchema>): CreateReviewInput {
  return {
    postId: input.postId,
    status: ReviewStatus.PENDING,
    featured: false,
    // existing mappings...
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/abc/project/mga && npx vitest run apps/backend/src/modules/trpc/routers/review.router.spec.ts`
Expected: PASS

### Task 2: Add post review persistence and frontend query support

**Files:**
- Modify: `/Users/abc/project/mga/apps/backend/src/modules/review/entities/review.entity.ts`
- Modify: `/Users/abc/project/mga/apps/backend/src/modules/post/entities/post.entity.ts`
- Modify: `/Users/abc/project/mga/apps/backend/src/modules/review/admin/services/admin-review.service.ts`
- Modify: `/Users/abc/project/mga/apps/backend/src/modules/review/frontend/services/frontend-review.service.ts`
- Modify: `/Users/abc/project/mga/apps/backend/src/modules/trpc/routers/review.router.ts`
- Test: `/Users/abc/project/mga/apps/backend/src/modules/review/frontend/services/frontend-review.service.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('filters list results by postId and returns only active reviews for that post', async () => {
  // seed or mock query builder so only reviews with postId 44 should match
  const result = await service.findAll({ postId: 44, locale: 'vi', limit: 3 });
  expect(result.data.every((review) => review.postId === 44)).toBe(true);
});

it('returns aggregate rating scoped to a post', async () => {
  const result = await service.getPostAggregateRating(44);
  expect(result).toEqual({
    averageRating: '4.5',
    totalReviews: 2,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/abc/project/mga && npx vitest run apps/backend/src/modules/review/frontend/services/frontend-review.service.spec.ts`
Expected: FAIL because the service has no `postId` filter or post aggregate method.

- [ ] **Step 3: Write minimal implementation**

```ts
@Column({ name: 'post_id', nullable: true })
postId?: number | null;

@ManyToOne(() => Post, (post) => post.reviews, { nullable: true })
@JoinColumn({ name: 'post_id' })
post?: Post | null;

if (postId) {
  query.andWhere('review.postId = :postId', { postId });
}

async getPostAggregateRating(postId: number) {
  const result = await this.reviewRepository
    .createQueryBuilder('review')
    .where('review.status = :status', { status: ReviewStatus.ACTIVE })
    .andWhere('review.postId = :postId', { postId })
    .select('AVG(review.rating)', 'avgRating')
    .addSelect('COUNT(review.id)', 'totalReviews')
    .getRawOne();

  return {
    averageRating: result?.avgRating ? parseFloat(result.avgRating).toFixed(1) : '0.0',
    totalReviews: parseInt(result?.totalReviews, 10) || 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/abc/project/mga && npx vitest run apps/backend/src/modules/review/frontend/services/frontend-review.service.spec.ts`
Expected: PASS

### Task 3: Add SSR payload loading for post detail reviews

**Files:**
- Create: `/Users/abc/project/mga/apps/frontend/src/composables/postDetailPayload.ts`
- Create: `/Users/abc/project/mga/apps/frontend/src/composables/postDetailPayload.spec.ts`
- Modify: `/Users/abc/project/mga/apps/frontend/src/pages/posts/[slug].vue`
- Test: `/Users/abc/project/mga/apps/frontend/src/composables/postDetailPayload.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('loads post review aggregate and the latest post reviews during SSR', async () => {
  const bySlug = vi.fn(async () => ({ id: 44, title: 'Bai viet' }));
  const getPostAggregateRating = vi.fn(async () => ({
    averageRating: '4.7',
    totalReviews: 9,
  }));
  const list = vi.fn(async () => ({
    data: [{ id: 1, authorName: 'Nguyen Van C', rating: 5, translations: [{ locale: 'vi', content: 'Rat huu ich' }] }],
  }));

  const result = await fetchPostDetailPayload({
    slug: 'bai-viet',
    locale: 'vi',
    trpc: {
      post: { bySlug: { query: bySlug } },
      review: {
        getPostAggregateRating: { query: getPostAggregateRating },
        list: { query: list },
      },
    },
  });

  expect(getPostAggregateRating).toHaveBeenCalledWith({ postId: 44 });
  expect(list).toHaveBeenCalledWith({ postId: 44, locale: 'vi', limit: 3, sortBy: 'latest' });
  expect(result.postReviews).toHaveLength(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/abc/project/mga/apps/frontend && npx vitest run src/composables/postDetailPayload.spec.ts`
Expected: FAIL because the payload module does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export async function fetchPostDetailPayload(input: {
  slug: string;
  locale: string;
  trpc: PostDetailPayloadDependencies;
}): Promise<PostDetailPayload> {
  const post = await input.trpc.post.bySlug.query({
    slug: input.slug,
    locale: input.locale,
  });

  const postReviewAggregate = post?.id
    ? await input.trpc.review.getPostAggregateRating.query({ postId: post.id })
    : null;

  const postReviews = post?.id
    ? (await input.trpc.review.list.query({
        postId: post.id,
        locale: input.locale,
        limit: 3,
        sortBy: 'latest',
      })).data ?? []
    : [];

  return { post, postReviewAggregate, postReviews };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/abc/project/mga/apps/frontend && npx vitest run src/composables/postDetailPayload.spec.ts`
Expected: PASS

### Task 4: Add post review form and section UI

**Files:**
- Create: `/Users/abc/project/mga/apps/frontend/src/components/post/PostReviewForm.vue`
- Create: `/Users/abc/project/mga/apps/frontend/src/components/post/PostReviewForm.spec.ts`
- Create: `/Users/abc/project/mga/apps/frontend/src/components/post/PostReviewsSection.vue`
- Modify: `/Users/abc/project/mga/apps/frontend/src/pages/posts/[slug].vue`
- Test: `/Users/abc/project/mga/apps/frontend/src/components/post/PostReviewForm.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('submits post reviews without serviceTypeId and emits success', async () => {
  const mutate = vi.fn(async () => ({ id: 99 }));
  // mount form with postId=44
  // fill fields and submit
  expect(mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      postId: 44,
      serviceTypeId: undefined,
    }),
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/abc/project/mga/apps/frontend && npx vitest run src/components/post/PostReviewForm.spec.ts`
Expected: FAIL because the post review form does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```vue
<PostReviewForm
  :post-id="postId"
  :locale="locale"
  @success="handleSubmitSuccess"
  @error="handleSubmitError"
/>
```

Use the existing product/service review form pattern, but submit:

```ts
await trpc.review.submitReview.mutate({
  authorName: form.authorName,
  profession: form.profession || undefined,
  rating: form.rating,
  postId: props.postId,
  translations: [
    {
      locale: props.locale || 'vi',
      title: form.title || undefined,
      content: form.content,
    },
  ],
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/abc/project/mga/apps/frontend && npx vitest run src/components/post/PostReviewForm.spec.ts`
Expected: PASS

### Task 5: Verify the integrated slice

**Files:**
- Modify: `/Users/abc/project/mga/apps/frontend/src/pages/posts/[slug].vue`
- Test: `/Users/abc/project/mga/apps/backend/src/modules/trpc/routers/review.router.spec.ts`
- Test: `/Users/abc/project/mga/apps/backend/src/modules/review/frontend/services/frontend-review.service.spec.ts`
- Test: `/Users/abc/project/mga/apps/frontend/src/composables/postDetailPayload.spec.ts`
- Test: `/Users/abc/project/mga/apps/frontend/src/components/post/PostReviewForm.spec.ts`

- [ ] **Step 1: Run the focused backend tests**

Run: `cd /Users/abc/project/mga && npx vitest run apps/backend/src/modules/trpc/routers/review.router.spec.ts apps/backend/src/modules/review/frontend/services/frontend-review.service.spec.ts`
Expected: PASS

- [ ] **Step 2: Run the focused frontend tests**

Run: `cd /Users/abc/project/mga/apps/frontend && npx vitest run src/composables/postDetailPayload.spec.ts src/components/post/PostReviewForm.spec.ts`
Expected: PASS

- [ ] **Step 3: Run one page-adjacent regression test if available**

Run: `cd /Users/abc/project/mga/apps/frontend && npx vitest run src/composables/productDetailPayload.spec.ts src/composables/serviceDetailPayload.spec.ts`
Expected: PASS

- [ ] **Step 4: Review the rendered post page wiring**

Check that `/Users/abc/project/mga/apps/frontend/src/pages/posts/[slug].vue` now:

```ts
const postReviewAggregate = computed(() => payload.value?.postReviewAggregate ?? null);
const postReviews = computed(() => payload.value?.postReviews ?? []);
```

and renders:

```vue
<PostReviewsSection
  v-if="postId"
  :post-id="postId"
  :reviews="postReviews"
  :locale="locale"
  :average-rating="postReviewAggregate ? Number(postReviewAggregate.averageRating) : null"
  :total-reviews="postReviewAggregate?.totalReviews ?? null"
/>
```

- [ ] **Step 5: Summarize residual risks**

Document whether a DB migration for `post_id` still needs to be created/applied and whether Article schema review markup was intentionally left out of this slice.
