# Article API — Frontend integration guide

Base URL (local): `http://localhost:5000`  
Auth: `Authorization: Bearer <accessToken>` on all **write** routes.  
Public **read** routes do not require auth.

Follow the same patterns as Remembrance (`docs/api/REMEMBRANCE.md`) / Off the Camera (`docs/api/OFF_THE_CAMERA.md`). Articles use **subtitle**, optional **profile**, a **gallery**, default **layout** `landscape`, and default **galleryMode** `interleave` (images woven between body paragraphs — required for the current detail design).

---

## Image storage (server)

```text
images/
  article/
    {postId}/
      hero.jpg          # or hero.webp — main card + detail hero
      profile.jpg       # optional — circular contributor photo
      gallery/
        0.jpg           # gallery item 0
        1.jpg
        …
```

Rules:

1. Create `images/article/{postId}/` on create (use Mongo `_id` / UUID).
2. Save hero as `hero.<ext>` at the post folder root.
3. Save profile photo as `profile.<ext>` when provided; omit / delete when cleared.
4. Save gallery images under `images/article/{postId}/gallery/` with stable names (`0.jpg`, `1.webp`, …) matching gallery order.
5. On hero update: replace `hero.*` only.
6. On profile update: replace `profile.*` only; if client clears profile image, delete `profile.*`.
7. On gallery update: rebuild from the payload (keep listed existing files; write new files; delete removed files).
8. On delete: remove the post document **and** the folder `images/article/{postId}/`.
9. Serve statically:

```text
{API_BASE_URL}/images/article/{postId}/hero.jpg
{API_BASE_URL}/images/article/{postId}/profile.jpg
{API_BASE_URL}/images/article/{postId}/gallery/0.jpg
```

Return paths starting with `/images/...` (or absolute URLs). The frontend prefixes `/images/` with `API_BASE_URL`.

---

## Post shape (JSON)

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "slug": "kannada-theatre-cinema-relationship",
  "image": "/images/article/66f1a2.../hero.jpg",
  "date": "",
  "order": 0,
  "title": {
    "kn": "ಕನ್ನಡ ರಂಗಭೂಮಿ ಮತ್ತು ಚಲನಚಿತ್ರಗಳ ಸಾವಯವ ಸಂಬಂಧಗಳು",
    "en": "The Organic Relationship Between Kannada Theatre and Cinema"
  },
  "subtitle": {
    "kn": "ಕೆ.ಪುಟ್ಟಸ್ವಾಮಿ, ಲೇಖಕರು",
    "en": "K. Puttaswamy, Writer"
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
    "image": "/images/article/66f1a2.../profile.jpg",
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
      "src": "/images/article/66f1a2.../gallery/0.jpg",
      "caption": {
        "kn": "",
        "en": ""
      },
      "afterParagraph": 3
    }
  ],
  "photoCredit": {
    "kn": "",
    "en": ""
  },
  "courtesy": {
    "kn": "",
    "en": ""
  },
  "layout": "landscape",
  "galleryMode": "interleave",
  "createdAt": "2026-08-23T10:00:00.000Z",
  "updatedAt": "2026-08-23T10:00:00.000Z"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Admin update/delete/reorder |
| `slug` | yes | Unique; `/article/:slug` |
| `image` | yes after create | Hero / grid / home / footer |
| `order` | yes | Integer; **lower = earlier**. Sort ASC everywhere |
| `title.kn` / `title.en` | yes | Admin search matches either |
| `subtitle.kn` / `subtitle.en` | yes | Shown under title (often author byline) |
| `body.kn` / `body.en` | yes | Split paragraphs on `\n+` |
| `category.kn` / `category.en` | optional | Detail category row |
| `profile` | optional | Omit or `null` when unused |
| `profile.image` | optional | Contributor circle photo |
| `profile.name.kn` / `.en` | optional | Shown under photo |
| `profile.role.kn` / `.en` | optional | Role under name |
| `profile.intro.kn` / `.en` | optional | Intro beside photo |
| `gallery` | optional | Array; may be `[]` — often many images for interleave |
| `gallery[].src` | yes if item present | Gallery image URL |
| `gallery[].caption.kn` / `.en` | optional | Empty string OK |
| `gallery[].afterParagraph` | optional | 1-based: show this image **after** that English body paragraph when `galleryMode` is `interleave`. Several images may share the same N (they stack in gallery order). Omit on old posts to keep even-spread interleave. |
| `photoCredit.kn` / `.en` | optional | “Photos / ಫೋಟೊಗಳು” |
| `courtesy.kn` / `.en` | optional | “Information courtesy / ಮಾಹಿತಿ ಕೃಪೆ” |
| `layout` | optional | Default `landscape`. Also: `banner`, `poster`, `overlap` |
| `galleryMode` | optional | Default **`interleave`** (matches current Article UI). Also: `stack`, `carousel` |
| `date` | optional | Stored; often empty |

