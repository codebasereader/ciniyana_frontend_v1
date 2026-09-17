# Poster Info API — Frontend integration guide

Base URL (local): `http://localhost:5000`  
Auth: `Authorization: Bearer <accessToken>` on all **write** routes.  
Public **read** routes do not require auth.

Poster Info is **image-led**: masonry grid + lightbox on the public site (no detail page). Follow the same CRUD / reorder patterns as Flash Back (`docs/api/FLASHBACK.md`).

**Admin fields are only:** one image + English title + Kannada title.  
**No** body, subtitle, date, category, profile, gallery, photo credit, or layout picker. Default **layout** `poster`. Slug is generated from the English title.

---

## Image storage (server)

```text
images/
  poster/
    {postId}/
      hero.jpg          # or hero.webp / .jpeg — masonry + lightbox
```

Rules:

1. Create `images/poster/{postId}/` on create (use Mongo `_id` / UUID).
2. Save the poster image as `hero.<ext>` at the post folder root.
3. On image update: replace `hero.*` only.
4. On delete: remove the post document **and** the folder `images/poster/{postId}/`.
5. Serve statically:

```text
{API_BASE_URL}/images/poster/{postId}/hero.jpg
```

Return paths starting with `/images/...` (or absolute URLs). The frontend prefixes `/images/` with `API_BASE_URL`.

---

## Post shape (JSON)

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "slug": "chomana-dudi",
  "image": "/images/poster/66f1a2.../hero.jpg",
  "order": 0,
  "title": {
    "kn": "ಚೋಮನ ದುಡಿ",
    "en": "Chomana Dudi"
  },
  "layout": "poster",
  "createdAt": "2026-08-23T10:00:00.000Z",
  "updatedAt": "2026-08-23T10:00:00.000Z"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Admin update/delete/reorder |
| `slug` | yes | Unique; auto from English title on create. Do not change on update unless the client sends a new slug |
| `image` | yes after create | Masonry + lightbox |
| `order` | yes | Integer; **lower = earlier**. Sort ASC everywhere |
| `title.kn` / `title.en` | yes | Shown on the masonry card and lightbox |
| `layout` | optional | Default `poster` |

**Do not require** `body`, `date`, `category`, `subtitle`, `profile`, `gallery`, `photoCredit`, or `courtesy`. Extra fields may be stored but the frontend ignores them.

### Sorting

- List sorted by `order` ascending (masonry / lightbox order).
- On create: `order = max(order) + 1` (append).

---

## 1. List posts (public + admin)

**GET** `/poster`

### Success — `200`

```json
{
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

Admin search + load-more are frontend-only on this full list.

---

## 2. Get post by slug (public)

**GET** `/poster/:slug`

Optional. The current public UI only uses the list + lightbox.

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

**POST** `/poster`  
`Content-Type: multipart/form-data`  
`Authorization: Bearer <accessToken>`

### Form fields

| Key | Type | Required |
|-----|------|----------|
| `slug` | string | yes — frontend sends a slug from the English title |
| `titleEn` | string | yes |
| `titleKn` | string | yes |
| `layout` | string | no — default `poster` |
| `image` | file | yes (poster image) |

If `slug` is omitted, generate one from `titleEn` (lowercase, hyphens). If that slug already exists, return `409` or append a short suffix.

### Success — `201`

```json
{
  "message": "Poster post created",
  "post": { /* Post shape */ }
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Missing title or image |
| `401` | Unauthorized |
| `409` | Slug exists |
| `500` | Server / upload error |

---

## 4. Update post (admin)

**PUT** `/poster/:id`  
`Content-Type: multipart/form-data`  
`Authorization: Bearer <accessToken>`

Same text fields as create.  
**`image` optional** — omit to keep current poster image.

Do **not** change `order` here — use reorder.

### Success — `200`

```json
{
  "message": "Poster post updated",
  "post": { /* Post shape */ }
}
```

---

## 5. Delete post (admin)

**DELETE** `/poster/:id`  
`Authorization: Bearer <accessToken>`

### Success — `200`

```json
{ "message": "Poster post deleted" }
```

Delete `images/poster/{id}/` from disk.

---

## 6. Reorder posts (admin)

**PUT** `/poster/reorder`  
`Content-Type: application/json`  
`Authorization: Bearer <accessToken>`

```json
{
  "orderedIds": ["id-first", "id-second", "id-third"]
}
```

Rules:

1. Must list **every** poster post id exactly once.
2. Set `order = index` (0 = first in masonry / lightbox).
3. Return full list sorted by new order.

### Success — `200`

```json
{
  "message": "Poster order updated",
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Invalid / incomplete `orderedIds` |
| `401` | Unauthorized |

**Route note:** Register `/poster/reorder` **before** `/poster/:slug`.

---

## Admin UI behaviour (frontend only)

| Feature | Behaviour |
|---------|-----------|
| Form | Poster image + Title (English) + Title (Kannada) only |
| Search | Filter by `title.en` **or** `title.kn` |
| Load more | 9 cards (3×3), then next 9 |
| Arrange | Drawer drag-and-drop → **PUT** `/poster/reorder` |

Public design is unchanged: masonry + lightbox show the image and the language title.

---

## Frontend routes that consume this API

| UI | Method | Path |
|----|--------|------|
| Public list `/poster` | GET | `/poster` |
| Admin list `/admin/poster` | GET | `/poster` |
| Admin create | POST | `/poster` |
| Admin edit | PUT | `/poster/:id` |
| Admin delete | DELETE | `/poster/:id` |
| Admin Arrange | PUT | `/poster/reorder` |

---

## CORS / static files

- CORS for Vite origin (e.g. `http://localhost:5173`).
- Mount `/images` → disk `images/` folder.
