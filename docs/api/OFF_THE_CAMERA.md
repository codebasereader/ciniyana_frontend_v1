# Off the Camera API — Frontend integration guide

Base URL (local): `http://localhost:5000`  
Auth: `Authorization: Bearer <accessToken>` on all **write** routes.  
Public **read** routes do not require auth.

Follow the same patterns as Remembrance (`docs/api/REMEMBRANCE.md`), with optional **profile** (contributor card) like Info Special. Includes **subtitle**. Default **layout** is `overlap` (same visual as the default overlapping hero).

---

## Image storage (server)

```text
images/
  off-the-camera/
    {postId}/
      hero.jpg          # or hero.webp — main card + detail hero
      profile.jpg       # optional — circular contributor photo
      gallery/
        0.jpg           # gallery item 0
        1.jpg
        …
```

Rules:

1. Create `images/off-the-camera/{postId}/` on create (use Mongo `_id` / UUID).
2. Save hero as `hero.<ext>` at the post folder root.
3. Save profile photo as `profile.<ext>` when provided; omit / delete when cleared.
4. Save gallery images under `images/off-the-camera/{postId}/gallery/` with stable names (`0.jpg`, `1.webp`, …) matching gallery order.
5. On hero update: replace `hero.*` only.
6. On profile update: replace `profile.*` only; if client clears profile image, delete `profile.*`.
7. On gallery update: rebuild from the payload (keep listed existing files; write new files; delete removed files).
8. On delete: remove the post document **and** the folder `images/off-the-camera/{postId}/`.
9. Serve statically:

```text
{API_BASE_URL}/images/off-the-camera/{postId}/hero.jpg
{API_BASE_URL}/images/off-the-camera/{postId}/profile.jpg
{API_BASE_URL}/images/off-the-camera/{postId}/gallery/0.jpg
```

Return paths starting with `/images/...` (or absolute URLs). The frontend prefixes `/images/` with `API_BASE_URL`.

---

## Post shape (JSON)

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "slug": "tape-over-moustache",
  "image": "/images/off-the-camera/66f1a2.../hero.jpg",
  "date": "",
  "order": 0,
  "title": {
    "kn": "ಮೀಸೆ ಕಾಣದಂತೆ ಟೇಪ್ ಅಂಟಿಸಬಹುದು!",
    "en": "“You Can Put Tape Over It So the Moustache Won’t Show!”"
  },
  "subtitle": {
    "kn": "ಗಿರಿಜಾ ಲೋಕೇಶ್",
    "en": "Girija Lokesh"
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
    "image": "/images/off-the-camera/66f1a2.../profile.jpg",
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
  "gallery": [],
  "photoCredit": {
    "kn": "ಪ್ರಗತಿ ಅಶ್ವತ್ಥ ನಾರಾಯಣ",
    "en": "Pragathi Ashwathanarayana"
  },
  "courtesy": {
    "kn": "",
    "en": ""
  },
  "layout": "overlap",
  "galleryMode": "stack",
  "createdAt": "2026-08-23T10:00:00.000Z",
  "updatedAt": "2026-08-23T10:00:00.000Z"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Admin update/delete/reorder |
| `slug` | yes | Unique; `/off-the-camera/:slug` |
| `image` | yes after create | Hero / grid / home |
| `order` | yes | Integer; **lower = earlier**. Sort ASC everywhere |
| `title.kn` / `title.en` | yes | Admin search matches either |
| `subtitle.kn` / `subtitle.en` | yes | Shown under title on detail (often speaker name) |
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
| `layout` | optional | Default `overlap` (same as default overlapping hero). Also: `banner`, `poster`, `landscape` |
| `galleryMode` | optional | Default `stack`. Also: `carousel`, `interleave` |
| `date` | optional | Stored; often empty |

### Sorting

- List sorted by `order` ascending.
- Detail `prev` / `next` / `related` (up to **4**) follow the same order.
- On create: `order = max(order) + 1` (append).

---

## 1. List posts (public + admin)

**GET** `/off-the-camera`

### Success — `200`

```json
{
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

Admin search + load-more are frontend-only on this full list.

---

## 2. Get post by slug (public)

**GET** `/off-the-camera/:slug`

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

**POST** `/off-the-camera`  
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
| `layout` | string | no — default `overlap` |
| `galleryMode` | string | no — default `stack` |
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
    "src": "/images/off-the-camera/.../gallery/0.jpg",
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
- Rebuild `images/off-the-camera/{id}/gallery/` to match this order (re-number files if needed).

### Profile persistence

- If any profile text field is non-empty **or** a `profileImage` file is uploaded, store a `profile` object.
- If all profile text fields are empty and there is no profile image, store `profile: null`.
- Profile image URL goes in `profile.image`.

### Success — `201`

```json
{
  "message": "Off the Camera post created",
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

**PUT** `/off-the-camera/:id`  
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
  "message": "Off the Camera post updated",
  "post": { /* Post shape */ }
}
```

---

## 5. Delete post (admin)

**DELETE** `/off-the-camera/:id`  
`Authorization: Bearer <accessToken>`

### Success — `200`

```json
{ "message": "Off the Camera post deleted" }
```

Delete `images/off-the-camera/{id}/` from disk.

---

## 6. Reorder posts (admin)

**PUT** `/off-the-camera/reorder`  
`Content-Type: application/json`  
`Authorization: Bearer <accessToken>`

```json
{
  "orderedIds": ["id-first", "id-second", "id-third"]
}
```

Rules:

1. Must list **every** off-the-camera post id exactly once.
2. Set `order = index` (0 = first on public site).
3. Return full list sorted by new order.

### Success — `200`

```json
{
  "message": "Off the Camera order updated",
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Invalid / incomplete `orderedIds` |
| `401` | Unauthorized |

**Route note:** Register `/off-the-camera/reorder` **before** `/off-the-camera/:slug`.

---

## Admin UI behaviour (frontend only)

| Feature | Behaviour |
|---------|-----------|
| Search | Filter by `title.en` **or** `title.kn` |
| Load more | 9 cards (3×3), then next 9 |
| Arrange | Drawer drag-and-drop → **PUT** `/off-the-camera/reorder` |

Public design is unchanged: same `PostGrid` / `RemembranceDetail` components; only the data source becomes the API. Keep `subtitle` / `profile` / `layout` so the existing detail UI continues to render correctly.

---

## Frontend routes that consume this API

| UI | Method | Path |
|----|--------|------|
| Public list `/off-the-camera` | GET | `/off-the-camera` |
| Public detail `/off-the-camera/:slug` | GET | `/off-the-camera/:slug` |
| Home Off the Camera slice | GET | `/off-the-camera` |
| Admin list `/admin/off-the-camera` | GET | `/off-the-camera` |
| Admin create | POST | `/off-the-camera` |
| Admin edit | PUT | `/off-the-camera/:id` |
| Admin delete | DELETE | `/off-the-camera/:id` |
| Admin Arrange | PUT | `/off-the-camera/reorder` |

---

## CORS / static files

- CORS for Vite origin (e.g. `http://localhost:5173`).
- Mount `/images` → disk `images/` folder.