### Sorting

- List sorted by `order` ascending.
- Detail `prev` / `next` / `related` (up to **4**) follow the same order.
- On create: `order = max(order) + 1` (append).

---

## 1. List posts (public + admin)

**GET** `/article`

### Success — `200`

```json
{
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

Admin search + load-more are frontend-only on this full list.

---

## 2. Get post by slug (public)

**GET** `/article/:slug`

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

**POST** `/article`  
`Content-Type: multipart/form-data`  
`Authorization: Bearer <accessToken>`

### Form fields

| Key | Type | Required |
|-----|------|----------|
| `slug` | string | yes |
| `date` | string | no |
| `titleEn` | string | yes |
| `titleKn` | string | yes |
| `subtitleEn` | string | yes |
| `subtitleKn` | string | yes |
| `bodyEn` | string | yes |
| `bodyKn` | string | yes |
| `categoryEn` | string | no |
| `categoryKn` | string | no |
| `photoCreditEn` | string | no |
| `photoCreditKn` | string | no |
| `courtesyEn` | string | no |
| `courtesyKn` | string | no |
| `layout` | string | no — default `landscape` |
| `galleryMode` | string | no — default `interleave` |
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
    "src": "/images/article/.../gallery/0.jpg",
    "captionEn": "…",
    "captionKn": "…",
    "afterParagraph": 3
  },
  {
    "kind": "new",
    "fileIndex": 0,
    "captionEn": "…",
    "captionKn": "…",
    "afterParagraph": 5
  }
]
```

- `kind: "existing"` — keep this file; update captions / `afterParagraph` from the object.
- `kind: "new"` — take `gallery` file at `fileIndex` (0-based among `gallery` files).
- `afterParagraph` — optional integer; persist on the gallery item (see field table).
- Omit any old gallery `src` that should be deleted from disk.
- Rebuild `images/article/{id}/gallery/` to match this order (re-number files if needed).

### Profile persistence

- If any profile text field is non-empty **or** a `profileImage` file is uploaded, store a `profile` object.
- If all profile text fields are empty and there is no profile image, store `profile: null`.
- Profile image URL goes in `profile.image`.

### Success — `201`

```json
{
  "message": "Article post created",
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

**PUT** `/article/:id`  
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
  "message": "Article post updated",
  "post": { /* Post shape */ }
}
```

---

## 5. Delete post (admin)

**DELETE** `/article/:id`  
`Authorization: Bearer <accessToken>`

### Success — `200`

```json
{ "message": "Article post deleted" }
```

Delete `images/article/{id}/` from disk.

---

## 6. Reorder posts (admin)

**PUT** `/article/reorder`  
`Content-Type: application/json`  
`Authorization: Bearer <accessToken>`

```json
{
  "orderedIds": ["id-first", "id-second", "id-third"]
}
```

Rules:

1. Must list **every** article post id exactly once.
2. Set `order = index` (0 = first on public site).
3. Return full list sorted by new order.

### Success — `200`

```json
{
  "message": "Article order updated",
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Invalid / incomplete `orderedIds` |
| `401` | Unauthorized |

**Route note:** Register `/article/reorder` **before** `/article/:slug`.

---

## Admin UI behaviour (frontend only)

| Feature | Behaviour |
|---------|-----------|
| Search | Filter by `title.en` **or** `title.kn` |
| Load more | 9 cards (3×3), then next 9 |
| Arrange | Drawer drag-and-drop → **PUT** `/article/reorder` |

Public design is unchanged: same `PostGrid` / `RemembranceDetail` components; only the data source becomes the API. Keep `subtitle` / `profile` / `layout` / `galleryMode: interleave` so the existing detail UI continues to render correctly.

---

## Frontend routes that consume this API

| UI | Method | Path |
|----|--------|------|
| Public list `/article` | GET | `/article` |
| Public detail `/article/:slug` | GET | `/article/:slug` |
| Home Article slice | GET | `/article` |
| Footer Articles slice | GET | `/article` |
| Admin list `/admin/article` | GET | `/article` |
| Admin create | POST | `/article` |
| Admin edit | PUT | `/article/:id` |
| Admin delete | DELETE | `/article/:id` |
| Admin Arrange | PUT | `/article/reorder` |

---

## CORS / static files

- CORS for Vite origin (e.g. `http://localhost:5173`).
- Mount `/images` → disk `images/` folder.
