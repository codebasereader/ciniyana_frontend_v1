# Video API — Frontend integration guide

Base URL (local): `http://localhost:5000`
Auth: `Authorization: Bearer <accessToken>` on all **write** routes.
Public **read** routes do not require auth.

Video is **YouTube-only** and, unlike every other section, **has no file upload**. The admin pastes a full YouTube URL; the server is responsible for turning that into an embeddable video id and a thumbnail image. All write endpoints are plain JSON (`Content-Type: application/json`), not multipart.

**Admin fields:** YouTube URL (required) + English/Kannada title (required) + English/Kannada category (optional) + English/Kannada description (optional). No image upload, no gallery, no profile, no subtitle.

---

## YouTube URL handling (server)

On **create** and **update**, the client sends the raw `youtubeUrl` exactly as pasted by the admin (any of the standard formats below). The server must:

1. **Extract the 11-character video id** from the URL. Accept all of these shapes:
   ```
   https://www.youtube.com/watch?v=VIDEOID
   https://www.youtube.com/watch?v=VIDEOID&t=42s        (ignore extra query params)
   https://youtu.be/VIDEOID
   https://www.youtube.com/embed/VIDEOID
   https://www.youtube.com/shorts/VIDEOID
   ```
   If no valid 11-character id can be extracted, reject the request — see Errors below. Do **not** store a post with an unparseable URL.

2. **Derive the thumbnail** from the id using YouTube's static image CDN, which requires no API key:
   ```
   https://img.youtube.com/vi/{videoId}/hqdefault.jpg
   ```
   Use `hqdefault` specifically — it is guaranteed to exist for every public YouTube video. Higher-resolution variants (`maxresdefault`, `sddefault`) are **not** guaranteed and must not be used, to avoid broken thumbnails.

3. **Store both** the original `youtubeUrl` (so the admin form can show what was pasted when editing) and the derived `youtubeId` + `image` (thumbnail URL) on the post document.

4. Recompute `youtubeId` and `image` on **update** whenever `youtubeUrl` changes; leave them untouched if `youtubeUrl` is unchanged.

There is no `images/video/{postId}/` folder and nothing to delete from disk on post delete — the thumbnail is always a live YouTube CDN URL, never stored on our server.

---

## Post shape (JSON)

