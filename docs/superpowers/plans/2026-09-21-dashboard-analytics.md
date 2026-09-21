# Dashboard Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the empty admin Dashboard with post-count stats (per menu + total) and public-visitor stats (per day + all-time total), each shown as a stat card + bar chart, backed by two new small backend APIs.

**Architecture:** Two independent read-only stats endpoints on the backend (`GET /stats/posts`, `GET /visits/stats`, both `authenticate`-gated) plus one public write endpoint (`POST /visits/track`, rate-limited) backed by a new one-document-per-day `Visit` model. The frontend adds a session-scoped visit tracker fired once from the public root shell, a small `api/stats.js` client, and a rebuilt `DashboardPage` composed of small chart/table components using Recharts.

**Tech Stack:** Express 5 + Mongoose (backend, existing), React 19 + Redux Toolkit + Recharts (new dependency) + Tailwind (frontend, existing).

**Spec:** `docs/superpowers/specs/2026-09-21-dashboard-analytics-design.md`

## Global Constraints

- No PII: visit tracking stores only a daily counter, never IP/user-agent/identity.
- `POST /visits/track` is public and unauthenticated; `GET /visits/stats` and `GET /stats/posts` require `authenticate` (admin cookie), matching every other read endpoint's auth pattern already established in this backend... except these two are *admin-only reads* (unlike the public content GETs), so they must NOT skip `authenticate`.
- Backend error responses stay generic (`{ message }` + 500, `console.error` server-side only) — matches the existing pattern audited earlier; never leak `error.message` to the client.
- `GET /visits/stats` always returns exactly 30 daily entries, zero-filled for days with no recorded visits — the frontend must never have to handle a sparse/partial array.
- Dashboard UI is English-only (explicit decision — do not add Kannada strings to the new dashboard components).
- Bar color for both charts: `#2a78d6` (validated dataviz palette, categorical slot 1 / sequential blue) — single-series charts, no per-bar rainbow, no legend needed.
- Chart mark specs: bars ≤24px thick (30-bar chart ≤16px), 4px rounded top corners, hairline (1px) gridlines in `#e1e0d9`, axis/tick text in muted `#898781`, axis line in `#c3c2b7`, hover tooltip (value in `#0b0b0b`, label in `#52514e`) — these exact values come from the dataviz skill's validated default palette and must not be swapped for arbitrary colors.
- The visit tracker must never fire for any `/admin/*` route, and must fire at most once per browser tab session.

---

### Task 1: Backend — `Visit` model + `POST /visits/track`

**Files:**
- Create: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\models\visit.js`
- Create: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\controllers\visits.js`
- Create: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\routes\visits.js`
- Modify: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\app.js`

**Interfaces:**
- Produces: `Visit` Mongoose model (`{ date: String (unique, "YYYY-MM-DD" UTC), count: Number }`), `exports.track` controller, mounted at `POST /visits/track`.

- [ ] **Step 1: Create the `Visit` model**

```js
// E:\Projects\BACKEND_FILES\ciniyana_backend_v1\models\visit.js
const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD", UTC calendar day
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);
```

- [ ] **Step 2: Create the visits controller with the track handler**

```js
// E:\Projects\BACKEND_FILES\ciniyana_backend_v1\controllers\visits.js
const Visit = require("../models/visit");

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

exports.track = async (req, res) => {
  try {
    await Visit.findOneAndUpdate(
      { date: todayUTC() },
      { $inc: { count: 1 } },
      { upsert: true }
    );
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to record visit" });
  }
};
```

- [ ] **Step 3: Create the visits router with the track route, rate-limited**

```js
// E:\Projects\BACKEND_FILES\ciniyana_backend_v1\routes\visits.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const visitsController = require("../controllers/visits");

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests" },
});

router.post("/track", trackLimiter, visitsController.track);

module.exports = router;
```

- [ ] **Step 4: Mount the router in `app.js`**

Find this block (around line 83-88):

```js
const userRoutes = require("./routes/user");
const flashBackRoutes = require("./routes/flashback");
```

Add a new require line directly above it:

```js
const visitRoutes = require("./routes/visits");
const userRoutes = require("./routes/user");
const flashBackRoutes = require("./routes/flashback");
```

Find this block (around line 89-98):

