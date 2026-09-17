# Photo Story API — Frontend integration guide

Base URL (local): `http://localhost:5000`  
Auth: `Authorization: Bearer <accessToken>` on all **write** routes.  
Public **read** routes do not require auth.

Follow the same patterns as Remembrance (`docs/api/REMEMBRANCE.md`), with **no subtitle** and **no profile**. Optional **gallery** + **photoCredit**; default **layout** `landscape`.

---

## Image storage (server)

```text
images/
  photo-story/
    {postId}/
      hero.jpg          # or hero.webp — main card + detail hero
      gallery/
        0.jpg           # gallery item 0
        1.jpg
        …
```

Rules:

1. Create `images/photo-story/{postId}/` on create (use Mongo `_id` / UUID).
2. Save hero as `hero.<ext>` at the post folder root.
3. Save gallery images under `images/photo-story/{postId}/gallery/` with stable names (`0.jpg`, `1.webp`, …) matching gallery order.
4. On hero update: replace `hero.*` only.
5. On gallery update: rebuild from the payload (keep listed existing files; write new files; delete removed files).
6. On delete: remove the post document **and** the folder `images/photo-story/{postId}/`.
7. Serve statically:

```text
{API_BASE_URL}/images/photo-story/{postId}/hero.jpg
{API_BASE_URL}/images/photo-story/{postId}/gallery/0.jpg
```

Return paths starting with `/images/...` (or absolute URLs). The frontend prefixes `/images/` with `API_BASE_URL`.

---

## Post shape (JSON)

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "slug": "sync-sound-recording",
  "image": "/images/photo-story/66f1a2.../hero.jpg",
  "date": "",
  "order": 0,
  "title": {
    "kn": "ಸ್ಪಾಟ್ ರೆಕಾರ್ಡಿಂಗ್ ಹೇಗಾಗುತ್ತಿತ್ತು?",
    "en": "How Was Sync Sound Recording Done on Film Sets?"
  },
  "body": {
    "kn": "ಪ್ಯಾರಾ 1...\n\nಪ್ಯಾರಾ 2...",
    "en": "Paragraph 1...\n\nParagraph 2..."
  },
  "category": {
    "kn": "ಕನ್ನಡ ಸಿನಿಮಾ",
    "en": "Kannada Cinema"
  },
  "gallery": [
    {
      "src": "/images/photo-story/66f1a2.../gallery/0.jpg",
      "caption": {
        "kn": "ಕನ್ನಡ ಕ್ಯಾಪ್ಷನ್",
        "en": "English caption"
      }
    }
  ],
  "photoCredit": {
    "kn": "ಪ್ರಗತಿ ಅಶ್ವತ್ಥ ನಾರಾಯಣ",
    "en": "Pragathi Ashwathanarayana"
  },
  "courtesy": {
    "kn": "",
    "en": ""
  },
  "layout": "landscape",
  "galleryMode": "stack",
  "createdAt": "2026-08-23T10:00:00.000Z",
  "updatedAt": "2026-08-23T10:00:00.000Z"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Admin update/delete/reorder |
| `slug` | yes | Unique; `/photo-story/:slug` |
| `image` | yes after create | Hero / grid / home |
| `order` | yes | Integer; **lower = earlier**. Sort ASC everywhere |
| `title.kn` / `title.en` | yes | Admin search matches either |
| `body.kn` / `body.en` | yes | Split paragraphs on `\n+` |
| `category.kn` / `category.en` | optional | Detail category row |
| `gallery` | optional | Array; may be `[]` |
| `gallery[].src` | yes if item present | Gallery image URL |
| `gallery[].caption.kn` / `.en` | optional | Empty string OK |
| `photoCredit.kn` / `.en` | optional | “Photos / ಫೋಟೊಗಳು” |
| `courtesy.kn` / `.en` | optional | “Information courtesy / ಮಾಹಿತಿ ಕೃಪೆ” |
| `layout` | optional | Default `landscape`. Also: `banner`, `poster` |
| `galleryMode` | optional | Default `stack`. Also: `carousel`, `interleave` |
| `date` | optional | Stored; often empty for Photo Story |

**Do not require** `subtitle` or `profile` for Photo Story.

### Sorting

- List sorted by `order` ascending.
- Detail `prev` / `next` / `related` (up to **4**) follow the same order.
- On create: `order = max(order) + 1` (append).

---

## 1. List posts (public + admin)

**GET** `/photo-story`

### Success — `200`

