# Dashboard Analytics: Post Stats + Visitor Tracking

Date: 2026-09-21
Repos: `ciniyana_frontend_v2` (this repo) and `ciniyana_backend_v1` (sibling repo at `E:\Projects\BACKEND_FILES\ciniyana_backend_v1`)

## Goal

Replace the current empty admin Dashboard placeholder with:

1. A stat card + bar chart showing how many posts exist in each of the 9 content menus (Flash Back, Remembrance, Info Special, Photo Story, Off The Camera, Article, Film Today, Poster, Video), plus a total across all of them, plus a small table of each menu's last-updated time.
2. A stat card + bar chart showing public website visitor counts: total to date, and a day-by-day breakdown for the last 30 days.

## Non-goals

- No per-visitor identity, IP storage, or any PII — visits are a daily counter only.
- No historical backfill of visit data before this feature ships (starts counting from zero on deploy).
- No configurable date-range picker for the visitor chart in this pass (fixed 30-day window; easy to extend later).
- No admin-panel-usage analytics — only public-site visits count.

## Architecture overview

```
Public site (React)          Admin dashboard (React)         Backend (Express)
──────────────────           ───────────────────────         ──────────────────
Root layout mounts    POST /visits/track (fire&forget) ──▶  Visit model (daily counter)
useEffect once per                                            upsert +1 for today
session (sessionStorage
flag, no PII)

                              DashboardPage mounts  ──▶  GET /stats/posts  (authenticate)
                              useEffect                    counts + lastUpdatedAt per
                                                            menu, across 9 Mongoose models

                                                     ──▶  GET /visits/stats (authenticate)
                                                            { total, daily[30] } from
                                                            Visit model
```

## Backend changes (`ciniyana_backend_v1`)

### New model: `models/visit.js`

One document per calendar day (UTC), not one per visit — keeps storage flat and avoids any per-visitor record.

```js
{
  date: String,   // "YYYY-MM-DD", unique
  count: Number,  // default 0
}
```

### New: `controllers/visits.js` / `routes/visits.js`

- `POST /visits/track` — public, **no auth**. Upserts `{ date: today }` with `$inc: { count: 1 }`. Returns `204 No Content`. Rate-limited (`express-rate-limit`, same pattern as `/user/login`: window 60s, max 60/IP — generous enough for shared-IP/NAT traffic while still blocking scripted abuse).
- `GET /visits/stats` — **authenticate**-gated (admin only). Returns:
  ```json
  { "total": 1234, "daily": [{ "date": "2026-08-23", "count": 12 }, ...30 entries] }
  ```
  `daily` is always exactly 30 entries covering the last 30 calendar days, zero-filled for days with no recorded visits (so the frontend never has to handle sparse data / gaps in the bar chart). `total` is the all-time sum across every stored day (MongoDB `$group`/`$sum`), not just the 30-day window.

### New: `controllers/stats.js` / `routes/stats.js`

- `GET /stats/posts` — **authenticate**-gated. Runs `Promise.all` across the 9 content models (`FlashBack`, `Remembrance`, `InfoSpecial`, `PhotoStory`, `OffTheCamera`, `Article`, `FilmToday`, `Poster`, `Video` — all already have `timestamps: true`), each doing `countDocuments()` + `findOne().sort({updatedAt:-1})`. Returns:
  ```json
  {
    "total": 87,
    "menus": [
      { "key": "flashback", "label": "Flash Back", "count": 12, "lastUpdatedAt": "2026-09-18T10:03:00.000Z" },
      ...
    ]
  }
  ```
  `lastUpdatedAt` is `null` for a menu with zero posts.

### `app.js`

Register both new routers: `app.use("/stats", statsRoutes)`, `app.use("/visits", visitsRoutes)`.

### Error handling

Both controllers follow the existing pattern in this codebase: try/catch, `console.error` server-side, generic `{ message }` + 500 to the client — no stack traces or internal error text leaked (matches the fix already applied to the rest of this API).

## Frontend changes (`ciniyana_frontend_v2`)

### `src/lib/visitTracker.js` (new)

```js
export function trackVisitOnce() {
  // sessionStorage flag "ciniyana_visit_tracked" — one POST per tab session.
  // Fire-and-forget: network failure here must never affect the public UX.
}
```

Called once via `useEffect` from the **public site's root layout only** — not from `AdminRouteTree`/`AdminLayout` — so CMS work by admins never inflates the visitor count. Wrapped in try/catch around the `sessionStorage` access (private-browsing/blocked-storage just silently skips tracking, never throws).

### `src/api/stats.js` (new)

```js
export function fetchPostStats()  // GET /stats/posts via apiFetch (cookie auth)
export function fetchVisitStats() // GET /visits/stats via apiFetch (cookie auth)
```

### Dashboard reorganized into `src/admin/pages/dashboard/` (matches the existing per-section folder convention used by flash-back, remembrance, etc.)

- `DashboardPage.jsx` — fetches both stats on mount, holds loading/error state, lays out the two stat cards + two charts + table.
- `components/StatCard.jsx` — big-number card (used for Total Posts and Total Visitors).
- `components/PostsByMenuChart.jsx` — Recharts bar chart, one bar per menu.
- `components/VisitorsChart.jsx` — Recharts bar chart, one bar per day (30 bars).
- `components/MenuStatusTable.jsx` — menu name, count, relative "updated X ago" (small local formatter, no new date library).
- `utils.js` — relative-time formatter.

`src/admin/adminRoutes.jsx`'s import path updates from `./pages/DashboardPage` to `./pages/dashboard`.

### New dependency: `recharts`

React-native charting (no separate canvas/build tooling), MIT licensed. The `dataviz` skill will be loaded before writing any chart component for palette/accessibility conventions, per this session's standing instructions.

### Error/empty states

- Dashboard shows a lightweight loading skeleton while both requests are in flight, and a friendly inline error message (not a crash) if either `apiFetch` call throws — each stat section fails independently so one broken endpoint doesn't blank the whole page.
- Visitor chart with zero all-time visits still renders 30 empty-looking bars (all zero) rather than an empty/broken chart, since the backend always returns exactly 30 entries.

## Testing / verification plan

- Backend: curl-driven checks against the real local dev DB (as done for the earlier cookie-auth work) — confirm `/visits/track` increments correctly and is rate-limited, `/visits/stats` returns a correctly zero-filled 30-day array and correct all-time total, `/stats/posts` counts match the actual per-collection document counts and `lastUpdatedAt` matches the most recently modified document in each collection.
- Frontend: browser-driven check against the real backend — Dashboard renders both charts and the table with live data; confirm exactly one `/visits/track` call per tab session (no duplicates on client-side route changes) via network-request inspection; confirm zero tracking calls while under `/admin/*`; confirm loading and error states render correctly (e.g., by temporarily pointing at a dead backend).
- Lint (`oxlint`) and a production build on the frontend; `node --check` syntax verification on the new backend files, consistent with the verification approach used earlier in this session.

## Open items resolved during brainstorming

- Visit counting granularity: **one per browser session** (not per page view, not per day-per-device).
- Visitor chart range: **last 30 days**, daily buckets.
- "Last updated" per menu: **table/list**, not forced into a chart.
- Admin-panel visits: **excluded** from visitor stats.
