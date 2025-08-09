# Blog content authoring guide (React + JSON)

This project renders marketing blog pages from JSON files under `src/content/blog/**`.

## Directory
- `src/content/blog/{slug}.json`
- Referenced by:
  - List page: `src/views/marketing/Blog.tsx` (auto-imports all JSON via Vite glob)
  - Detail page: `src/views/marketing/BlogDetail.tsx` (maps `slug` to JSON)

## JSON schema
Minimal example:
```json
{
  "slug": "my-first-post",
  "title": "My first post",
  "category": "AI Technology",
  "date": "January 1, 2025",
  "readTime": "5 min read",
  "author": { "name": "Focal Meet Team", "role": "Marketing" },
  "sections": [
    { "id": "intro", "type": "h2", "text": "Introduction" },
    { "type": "p", "text": "This is the opening paragraph..." },
    { "type": "ul", "items": ["Point A", "Point B"] },
    { "type": "quote", "text": "A great quote.", "cite": "Someone" },
    { "type": "callout", "title": "Key Takeaway", "text": "Remember this." }
  ]
}
```

Supported section types:
- `h2` / `h3` with optional `id` and `text`
- `p` paragraph with `text`
- `ul` unordered list with `items: string[]`
- `ol` ordered list with `items: string[]`
- `quote` with `text` and optional `cite`
- `callout` with `title` and `text`
- `cards` with `items: { title, text }[]`

## How to add a new article
1. Create a JSON file `src/content/blog/{slug}.json` using the schema above.
2. Ensure `slug` matches the filename (without extension).
3. Start dev: `npm run dev`. List page will auto-pick it up; detail page is available at `/blog/{slug}`.

## Notes
- Styling is controlled by existing marketing CSS; keep to text content in JSON.
- For images, use placeholders or extend the schema to include image URLs; render in `BlogDetail.tsx` as needed.
- If you need i18n later, place localized variants under `src/content/blog/{lang}/{slug}.json` and adjust the glob accordingly.

