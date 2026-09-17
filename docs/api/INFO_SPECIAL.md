# Info Special API — Frontend integration guide

Base URL (local): `http://localhost:5000`  
Auth: `Authorization: Bearer <accessToken>` on all **write** routes.  
Public **read** routes do not require auth.

Follow the same patterns as Remembrance (`docs/api/REMEMBRANCE.md`), with extra fields for optional **profile** (contributor card), **layout**, and **galleryMode**. Info Special has **no subtitle**.

---

## Image storage (server)

```text
images/
  info-special/
    {postId}/
      hero.jpg          # or hero.webp — main card + detail hero
      profile.jpg       # optional — circular contributor photo
      gallery/
        0.jpg           # gallery item 0
        1.jpg
        …
```

Rules:

1. Create `images/info-special/{postId}/` on create (use Mongo `_id` / UUID).
2. Save hero as `hero.<ext>` at the post folder root.
3. Save profile photo as `profile.<ext>` when provided; omit / delete when cleared.
4. Save gallery images under `images/info-special/{postId}/gallery/` with stable names (`0.jpg`, `1.webp`, …) matching gallery order.
5. On hero update: replace `hero.*` only.
6. On profile update: replace `profile.*` only; if client clears profile image, delete `profile.*`.
7. On gallery update: rebuild from the payload (keep listed existing files; write new files; delete removed files).
8. On delete: remove the post document **and** the folder `images/info-special/{postId}/`.
9. Serve statically:

```text
{API_BASE_URL}/images/info-special/{postId}/hero.jpg
{API_BASE_URL}/images/info-special/{postId}/profile.jpg
{API_BASE_URL}/images/info-special/{postId}/gallery/0.jpg
```

Return paths starting with `/images/...` (or absolute URLs). The frontend prefixes `/images/` with `API_BASE_URL`.

---

