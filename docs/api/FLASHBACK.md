# Flash Back API — Frontend integration guide

Base URL (local): `http://localhost:5000`  
Auth: `Authorization: Bearer <accessToken>` on all **write** routes.  
Public **read** routes do not require auth.

---

## Image storage (server)

Store uploaded images on disk under:

```text
images/
  flashback/
    {postId}/
      {filename}
```

Rules:

1. Create `images/flashback/{postId}/` when a post is created (use MongoDB `_id` / UUID as `{postId}`).
2. Save the hero image inside that folder (sanitize the filename; prefer a stable name like `hero.jpg` / `hero.webp`).
3. On update with a new file: replace the old hero (delete previous file) and keep one primary image per post.
4. On delete: remove the post document **and** delete the folder `images/flashback/{postId}/`.
5. Serve files statically so the public URL is:

```text
{API_BASE_URL}/images/flashback/{postId}/{filename}
```

Example: `http://localhost:5000/images/flashback/66f1a2.../hero.jpg`

Return this URL (absolute **or** path starting with `/images/...`) in the `image` field of every JSON response. The frontend resolves relative `/images/...` paths against the API base URL.

---

## Post shape (JSON)

Every create/update/list/detail/reorder response item must match:

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "slug": "bhootayyana-maga-ayyu-centenary",
  "image": "/images/flashback/66f1a2b3c4d5e6f7a8b9c0d1/hero.jpg",
  "date": "1974",
  "order": 0,
  "title": {
    "kn": "'ಬೂತಯ್ಯನ ಮಗ ಅಯ್ಯು' ಶತದಿನೋತ್ಸವ",
    "en": "'Bhootayyana Maga Ayyu' Centenary Celebration"
  },
  "body": {
    "kn": "ಕನ್ನಡ ಪ್ಯಾರಾಗ್ರಾಫ್...\n\nಎರಡನೇ ಪ್ಯಾರಾ...",
    "en": "English paragraph...\n\nSecond paragraph..."
  },
  "category": {
    "kn": "ಕನ್ನಡ ಸಿನಿಮಾ",
    "en": "Kannada Cinema"
  },
  "photoCredit": {
    "kn": "ಪ್ರಗತಿ ಅಶ್ವತ್ಥ ನಾರಾಯಣ",
    "en": "Pragathi Ashwathanarayana"
  },
  "createdAt": "2026-08-21T10:00:00.000Z",
  "updatedAt": "2026-08-21T10:00:00.000Z"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | String id used by admin update/delete/reorder |
| `slug` | yes | Unique URL key for `/flash-back/:slug`. Lowercase kebab-case |
| `image` | yes (after create) | Public URL/path to hero image |
| `date` | optional | Display year/string, e.g. `"1974"` |
| `order` | yes | Integer sort key. **Lower = earlier** in public + admin lists |
| `title.kn` / `title.en` | yes | Used by admin search (both languages) |
| `body.kn` / `body.en` | yes | Use `\n` / `\n\n` between paragraphs |
| `category.kn` / `category.en` | optional | Defaults on UI if missing |
| `photoCredit.kn` / `photoCredit.en` | optional | Shown under hero as Photo / ಫೋಟೊ |

### Sorting (important)

Always return list arrays sorted by **`order` ascending** (0, 1, 2, …).  
`prev` / `next` on detail must follow this same order.  
On **create**, set `order` to `max(order) + 1` (append to end) unless you prefer another default.

---

## 1. List posts (public + admin)

**GET** `/flashback`

Return **all** posts in `order` ascending.  
(Admin search / “load more” are handled on the frontend from this full list.)

### Success — `200`

