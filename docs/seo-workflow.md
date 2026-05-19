# MGA SEO Workflow

Project-specific SEO execution notes for future category/product SEO work.

## Skills

- Use `$seo` at `/Users/abc/.codex/skills/Agentic-SEO-Skill/SKILL.md` whenever the task involves SEO analysis, keyword research, metadata optimization, schema review, or SEO-driven content decisions.
- Use project env-first PostgreSQL access. Load `.env` before any DB command.

## Database Rules

- Category SEO lives in `category_translations`, not `categories`.
- Product SEO text lives in `product_translations`.
- Product media lives in `products.thumbnail` and `products.gallery`.
- Product specifications live in `product_specifications` and `product_specification_translations`.
- Keep `name`, `description`, and existing slugs unchanged unless the user explicitly asks to change them.

## Canonical Rules

- For category pages, use the real frontend route, not generic `/categories/...`.
- Current category canonical pattern:
  - `https://mgavietnam.com/danh-muc-san-pham/<slug>`

## Category SEO Workflow

1. Research current keywords using `$seo` plus live SERP checks.
2. Inspect the actual frontend route before writing canonical URLs.
3. Update only the approved SEO fields in `category_translations`.
4. Verify live HTML after DB update:
   - `<title>`
   - meta description
   - canonical
   - `og:image` / `twitter:image` when relevant

## Product SEO Workflow

1. Inspect current product data in `products` and `product_translations`.
2. If specs are missing, check trusted MGA-related references before inferring anything.
3. Prefer controlled inference only for clearly supported claims.
4. Update:
   - `short_description`
   - `content`
   - `meta_title`
   - `meta_description`
   - `meta_keywords`
   - `og_title`
   - `og_description`
   - `products.gallery` when useful
5. If specs are available from a trusted source, store them in:
   - `product_specifications`
   - `product_specification_translations`

## Image Rules

- Do not leave third-party image URLs in final product/category content.
- If an external image is selected:
  1. Download it locally.
  2. Upload it to the MGA storage target.
  3. Replace content/gallery URLs with the MGA-hosted URL.
- Current active upload target:
  - bucket: `mgamv`
  - public URL: `https://cdn.mgavietnam.com`
- Avoid using `cdn.captreonuisam.com` for new SEO/product image work on this project.

## Verified Upload Behavior

- Uploading into bucket `mgamv` with the current S3-compatible config produces public files under:
  - `https://cdn.mgavietnam.com/<key>`
- This was verified with both:
  - `rclone`
  - direct S3 `PutObject`

## Verification Checklist

- DB snapshot before and after updates
- Live page check after update
- No empty SEO title/description after update
- No broken external image URLs left in content
- New uploaded assets resolve on `cdn.mgavietnam.com`

## Notes From This Session

- Category OG images were added using related post/product media.
- Product `xe-nang-dau-mga-2-5-tan` was upgraded with:
  - rewritten SEO copy
  - gallery images
  - HTML description with images
  - technical specifications
- External reference images used during drafting were re-uploaded to MGA storage and replaced with `cdn.mgavietnam.com` URLs.