## Post shape (JSON)

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "slug": "chamundeshwari-studio",
  "image": "/images/info-special/66f1a2.../hero.jpg",
  "date": "",
  "order": 0,
  "title": {
    "kn": "ಶಿಸ್ತಿನ ಮಾಲೀಕರ ಸುಸಜ್ಜಿತ ಚಾಮುಂಡೇಶ್ವರಿ ಸ್ಟುಡಿಯೋ",
    "en": "The Well-Equipped Chamundeshwari Studio, Run by a Strict Owner"
  },
  "body": {
    "kn": "ಪ್ಯಾರಾ 1...\n\nಪ್ಯಾರಾ 2...",
    "en": "Paragraph 1...\n\nParagraph 2..."
  },
  "category": {
    "kn": "ಕನ್ನಡ ಸಿನಿಮಾ",
    "en": "Kannada Cinema"
  },
  "profile": {
    "image": "/images/info-special/66f1a2.../profile.jpg",
    "name": {
      "kn": "ಹೊನ್ನವಳ್ಳಿ ಕೃಷ್ಣ",
      "en": "Honnavalli Krishna"
    },
    "role": {
      "kn": "ನಟ",
      "en": "Actor"
    },
    "intro": {
      "kn": "ಪರಿಚಯ ಪಠ್ಯ…",
      "en": "Intro text…"
    }
  },
  "gallery": [
    {
      "src": "/images/info-special/66f1a2.../gallery/0.jpg",
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
    "kn": "ಮಾಹಿತಿ ಕೃಪೆ ಪಠ್ಯ",
    "en": "Information courtesy text"
  },
  "layout": "landscape",
  "galleryMode": "carousel",
  "createdAt": "2026-08-23T10:00:00.000Z",
  "updatedAt": "2026-08-23T10:00:00.000Z"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Admin update/delete/reorder |
| `slug` | yes | Unique; `/info-special/:slug` |
| `image` | yes after create | Hero / grid / home |
| `order` | yes | Integer; **lower = earlier**. Sort ASC everywhere |
| `title.kn` / `title.en` | yes | Admin search matches either |
| `body.kn` / `body.en` | yes | Split paragraphs on `\n+` |
| `category.kn` / `category.en` | optional | Detail category row |
| `profile` | optional | Omit or `null` when unused |
| `profile.image` | optional | Contributor circle photo |
| `profile.name.kn` / `.en` | optional | Shown under photo |
| `profile.role.kn` / `.en` | optional | Role under name |
| `profile.intro.kn` / `.en` | optional | Intro beside photo |
| `gallery` | optional | Array; may be `[]` |
| `gallery[].src` | yes if item present | Gallery image URL |
| `gallery[].caption.kn` / `.en` | optional | Empty string OK |
| `photoCredit.kn` / `.en` | optional | “Photos / ಫೋಟೊಗಳು” |
| `courtesy.kn` / `.en` | optional | “Information courtesy / ಮಾಹಿತಿ ಕೃಪೆ” |
| `layout` | optional | Default `landscape`. Also: `banner`, `poster` |
| `galleryMode` | optional | Default `carousel`. Also: `stack`, `interleave` |
| `date` | optional | Stored; often empty for Info Special |

**Do not require** `subtitle` for Info Special (unlike Remembrance).

### Sorting

- List sorted by `order` ascending.
- Detail `prev` / `next` / `related` (up to **4**) follow the same order.
- On create: `order = max(order) + 1` (append).

---

## 1. List posts (public + admin)

**GET** `/info-special`

### Success — `200`

```json
{
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

Admin search + load-more are frontend-only on this full list.

---

## 2. Get post by slug (public)

**GET** `/info-special/:slug`

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

**POST** `/info-special`  
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
| `galleryMode` | string | no — default `carousel` |
| `profileNameEn` | string | no |
| `profileNameKn` | string | no |
| `profileRoleEn` | string | no |
| `profileRoleKn` | string | no |
| `profileIntroEn` | string | no |
| `profileIntroKn` | string | no |
| `image` | file | yes (hero) |
| `profileImage` | file | no — contributor photo |
| `gallery` | file[] | no — new gallery files only, in `fileIndex` order |
| `galleryOrder` | string (JSON) | yes — final gallery sequence (see below) |

### `galleryOrder` JSON

Describes the **final** gallery in display order. Mix existing and new freely:

```json
[
  {
    "kind": "existing",
    "src": "/images/info-special/.../gallery/0.jpg",
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
- Rebuild `images/info-special/{id}/gallery/` to match this order (re-number files if needed).

### Profile persistence

- If any profile text field is non-empty **or** a `profileImage` file is uploaded, store a `profile` object.
- If all profile text fields are empty and there is no profile image, store `profile: null`.
- Profile image URL goes in `profile.image`.

### Success — `201`

```json
{
  "message": "Info Special post created",
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

**PUT** `/info-special/:id`  
`Content-Type: multipart/form-data`  
`Authorization: Bearer <accessToken>`

Same text fields as create.  
**`image` optional** — omit to keep hero.  
**`profileImage` optional** — omit to keep existing profile photo.  
Same `gallery` + `galleryOrder` rules as create (empty `galleryOrder` `[]` clears the gallery).

Also accept:

| Key | Type | Notes |
|-----|------|--------|
| `clearProfileImage` | string `"true"` | Delete existing `profile.*` from disk and clear `profile.image` |

Do **not** change `order` here — use reorder.

### Success — `200`

```json
{
  "message": "Info Special post updated",
  "post": { /* Post shape */ }
}
```

---

## 5. Delete post (admin)

**DELETE** `/info-special/:id`  
`Authorization: Bearer <accessToken>`

### Success — `200`

```json
{ "message": "Info Special post deleted" }
```

Delete `images/info-special/{id}/` from disk.

---

## 6. Reorder posts (admin)

**PUT** `/info-special/reorder`  
`Content-Type: application/json`  
`Authorization: Bearer <accessToken>`

```json
{
  "orderedIds": ["id-first", "id-second", "id-third"]
}
```

Rules:

1. Must list **every** info-special post id exactly once.
2. Set `order = index` (0 = first on public site).
3. Return full list sorted by new order.

### Success — `200`

```json
{
  "message": "Info Special order updated",
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Invalid / incomplete `orderedIds` |
| `401` | Unauthorized |

**Route note:** Register `/info-special/reorder` **before** `/info-special/:slug`.

---

## Admin UI behaviour (frontend only)

| Feature | Behaviour |
|---------|-----------|
| Search | Filter by `title.en` **or** `title.kn` |
| Load more | 9 cards (3×3), then next 9 |
| Arrange | Drawer drag-and-drop → **PUT** `/info-special/reorder` |

Public design is unchanged: same `PostGrid` / `RemembranceDetail` components; only the data source becomes the API. Keep `layout` / `galleryMode` / `profile` so the existing detail UI continues to render correctly.

---

## Frontend routes that consume this API

| UI | Method | Path |
|----|--------|------|
| Public list `/info-special` | GET | `/info-special` |
| Public detail `/info-special/:slug` | GET | `/info-special/:slug` |
| Home Info Special slice | GET | `/info-special` |
| Admin list `/admin/info-special` | GET | `/info-special` |
| Admin create | POST | `/info-special` |
| Admin edit | PUT | `/info-special/:id` |
| Admin delete | DELETE | `/info-special/:id` |
| Admin Arrange | PUT | `/info-special/reorder` |

---

## CORS / static files

- CORS for Vite origin (e.g. `http://localhost:5173`).
- Mount `/images` → disk `images/` folder.