```json
{
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

---

## 2. Get post by slug (public)

**GET** `/flashback/:slug`

### Success — `200`

```json
{
  "post": { /* Post shape */ },
  "prev": { /* previous by order, or null */ },
  "next": { /* next by order, or null */ },
  "related": [ /* up to 3 other posts in order, same shape */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `404` | Unknown slug |

---

## 3. Create post (admin)

**POST** `/flashback`  
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
| `image` | file | yes |

Map form fields into nested `{ kn, en }` objects. Assign next `order` automatically.

### Success — `201`

```json
{
  "message": "Flash back post created",
  "post": { /* Post shape */ }
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Missing required fields / no image |
| `401` | Missing/invalid token |
| `409` | Slug already exists |
| `500` | Server / upload error |

---

## 4. Update post (admin)

**PUT** `/flashback/:id`  
`Content-Type: multipart/form-data`  
`Authorization: Bearer <accessToken>`

Same form fields as create. **`image` is optional** — omit to keep the existing file.  
Do **not** change `order` here (use reorder endpoint).

### Success — `200`

```json
{
  "message": "Flash back post updated",
  "post": { /* Post shape */ }
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Invalid payload |
| `401` | Unauthorized |
| `404` | Unknown id |
| `409` | Slug taken by another post |

---

## 5. Delete post (admin)

**DELETE** `/flashback/:id`  
`Authorization: Bearer <accessToken>`

### Success — `200`

```json
{
  "message": "Flash back post deleted"
}
```

Also delete `images/flashback/{id}/` from disk.  
Optionally compact remaining `order` values (0…n-1); not required if reorder always sends a full list.

### Errors

| Status | When |
|--------|------|
| `401` | Unauthorized |
| `404` | Unknown id |

---

## 6. Reorder posts (admin)

Used by the admin **Arrange** drawer (drag-and-drop). Persisted order must drive the **public** UI (home carousel, list grid, footer, prev/next).

**PUT** `/flashback/reorder`  
`Content-Type: application/json`  
`Authorization: Bearer <accessToken>`

### Request body

```json
{
  "orderedIds": [
    "id-of-first-post",
    "id-of-second-post",
    "id-of-third-post"
  ]
}
```

Rules:

1. `orderedIds` must include **every** existing Flash Back post id exactly once.
2. Set `order = index` for each id (`0` = first on public site).
3. Return the full list sorted by the new order.

### Success — `200`

```json
{
  "message": "Flash back order updated",
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Missing/empty `orderedIds`, duplicates, or ids that don’t match the full set |
| `401` | Unauthorized |
| `500` | Server error |

### Example

```js
const reorder = async (orderedIds, accessToken) => {
  const res = await fetch("http://localhost:5000/flashback/reorder", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ orderedIds }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.posts;
};
```

**Route note:** Register `/flashback/reorder` **before** `/flashback/:slug` (or use a separate path) so `"reorder"` is not treated as a slug.

---

## Admin UI behaviour (frontend only)

These do **not** need extra list query params:

| Feature | Behaviour |
|---------|-----------|
| Search | Filters loaded posts by `title.en` **or** `title.kn` (case-insensitive) |
| Load more | Shows 9 cards (3×3), then next 9, etc. |
| Arrange | Drawer + drag-and-drop → calls **PUT** `/flashback/reorder` |

---

## Example (Node / Express sketch)

```js
// POST /flashback
// multer → images/flashback/{id}/hero.ext
// order = (await Model.find().sort({ order: -1 }).limit(1))[0]?.order + 1 || 0

// PUT /flashback/reorder
const reorderFlashBack = async (req, res) => {
  const { orderedIds } = req.body;
  // validate full unique set of ids
  await Promise.all(
    orderedIds.map((id, index) =>
      Model.findByIdAndUpdate(id, { order: index }),
    ),
  );
  const posts = await Model.find().sort({ order: 1 });
  res.json({ message: "Flash back order updated", posts });
};
```

---

## CORS / static files

- Keep CORS enabled for the Vite origin (e.g. `http://localhost:5173`).
- Mount static serving for `/images` → disk `images/` folder so browser `<img src>` works.

---

## Frontend routes that consume this API

| UI | Method | Path |
|----|--------|------|
| Public list `/flash-back` | GET | `/flashback` |
| Public detail `/flash-back/:slug` | GET | `/flashback/:slug` |
| Admin list `/admin/flash-back` | GET | `/flashback` |
| Admin create `/admin/flash-back/new` | POST | `/flashback` |
| Admin edit `/admin/flash-back/:id/edit` | PUT | `/flashback/:id` |
| Admin delete | DELETE | `/flashback/:id` |
| Admin Arrange drawer | PUT | `/flashback/reorder` |