```json
{
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

Admin search + load-more are frontend-only on this full list.

---

## 2. Get post by slug (public)

**GET** `/photo-story/:slug`

### Success — `200`

```json
{
  "post": { /* Post shape */ },
  "prev": { /* or null */ },
  "next": { /* or null */ },
  "related": [ /* up to 4 other posts */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `404` | Unknown slug |

---

## 3. Create post (admin)

**POST** `/photo-story`  
`Content-Type: multipart/form-data`  
`Authorization: Bearer <accessToken>`

### Form fields

| Key | Type | Required |
|-----|------|----------|
| `slug` | string | yes |
| `date` | string | no |
| `titleEn` | string | yes |
| `titleKn` | string | yes |
| `bodyEn` | string | yes |
| `bodyKn` | string | yes |
| `categoryEn` | string | no |
| `categoryKn` | string | no |
| `photoCreditEn` | string | no |
| `photoCreditKn` | string | no |
| `courtesyEn` | string | no |
| `courtesyKn` | string | no |
| `layout` | string | no — default `landscape` |
| `galleryMode` | string | no — default `stack` |
| `image` | file | yes (hero) |
| `gallery` | file[] | no — new gallery files only, in `fileIndex` order |
| `galleryOrder` | string (JSON) | yes — final gallery sequence (see below) |

### `galleryOrder` JSON

Describes the **final** gallery in display order. Mix existing and new freely:

```json
[
  {
    "kind": "existing",
    "src": "/images/photo-story/.../gallery/0.jpg",
    "captionEn": "…",
    "captionKn": "…"
  },
  {
    "kind": "new",
    "fileIndex": 0,
    "captionEn": "…",
    "captionKn": "…"
  }
]
```

- `kind: "existing"` — keep this file; update captions from the object.
- `kind: "new"` — take `gallery` file at `fileIndex` (0-based among `gallery` files).
- Omit any old gallery `src` that should be deleted from disk.
- Rebuild `images/photo-story/{id}/gallery/` to match this order (re-number files if needed).

### Success — `201`

```json
{
  "message": "Photo Story post created",
  "post": { /* Post shape */ }
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Missing required fields / no hero image |
| `401` | Unauthorized |
| `409` | Slug exists |
| `500` | Server / upload error |

---

## 4. Update post (admin)

**PUT** `/photo-story/:id`  
`Content-Type: multipart/form-data`  
`Authorization: Bearer <accessToken>`

Same text fields as create.  
**`image` optional** — omit to keep hero.  
Same `gallery` + `galleryOrder` rules as create (empty `galleryOrder` `[]` clears the gallery).

Do **not** change `order` here — use reorder.

### Success — `200`

```json
{
  "message": "Photo Story post updated",
  "post": { /* Post shape */ }
}
```

---

## 5. Delete post (admin)

**DELETE** `/photo-story/:id`  
`Authorization: Bearer <accessToken>`

### Success — `200`

```json
{ "message": "Photo Story post deleted" }
```

Delete `images/photo-story/{id}/` from disk.

---

## 6. Reorder posts (admin)

**PUT** `/photo-story/reorder`  
`Content-Type: application/json`  
`Authorization: Bearer <accessToken>`

```json
{
  "orderedIds": ["id-first", "id-second", "id-third"]
}
```

Rules:

1. Must list **every** photo-story post id exactly once.
2. Set `order = index` (0 = first on public site).
3. Return full list sorted by new order.

### Success — `200`

```json
{
  "message": "Photo Story order updated",
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Invalid / incomplete `orderedIds` |
| `401` | Unauthorized |

**Route note:** Register `/photo-story/reorder` **before** `/photo-story/:slug`.

---

## Admin UI behaviour (frontend only)

| Feature | Behaviour |
|---------|-----------|
| Search | Filter by `title.en` **or** `title.kn` |
| Load more | 9 cards (3×3), then next 9 |
| Arrange | Drawer drag-and-drop → **PUT** `/photo-story/reorder` |

Public design is unchanged: same `PostGrid` / `RemembranceDetail` components; only the data source becomes the API. Keep `layout` / `galleryMode` so the existing detail UI continues to render correctly.

---

## Frontend routes that consume this API

| UI | Method | Path |
|----|--------|------|
| Public list `/photo-story` | GET | `/photo-story` |
| Public detail `/photo-story/:slug` | GET | `/photo-story/:slug` |
| Home Photo Story slice | GET | `/photo-story` |
| Admin list `/admin/photo-story` | GET | `/photo-story` |
| Admin create | POST | `/photo-story` |
| Admin edit | PUT | `/photo-story/:id` |
| Admin delete | DELETE | `/photo-story/:id` |
| Admin Arrange | PUT | `/photo-story/reorder` |

---

## CORS / static files

- CORS for Vite origin (e.g. `http://localhost:5173`).
- Mount `/images` → disk `images/` folder.