```js
app.use(`${API_ROOT}user`, userRoutes);
app.use(`${API_ROOT}flashback`, flashBackRoutes);
```

Add a new `app.use` line directly above it:

```js
app.use(`${API_ROOT}visits`, visitRoutes);
app.use(`${API_ROOT}user`, userRoutes);
app.use(`${API_ROOT}flashback`, flashBackRoutes);
```

- [ ] **Step 5: Syntax-check the new/modified files**

Run: `cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && node --check models/visit.js && node --check controllers/visits.js && node --check routes/visits.js && node --check app.js`
Expected: no output (all pass), exit code 0 for each.

- [ ] **Step 6: Start the backend and verify the endpoint with curl**

Run (from the backend directory): `npm run dev` (leave running in background)

Then:
```bash
curl -s -i -X POST http://localhost:5000/visits/track
```
Expected: `HTTP/1.1 204 No Content`.

Run it 3 times in a row, then check MongoDB directly:
```bash
mongosh mongodb://127.0.0.1:27017/ciniyana --quiet --eval "db.visits.find().toArray()"
```
Expected: one document for today's UTC date with `count: 3` (or higher if run more times).

- [ ] **Step 7: Commit**

```bash
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1"
git add models/visit.js controllers/visits.js routes/visits.js app.js
git commit -m "Add POST /visits/track endpoint with daily-counter Visit model"
```

---

### Task 2: Backend — `GET /visits/stats`

**Files:**
- Modify: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\controllers\visits.js`
- Modify: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\routes\visits.js`

**Interfaces:**
- Consumes: `Visit` model from Task 1.
- Produces: `exports.stats` controller mounted at `GET /visits/stats`, response shape `{ total: number, daily: [{ date: "YYYY-MM-DD", count: number }, ...30 entries] }`.

- [ ] **Step 1: Add the `stats` handler to the visits controller**

Add this to the end of `controllers/visits.js` (keep the existing `todayUTC` and `track` above it):

```js
function isoDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

exports.stats = async (req, res) => {
  try {
    const DAYS = 30;
    const sinceDate = isoDateDaysAgo(DAYS - 1);

    const [rows, totalAgg] = await Promise.all([
      Visit.find({ date: { $gte: sinceDate } })
        .select("date count -_id")
        .lean(),
      Visit.aggregate([{ $group: { _id: null, total: { $sum: "$count" } } }]),
    ]);

    const countsByDate = new Map(rows.map((row) => [row.date, row.count]));

    const daily = [];
    for (let i = DAYS - 1; i >= 0; i -= 1) {
      const date = isoDateDaysAgo(i);
      daily.push({ date, count: countsByDate.get(date) || 0 });
    }

    const total = totalAgg[0]?.total || 0;

    return res.status(200).json({ total, daily });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch visit stats" });
  }
};
```

- [ ] **Step 2: Add the authenticated route**

In `routes/visits.js`, add the `authenticate` import and the new route:

```js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const visitsController = require("../controllers/visits");
const { authenticate } = require("../middleware/auth");

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests" },
});

router.post("/track", trackLimiter, visitsController.track);
router.get("/stats", authenticate, visitsController.stats);

module.exports = router;
```

- [ ] **Step 3: Syntax-check**

Run: `cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && node --check controllers/visits.js && node --check routes/visits.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Create a throwaway verification admin account**

These new endpoints require an authenticated admin cookie to test. Create one directly via the DB (bypassing the `/user/register` auth gate, which is exactly what it's designed to block) rather than guessing at real credentials:

```bash
cat > "E:\Projects\BACKEND_FILES\ciniyana_backend_v1\_plan_verify_admin.js" << 'EOF'
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const EMAIL = "plan-verify-admin@test.local";
const PASSWORD = "TestPass123!";