```json
{
  "id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "slug": "rajkumar-colour-shirt-pragathi-ashwatha-narayana",
  "order": 0,
  "youtubeUrl": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "youtubeId": "XXXXXXXXXXX",
  "image": "https://img.youtube.com/vi/XXXXXXXXXXX/hqdefault.jpg",
  "title": {
    "kn": "ಡಾ.ರಾಜ್‌ ಅವರಿಗೆ ಕಲರ್ ಷರ್ಟ್ ಹಾಕಿಸಿದ್ದು!",
    "en": "How Dr. Rajkumar came to wear a colour shirt!"
  },
  "category": {
    "kn": "ಕನ್ನಡ ಸಿನಿಮಾ",
    "en": "Kannada Cinema"
  },
  "body": {
    "kn": "ಪ್ಯಾರಾ 1...\n\nಪ್ಯಾರಾ 2...",
    "en": "Paragraph 1...\n\nParagraph 2..."
  },
  "date": "",
  "createdAt": "2026-08-23T10:00:00.000Z",
  "updatedAt": "2026-08-23T10:00:00.000Z"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Admin update/delete/reorder |
| `slug` | yes | Unique; `/video/:slug`. Frontend sends a slug generated from the English title; if empty, generate one from `titleEn` server-side (lowercase, hyphenated), append a short suffix on collision |
| `order` | yes | Integer; **lower = earlier**. Sort ASC everywhere |
| `youtubeUrl` | yes | Exactly as pasted by the admin |
| `youtubeId` | yes | Server-derived from `youtubeUrl` — see above |
| `image` | yes | Server-derived thumbnail URL — see above. Used for the grid card, the click-to-play facade, and related/prev-next thumbnails |
| `title.kn` / `title.en` | yes | Admin search matches either |
| `category.kn` / `category.en` | optional | Shown as a small badge on the detail page when present |
| `body.kn` / `body.en` | optional | Free text shown below the video player. Split paragraphs on `\n+`. Omit or empty string when there's no write-up |
| `date` | optional | Stored; often empty |

### Sorting

- List sorted by `order` ascending.
- Detail `prev` / `next` / `related` (up to **4**) follow the same order.
- On create: `order = max(order) + 1` (append).

---

## 1. List posts (public + admin)

**GET** `/video`

### Success — `200`

```json
{
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

Admin search + load-more are frontend-only on this full list.

---

## 2. Get post by slug (public)

**GET** `/video/:slug`

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

**POST** `/video`
`Content-Type: application/json`
`Authorization: Bearer <accessToken>`

### Body

```json
{
  "slug": "rajkumar-colour-shirt-pragathi-ashwatha-narayana",
  "youtubeUrl": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "titleEn": "How Dr. Rajkumar came to wear a colour shirt!",
  "titleKn": "ಡಾ.ರಾಜ್‌ ಅವರಿಗೆ ಕಲರ್ ಷರ್ಟ್ ಹಾಕಿಸಿದ್ದು!",
  "categoryEn": "Kannada Cinema",
  "categoryKn": "ಕನ್ನಡ ಸಿನಿಮಾ",
  "bodyEn": "Paragraph 1...\n\nParagraph 2...",
  "bodyKn": "ಪ್ಯಾರಾ 1...\n\nಪ್ಯಾರಾ 2...",
  "date": ""
}
```

| Key | Type | Required |
|-----|------|----------|
| `slug` | string | no — server generates from `titleEn` if omitted |
| `youtubeUrl` | string | yes — must resolve to a valid video id (see above) |
| `titleEn` | string | yes |
| `titleKn` | string | yes |
| `categoryEn` / `categoryKn` | string | no |
| `bodyEn` / `bodyKn` | string | no |
| `date` | string | no |

### Success — `201`

```json
{
  "message": "Video post created",
  "post": { /* Post shape, including server-derived youtubeId + image */ }
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Missing title, missing `youtubeUrl`, or `youtubeUrl` doesn't resolve to a valid video id |
| `401` | Unauthorized |
| `409` | Slug exists |
| `500` | Server error |

---

## 4. Update post (admin)

**PUT** `/video/:id`
`Content-Type: application/json`
`Authorization: Bearer <accessToken>`

Same body as create. If `youtubeUrl` is unchanged from the stored value, keep the existing `youtubeId`/`image`; if it changed, re-derive both.

Do **not** change `order` here — use reorder.

### Success — `200`

```json
{
  "message": "Video post updated",
  "post": { /* Post shape */ }
}
```

---

## 5. Delete post (admin)

**DELETE** `/video/:id`
`Authorization: Bearer <accessToken>`

### Success — `200`

```json
{ "message": "Video post deleted" }
```

No disk cleanup needed — there is no uploaded file for video posts.

---

## 6. Reorder posts (admin)

**PUT** `/video/reorder`
`Content-Type: application/json`
`Authorization: Bearer <accessToken>`

```json
{
  "orderedIds": ["id-first", "id-second", "id-third"]
}
```

Rules:

1. Must list **every** video post id exactly once.
2. Set `order = index` (0 = first on public site).
3. Return full list sorted by new order.

### Success — `200`

```json
{
  "message": "Video order updated",
  "posts": [ /* Post shape[] sorted by order ASC */ ]
}
```

### Errors

| Status | When |
|--------|------|
| `400` | Invalid / incomplete `orderedIds` |
| `401` | Unauthorized |

**Route note:** Register `/video/reorder` **before** `/video/:slug`.

---

## Admin UI behaviour (frontend only)

| Feature | Behaviour |
|---------|-----------|
| Form | YouTube URL + Title (English) + Title (Kannada) + optional category + optional description. No image upload — the admin form shows a live thumbnail preview computed client-side purely for feedback; the persisted `image` always comes from the server response |
| Search | Filter by `title.en` **or** `title.kn` |
| Load more | 9 cards (3×3), then next 9 |
| Arrange | Drawer drag-and-drop → **PUT** `/video/reorder` |

---

## Public site behaviour (frontend only, for context)

- `/video` — 3-column grid of video cards (thumbnail + play badge + title), no pagination.
- `/video/:slug` — same title/category/share hero band used by every other section, then a click-to-play YouTube facade (`youtube-nocookie.com/embed/{youtubeId}`, iframe only mounts after the viewer clicks play), then the optional description, then related/prev/next.
- **There is no separate frontend fallback/mock data for this section** — if this API is unavailable, the public `/video` page shows an error state with retry, and nothing else. Please treat this API as required, not optional, once the frontend is deployed.

---

## Frontend routes that consume this API

| UI | Method | Path |
|----|--------|------|
| Public list `/video` | GET | `/video` |
| Public detail `/video/:slug` | GET | `/video/:slug` |
| Admin list `/admin/video` | GET | `/video` |
| Admin create | POST | `/video` |
| Admin edit | PUT | `/video/:id` |
| Admin delete | DELETE | `/video/:id` |
| Admin Arrange | PUT | `/video/reorder` |

---

## CORS / static files

- CORS for Vite origin (e.g. `http://localhost:5173`).
- No `/images/video/...` mount needed — thumbnails are served directly from `img.youtube.com`, not from our own server.