async function main() {
  await mongoose.connect(process.env.DB_URL);
  await User.deleteOne({ email: EMAIL });
  const hashed = await bcrypt.hash(PASSWORD, 10);
  await User.create({ name: "Plan Verify Admin", email: EMAIL, password: hashed, role: "admin" });
  console.log("created test admin:", EMAIL);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
EOF
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && node _plan_verify_admin.js
```
Expected output: `created test admin: plan-verify-admin@test.local`

Keep this account and the script around — Task 3 and Task 10 reuse the same credentials (`plan-verify-admin@test.local` / `TestPass123!`). Task 10 deletes both the account and this script as its final cleanup step.

- [ ] **Step 5: Verify with curl against the running dev server**

First confirm it rejects unauthenticated requests:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/visits/stats
```
Expected: `401`

Then log in with the throwaway admin from Step 4 to get a cookie jar, and call it authenticated:
```bash
curl -s -c /tmp/cookies.txt -X POST http://localhost:5000/user/login -H "Content-Type: application/json" -d '{"email":"plan-verify-admin@test.local","password":"TestPass123!"}' -o /dev/null
curl -s -b /tmp/cookies.txt http://localhost:5000/visits/stats
rm -f /tmp/cookies.txt
```
Expected: `200` with `{"total": <n>, "daily": [ ...exactly 30 entries... ]}`. Confirm `daily.length === 30` and every entry has a `date` and non-negative `count`, and that today's entry's `count` matches what Task 1's curl loop wrote.

- [ ] **Step 6: Commit**

```bash
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1"
git add controllers/visits.js routes/visits.js
git commit -m "Add authenticated GET /visits/stats endpoint (30-day zero-filled series + all-time total)"
```

---

### Task 3: Backend — `GET /stats/posts`

**Files:**
- Create: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\controllers\stats.js`
- Create: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\routes\stats.js`
- Modify: `E:\Projects\BACKEND_FILES\ciniyana_backend_v1\app.js`

**Interfaces:**
- Consumes: the 9 existing content models (`models/flashback.js`, `models/remembrance.js`, `models/infoSpecial.js`, `models/photoStory.js`, `models/offTheCamera.js`, `models/article.js`, `models/filmToday.js`, `models/poster.js`, `models/video.js`), all already exporting a Mongoose model with `timestamps: true`.
- Produces: `GET /stats/posts` → `{ total: number, menus: [{ key: string, label: string, count: number, lastUpdatedAt: string|null }, ...9 entries] }`.

- [ ] **Step 1: Create the stats controller**

```js
// E:\Projects\BACKEND_FILES\ciniyana_backend_v1\controllers\stats.js
const FlashBack = require("../models/flashback");
const Remembrance = require("../models/remembrance");
const InfoSpecial = require("../models/infoSpecial");
const PhotoStory = require("../models/photoStory");
const OffTheCamera = require("../models/offTheCamera");
const Article = require("../models/article");
const FilmToday = require("../models/filmToday");
const Poster = require("../models/poster");
const Video = require("../models/video");

const MENUS = [
  { key: "flashback", label: "Flash Back", Model: FlashBack },
  { key: "remembrance", label: "Remembrance", Model: Remembrance },
  { key: "info-special", label: "Info Special", Model: InfoSpecial },
  { key: "photo-story", label: "Photo Story", Model: PhotoStory },
  { key: "off-the-camera", label: "Off The Camera", Model: OffTheCamera },
  { key: "article", label: "Article", Model: Article },
  { key: "film-today", label: "Film Today", Model: FilmToday },
  { key: "poster", label: "Poster", Model: Poster },
  { key: "video", label: "Video", Model: Video },
];

exports.posts = async (req, res) => {
  try {
    const menus = await Promise.all(
      MENUS.map(async ({ key, label, Model }) => {
        const [count, latest] = await Promise.all([
          Model.countDocuments(),
          Model.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean(),
        ]);
        return {
          key,
          label,
          count,
          lastUpdatedAt: latest?.updatedAt ? new Date(latest.updatedAt).toISOString() : null,
        };
      })
    );

    const total = menus.reduce((sum, menu) => sum + menu.count, 0);

    return res.status(200).json({ total, menus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch post stats" });
  }
};
```

- [ ] **Step 2: Create the stats router**

```js
// E:\Projects\BACKEND_FILES\ciniyana_backend_v1\routes\stats.js
const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats");
const { authenticate } = require("../middleware/auth");

router.get("/posts", authenticate, statsController.posts);

module.exports = router;
```

- [ ] **Step 3: Mount the router in `app.js`**

Find (this line was added in Task 1, Step 4):

```js
const visitRoutes = require("./routes/visits");
```

Add directly below it:

```js
const visitRoutes = require("./routes/visits");
const statsRoutes = require("./routes/stats");
```

Find:

```js
app.use(`${API_ROOT}visits`, visitRoutes);
```

Add directly below it:

```js
app.use(`${API_ROOT}visits`, visitRoutes);
app.use(`${API_ROOT}stats`, statsRoutes);
```

- [ ] **Step 4: Syntax-check**

Run: `cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && node --check controllers/stats.js && node --check routes/stats.js && node --check app.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Verify with curl against the running dev server**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/stats/posts
```
Expected: `401` (unauthenticated).

Using the throwaway admin created in Task 2, Step 4 (`plan-verify-admin@test.local` / `TestPass123!`):
```bash
curl -s -c /tmp/cookies.txt -X POST http://localhost:5000/user/login -H "Content-Type: application/json" -d '{"email":"plan-verify-admin@test.local","password":"TestPass123!"}' -o /dev/null
curl -s -b /tmp/cookies.txt http://localhost:5000/stats/posts
rm -f /tmp/cookies.txt
```
Expected: `200` with `menus` containing exactly 9 entries (keys: `flashback`, `remembrance`, `info-special`, `photo-story`, `off-the-camera`, `article`, `film-today`, `poster`, `video`) and `total` equal to the sum of all 9 `count` values. Spot-check one menu's `count` against `curl -s http://localhost:5000/flashback | grep -o '"id"' | wc -l` (the public list endpoint) to confirm the number is real, not hardcoded.

- [ ] **Step 6: Commit**

```bash
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1"
git add controllers/stats.js routes/stats.js app.js
git commit -m "Add authenticated GET /stats/posts endpoint (per-menu counts + last-updated)"
```

---

### Task 4: Frontend — visit tracker (session-scoped, public-site-only)

**Files:**
- Create: `E:\Projects\ciniyana_frontend_v2\src\lib\visitTracker.js`
- Modify: `E:\Projects\ciniyana_frontend_v2\src\App.jsx`

**Interfaces:**
- Produces: `trackVisitOnce(): void` — exported from `src/lib/visitTracker.js`. Fire-and-forget; never throws.

- [ ] **Step 1: Create the visit tracker**

```js
// E:\Projects\ciniyana_frontend_v2\src\lib\visitTracker.js
import { API_BASE_URL } from '../../config.js'

const SESSION_KEY = 'ciniyana_visit_tracked'

/**
 * Records one visit for today, at most once per browser tab session.
 * Fire-and-forget — a network or storage failure here must never affect
 * the public site's UX, so every failure path is swallowed silently.
 */
export function trackVisitOnce() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    return
  }

  fetch(`${API_BASE_URL}/visits/track`, { method: 'POST' }).catch(() => {})
}
```

- [ ] **Step 2: Wire it into the public root shell only**

In `src/App.jsx`, add the import at the top:

```js
import { trackVisitOnce } from './lib/visitTracker'
```

Then modify `AppShell` (currently):

```jsx
function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <AdminRouteTree />
  }
```

to:

```jsx
function AppShell() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (!isAdmin) trackVisitOnce()
  }, [isAdmin])

  if (isAdmin) {
    return <AdminRouteTree />
  }
```

(`useEffect` is already imported at the top of `App.jsx` — no new import needed for it.)

- [ ] **Step 3: Lint**

Run: `cd /e/Projects/ciniyana_frontend_v2 && npx oxlint src/lib/visitTracker.js src/App.jsx`
Expected: no output (clean).

- [ ] **Step 4: Manual browser verification**

With the backend running (`npm run dev` in the backend dir) and the frontend running (`npm run dev` in the frontend dir, with `VITE_API_BASE_URL` set or `.env` present):

1. Open a fresh browser tab (or clear `sessionStorage`) and navigate to `http://localhost:5173/`.
2. Open devtools Network tab, filter for `track`. Confirm exactly one `POST /visits/track` request fired.
3. Navigate to another public page (e.g. click into an article). Confirm **no** additional `/visits/track` request fires (same-session dedup working).
4. Navigate to `http://localhost:5173/admin/login`. Confirm **no** `/visits/track` request fires.
5. Check `sessionStorage.getItem('ciniyana_visit_tracked')` in the console — should be `"1"`.

- [ ] **Step 5: Commit**

```bash
cd /e/Projects/ciniyana_frontend_v2
git add src/lib/visitTracker.js src/App.jsx
git commit -m "Track one public-site visit per browser session, excluding /admin"
```

---

### Task 5: Frontend — `StatCard` + relative-time util

**Files:**
- Create: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\utils.js`
- Create: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\StatCard.jsx`

**Interfaces:**
- Produces: `timeAgo(dateInput: string|null): string` from `utils.js`. `StatCard({ label: string, value: number|string })` component.

- [ ] **Step 1: Create the relative-time formatter**

```js
// E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\utils.js
const UNITS = [
  { label: 'year', secs: 31536000 },
  { label: 'month', secs: 2592000 },
  { label: 'day', secs: 86400 },
  { label: 'hour', secs: 3600 },
  { label: 'minute', secs: 60 },
]

export function timeAgo(dateInput) {
  if (!dateInput) return 'Never'

  const seconds = Math.floor((Date.now() - new Date(dateInput).getTime()) / 1000)

  for (const { label, secs } of UNITS) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value} ${label}${value > 1 ? 's' : ''} ago`
  }

  return 'Just now'
}
```

- [ ] **Step 2: Create `StatCard`**

```jsx
// E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\StatCard.jsx
export default function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#eee] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[#666]">{label}</p>
      <p className="mt-1 text-5xl font-bold text-[#1a1a1a]">{value}</p>
    </div>
  )
}
```

- [ ] **Step 3: Lint**

Run: `cd /e/Projects/ciniyana_frontend_v2 && npx oxlint src/admin/pages/dashboard/`
Expected: no output.

- [ ] **Step 4: Verify `timeAgo` behavior with a quick node check**

Run:
```bash
cd /e/Projects/ciniyana_frontend_v2
node -e "
const now = Date.now();
const twoDaysAgo = new Date(now - 2 * 86400 * 1000).toISOString();
const fn = require('fs').readFileSync('src/admin/pages/dashboard/utils.js', 'utf8').replace('export function', 'function') + '\nconsole.log(timeAgo(null), timeAgo(\"' + twoDaysAgo + '\"), timeAgo(new Date().toISOString()));';
eval(fn);
"
```
Expected output: `Never 2 days ago Just now`

- [ ] **Step 5: Commit**

```bash
cd /e/Projects/ciniyana_frontend_v2
git add src/admin/pages/dashboard/utils.js src/admin/pages/dashboard/components/StatCard.jsx
git commit -m "Add dashboard StatCard component and relative-time formatter"
```

---

### Task 6: Frontend — install Recharts + `PostsByMenuChart`

**Files:**
- Modify: `E:\Projects\ciniyana_frontend_v2\package.json` (via npm install)
- Create: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\PostsByMenuChart.jsx`

**Interfaces:**
- Consumes: nothing from earlier tasks directly (standalone component).
- Produces: `PostsByMenuChart({ menus: [{ key, label, count }] })` component.

- [ ] **Step 1: Install Recharts**

Run: `cd /e/Projects/ciniyana_frontend_v2 && npm install recharts`
Expected: `package.json` gets a new `recharts` entry under `dependencies`; install completes with no errors.

- [ ] **Step 2: Create the chart component**

Mark specs and colors below come from the dataviz skill's validated default palette (bar fill `#2a78d6`, hairline gridlines `#e1e0d9`, muted axis text `#898781`, axis line `#c3c2b7`, tooltip ink `#0b0b0b`/`#52514e`) — do not substitute other colors.

```jsx
// E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\PostsByMenuChart.jsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const BAR_COLOR = '#2a78d6'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-[rgba(11,11,11,0.1)] bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-[#52514e]">{label}</p>
      <p className="text-sm font-semibold text-[#0b0b0b]">{payload[0].value} posts</p>
    </div>
  )
}

export default function PostsByMenuChart({ menus }) {
  const data = menus.map((menu) => ({ name: menu.label, count: menu.count }))

  return (
    <div className="rounded-xl border border-[#eee] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-[#333]">Posts by menu</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
          <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Lint**

Run: `cd /e/Projects/ciniyana_frontend_v2 && npx oxlint src/admin/pages/dashboard/components/PostsByMenuChart.jsx`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /e/Projects/ciniyana_frontend_v2
git add package.json package-lock.json src/admin/pages/dashboard/components/PostsByMenuChart.jsx
git commit -m "Add recharts dependency and PostsByMenuChart component"
```

(This component is visually verified end-to-end in Task 10's browser check, once it's wired into the real Dashboard page with real data — no standalone render harness exists in this project.)

---

### Task 7: Frontend — `VisitorsChart`

**Files:**
- Create: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\VisitorsChart.jsx`

**Interfaces:**
- Consumes: `recharts` (installed in Task 6).
- Produces: `VisitorsChart({ daily: [{ date: "YYYY-MM-DD", count }] })` component (expects exactly 30 entries, per the backend contract from Task 2).

- [ ] **Step 1: Create the chart component**

```jsx
// E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\VisitorsChart.jsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const BAR_COLOR = '#2a78d6'

function formatDayLabel(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload

  return (
    <div className="rounded-lg border border-[rgba(11,11,11,0.1)] bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-[#52514e]">{point.fullDate}</p>
      <p className="text-sm font-semibold text-[#0b0b0b]">{point.count} visitors</p>
    </div>
  )
}

export default function VisitorsChart({ daily }) {
  const data = daily.map((entry) => ({
    name: formatDayLabel(entry.date),
    fullDate: entry.date,
    count: entry.count,
  }))

  return (
    <div className="rounded-xl border border-[#eee] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-[#333]">Visitors — last 30 days</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#898781' }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
          <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Run: `cd /e/Projects/ciniyana_frontend_v2 && npx oxlint src/admin/pages/dashboard/components/VisitorsChart.jsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /e/Projects/ciniyana_frontend_v2
git add src/admin/pages/dashboard/components/VisitorsChart.jsx
git commit -m "Add VisitorsChart component"
```

---

### Task 8: Frontend — `MenuStatusTable`

**Files:**
- Create: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\MenuStatusTable.jsx`

**Interfaces:**
- Consumes: `timeAgo` from `../utils.js` (Task 5).
- Produces: `MenuStatusTable({ menus: [{ key, label, count, lastUpdatedAt }] })` component.

- [ ] **Step 1: Create the table component**

```jsx
// E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\components\MenuStatusTable.jsx
import { timeAgo } from '../utils'

export default function MenuStatusTable({ menus }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#eee] bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#faf8f5] text-xs font-semibold uppercase tracking-wide text-[#898781]">
          <tr>
            <th className="px-4 py-3">Menu</th>
            <th className="px-4 py-3">Posts</th>
            <th className="px-4 py-3">Last updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eee]">
          {menus.map((menu) => (
            <tr key={menu.key}>
              <td className="px-4 py-3 font-medium text-[#1a1a1a]">{menu.label}</td>
              <td className="px-4 py-3 text-[#52514e]">{menu.count}</td>
              <td className="px-4 py-3 text-[#52514e]">{timeAgo(menu.lastUpdatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Lint**

Run: `cd /e/Projects/ciniyana_frontend_v2 && npx oxlint src/admin/pages/dashboard/components/MenuStatusTable.jsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /e/Projects/ciniyana_frontend_v2
git add src/admin/pages/dashboard/components/MenuStatusTable.jsx
git commit -m "Add MenuStatusTable component"
```

---

### Task 9: Frontend — `api/stats.js` + assemble `DashboardPage` + routing

**Files:**
- Create: `E:\Projects\ciniyana_frontend_v2\src\api\stats.js`
- Modify: `E:\Projects\ciniyana_frontend_v2\src\api\index.js`
- Create: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\DashboardPage.jsx`
- Create: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\index.js`
- Delete: `E:\Projects\ciniyana_frontend_v2\src\admin\pages\DashboardPage.jsx`
- Modify: `E:\Projects\ciniyana_frontend_v2\src\admin\adminRoutes.jsx`

**Interfaces:**
- Consumes: `apiFetch` (`src/api/client.js`), `StatCard`/`PostsByMenuChart`/`VisitorsChart`/`MenuStatusTable` (Tasks 5-8).
- Produces: `fetchPostStats()`, `fetchVisitStats()` from `src/api/stats.js`; `DashboardPage` default export from `src/admin/pages/dashboard/index.js`.

- [ ] **Step 1: Create the stats API client**

```js
// E:\Projects\ciniyana_frontend_v2\src\api\stats.js
import { apiFetch } from './client'

export function fetchPostStats() {
  return apiFetch('/stats/posts')
}

export function fetchVisitStats() {
  return apiFetch('/visits/stats')
}
```

- [ ] **Step 2: Export it from `src/api/index.js`**

Add this line to `src/api/index.js` (anywhere alongside the other named exports, e.g. right after the `media.js` export line):

```js
export { fetchPostStats, fetchVisitStats } from './stats'
```

- [ ] **Step 3: Create `DashboardPage.jsx`**

```jsx
// E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\DashboardPage.jsx
import { useEffect, useState } from 'react'
import { fetchPostStats, fetchVisitStats } from '../../../api/stats'
import StatCard from './components/StatCard'
import PostsByMenuChart from './components/PostsByMenuChart'
import VisitorsChart from './components/VisitorsChart'
import MenuStatusTable from './components/MenuStatusTable'

export default function DashboardPage() {
  const [postStats, setPostStats] = useState(null)
  const [visitStats, setVisitStats] = useState(null)
  const [postError, setPostError] = useState('')
  const [visitError, setVisitError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([fetchPostStats(), fetchVisitStats()]).then(
      ([postsResult, visitsResult]) => {
        if (cancelled) return

        if (postsResult.status === 'fulfilled') {
          setPostStats(postsResult.value)
        } else {
          setPostError(postsResult.reason?.message || 'Failed to load post stats')
        }

        if (visitsResult.status === 'fulfilled') {
          setVisitStats(visitsResult.value)
        } else {
          setVisitError(visitsResult.reason?.message || 'Failed to load visitor stats')
        }

        setLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#ac222b]">Dashboard</h1>
        <div className="h-24 animate-pulse rounded-xl bg-[#f3f0eb]" />
        <div className="h-72 animate-pulse rounded-xl bg-[#f3f0eb]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#ac222b]">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {postError ? (
          <div className="rounded-xl border border-[#f3d0d2] bg-[#fdf2f3] p-5 text-sm text-[#ac222b]">
            {postError}
          </div>
        ) : (
          <StatCard label="Total posts" value={postStats.total} />
        )}

        {visitError ? (
          <div className="rounded-xl border border-[#f3d0d2] bg-[#fdf2f3] p-5 text-sm text-[#ac222b]">
            {visitError}
          </div>
        ) : (
          <StatCard label="Total visitors" value={visitStats.total} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {postStats ? <PostsByMenuChart menus={postStats.menus} /> : null}
        {visitStats ? <VisitorsChart daily={visitStats.daily} /> : null}
      </div>

      {postStats ? <MenuStatusTable menus={postStats.menus} /> : null}
    </div>
  )
}
```

- [ ] **Step 4: Create the folder's `index.js`**

```js
// E:\Projects\ciniyana_frontend_v2\src\admin\pages\dashboard\index.js
export { default as DashboardPage } from './DashboardPage'
```

- [ ] **Step 5: Delete the old placeholder file**

```bash
rm "E:\Projects\ciniyana_frontend_v2\src\admin\pages\DashboardPage.jsx"
```

- [ ] **Step 6: Update the import in `adminRoutes.jsx`**

Change:

```js
import DashboardPage from './pages/DashboardPage'
```

to:

```js
import { DashboardPage } from './pages/dashboard'
```

(This is the only line in `adminRoutes.jsx` that references `DashboardPage` — it's used as `<Route index element={<DashboardPage />} />` further down and needs no other change.)

- [ ] **Step 7: Lint everything touched**

Run: `cd /e/Projects/ciniyana_frontend_v2 && npx oxlint src/api/stats.js src/api/index.js src/admin/pages/dashboard/ src/admin/adminRoutes.jsx`
Expected: no output.

- [ ] **Step 8: Production build check**

Run: `cd /e/Projects/ciniyana_frontend_v2 && VITE_API_BASE_URL=http://localhost:5000 npx vite build --outDir /tmp/dashboard-build-check`
Expected: build succeeds with no new errors (pre-existing `no-useless-escape` warnings in unrelated `posts.js` files and the chunk-size warning are expected and fine). Then: `rm -rf /tmp/dashboard-build-check`.

- [ ] **Step 9: Commit**

```bash
cd /e/Projects/ciniyana_frontend_v2
git add -A -- src/api/stats.js src/api/index.js src/admin/pages/dashboard src/admin/adminRoutes.jsx
git status
```
Confirm the status shows `src/admin/pages/DashboardPage.jsx` as deleted and the new `src/admin/pages/dashboard/` files as added, then:
```bash
git commit -m "Assemble Dashboard page from stats API + chart/table components"
```

---

### Task 10: End-to-end verification + final cleanup

**Files:** none (verification only).

- [ ] **Step 1: Start both backends fresh**

```bash
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && npm run dev
```
(in one terminal/background process) — confirm log shows `DB Connection Successful` and `Server running on port 5000`.

```bash
cd /e/Projects/ciniyana_frontend_v2 && npm run dev
```
(in another terminal/background process, with `.env` containing `VITE_API_BASE_URL=http://localhost:5000` present — confirm fresh start, not a stale reused process, since Vite only reads `.env` at startup) — confirm log shows `ready in` and `Local: http://localhost:5173/`.

- [ ] **Step 2: Log in to the admin panel in a real browser and open the Dashboard**

Navigate to `http://localhost:5173/admin/login`, log in with the throwaway admin from Task 2, Step 4 (`plan-verify-admin@test.local` / `TestPass123!`), land on `/admin`.

Confirm:
- Two stat cards render with real numbers (Total posts, Total visitors) — not loading skeletons, not error boxes.
- "Posts by menu" bar chart renders 9 bars with visible labels; hovering a bar shows a tooltip with the menu name and post count.
- "Visitors — last 30 days" bar chart renders 30 bars; hovering shows a tooltip with the full date and visitor count.
- The menu status table lists all 9 menus with post counts and "X ago" / "Never" last-updated text.
- No console errors (check via the browser's console).

- [ ] **Step 3: Confirm the visit-tracking numbers move**

Note the "Total visitors" number on the dashboard. In a separate incognito/private browser window, visit `http://localhost:5173/` (the public homepage) once. Reload the admin Dashboard (`http://localhost:5173/admin`) — the "Total visitors" stat and today's bar in the visitors chart should have incremented by exactly 1.

- [ ] **Step 4: Confirm error-state handling**

Stop the backend (`Ctrl+C` on its process). Reload `http://localhost:5173/admin`. Confirm the Dashboard shows the two red error boxes ("Failed to load post stats" / "Failed to load visitor stats") instead of crashing or hanging on the loading skeleton forever. Restart the backend afterward.

- [ ] **Step 5: Full lint + build pass, both repos**

```bash
cd /e/Projects/ciniyana_frontend_v2 && npx oxlint src/
```
Expected: only the pre-existing unrelated `no-useless-escape` warnings in `posts.js` files (no new warnings/errors).

```bash
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && node --check app.js && node --check controllers/stats.js && node --check controllers/visits.js && node --check routes/stats.js && node --check routes/visits.js && node --check models/visit.js
```
Expected: no output, all pass.

- [ ] **Step 6: Delete the throwaway verification admin and its script**

```bash
cat > "E:\Projects\BACKEND_FILES\ciniyana_backend_v1\_plan_verify_admin.js" << 'EOF'
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const User = require("./models/user");

async function main() {
  await mongoose.connect(process.env.DB_URL);
  const result = await User.deleteOne({ email: "plan-verify-admin@test.local" });
  console.log("deleted test admin:", result.deletedCount);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
EOF
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && node _plan_verify_admin.js
rm _plan_verify_admin.js
```
Expected output: `deleted test admin: 1`. Confirm with `git status` in the backend repo that no `_plan_verify_admin.js` file remains (untracked, never committed — this just removes it from disk).

- [ ] **Step 7: Push both repos**

```bash
cd /e/Projects/ciniyana_frontend_v2 && git push
cd "E:\Projects\BACKEND_FILES\ciniyana_backend_v1" && git push
```

- [ ] **Step 8: Stop the dev servers started in Step 1**

Stop both the backend (`npm run dev` in `ciniyana_backend_v1`, started in Step 1) and frontend (`npm run dev` in `ciniyana_frontend_v2`, started in Step 1) processes — e.g. `Ctrl+C` in their terminals, or, if backgrounded, find and stop them by the port they're bound to (5000 and 5173 respectively). Confirm both `curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/` and `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/` fail to connect afterward — unless the user asked to keep them running for continued manual testing, in which case leave them up and say so.

Confirm no leftover processes are holding ports 5000/5173 that the user didn't ask to be left running (match whatever server-lifecycle behavior was used earlier in this session).
