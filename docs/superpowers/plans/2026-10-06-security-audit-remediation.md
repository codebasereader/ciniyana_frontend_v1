# Security Audit Remediation Plan — Ciniyaana

> **Correction:** the web server is **nginx**, not Apache as the auditors guessed. Wherever this plan says Apache, .htaccess, mod_* or ServerTokens, read the nginx equivalent in docs/EC2-server-hardening.md. No .htaccess is shipped in the frontend build.

Source: Digital Age Strategies report `DigAge:TR:KCCA:2026-27:0319` (6 Oct 2026) — 0 High, 7 Medium, 2 Low.
Repos: **FE** = `E:\Projects\ciniyana_frontend_v2`, **BE** = `E:\Projects\BACKEND_FILES\ciniyana_backend_v1` (separate git repo).

## How the app is deployed (why some fixes live outside the code)

The audit hit `https://www.planclothes.xyz`, fingerprinted **Ubuntu 18.04 + Apache**. The frontend is delivered as a `dist` zip and Apache serves it; the Node/Express API sits behind it. So:

- Findings 1, 2, 3, 8, 9 are **web-server** findings. The code repos can only fix them partly. The FE can ship an `.htaccess` inside `dist` (works if the host has `AllowOverride All` plus `mod_headers`, `mod_rewrite`, `mod_deflate`). The rest goes to whoever administers the server as a ready-made config snippet (Appendix A).
- Findings 4, 5, 6, 7 are **real code/config defects in the BE**.

## Root cause and fix per finding

| # | Finding | Why it happened | Fix | Workflow impact |
|---|---|---|---|---|
| 4 | Cookie without `Secure` (CWE-614) | `utils/cookies.js` sets `secure: process.env.NODE_ENV === "production"`. The server `.env` has **no `NODE_ENV`**, so prod runs with `secure:false, sameSite:"lax"`. | Replace the implicit switch with explicit env flags `COOKIE_SECURE` and `COOKIE_SAMESITE`. Default is secure unless `NODE_ENV=development`. Set `NODE_ENV=production` and `COOKIE_SECURE=true` in the server `.env`. Use `sameSite: "lax"` when the FE and API share a registrable domain (they do on planclothes.xyz). Use `"none"` only for a true cross-site setup. | None on HTTPS. **Secure cookies are dropped over plain `http://`** (e.g. the `http://172.18.37.78` VPN address in `config.js`). Keep `COOKIE_SECURE=false` only in a local/UAT `.env` that is served over http. |
| 7 | JWT lifetime too long (CWE-613) | `.env` has `ACCESS_TOKEN_EXPIRY=480m` (8 h), probably raised to avoid mid-edit logouts. | Set `ACCESS_TOKEN_EXPIRY=15m` and `REFRESH_TOKEN_EXPIRY=8h`. Make the code defaults match. | **None.** The FE already refreshes silently (`apiFetch` plus `useSessionExpiry`). 8 h of refresh acts as a rolling idle timeout: active admins are never logged out, and an abandoned session dies after 8 h. |
| 5 | Simultaneous login (CWE-613) | Tokens are stateless. Nothing records which session is current, so any number can coexist. Logout only clears cookies, and a stolen token stays valid. | Add `activeSessionId` to the `User` model. On login, generate a random `sid`, store it, and embed it in both tokens. `authenticate` and `refresh` load the user and reject if `token.sid !== user.activeSessionId`. Logout clears `activeSessionId`, which also gives real server-side invalidation. FE: when the API returns `401` with code `SESSION_REPLACED`, show "You were signed out because this account signed in elsewhere". | **Needs your decision, see Q1.** The newest login wins and the older one is signed out. If one shared account is used on two devices at once, they will bump each other. Cost is one indexed `findById` per admin request. |
| 6 | Double-extension upload (CWE-434) | `middleware/upload.js` accepts a file if the extension **OR** the client-supplied mimetype matches an unanchored regex. `shell.php.jpg` passes, and so does `x.php` sent with `image/png`. There is no content check. (Saved names are already server-generated, e.g. `hero.jpg`, which limits damage.) | In `upload.js`: (a) require extension **AND** mimetype to be allowed; (b) reject a name with a dangerous or image-type inner extension segment, plus null bytes (`a.php.jpg`, `a.jpg.png`; `Photo.01.jpg` is still fine); (c) after multer writes the temp file, check **magic bytes** (JPEG/PNG/GIF/WebP). On mismatch, delete the temp file and return 400. On match, normalise the extension to the detected type. Wrap multer's `single`/`fields` so all 6+ routes get this with no route edits. Also send `X-Content-Type-Options: nosniff` on `/api/images`. FE: mirror the filename rule in `ImageUploadField`/`GalleryEditor` for a friendly error (UX only). | Normal `.jpg/.png/.webp/.gif` uploads are unchanged. Only disguised or renamed files are refused. |
| 1 | HSTS missing (CWE-319) | Apache serves the FE and sends no `Strict-Transport-Security`. Helmet on the API sends a weak default (no `includeSubDomains`). | FE `public/.htaccess`: redirect http to https **only for the real hostnames** (so the internal IP is untouched) and send `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HTTPS only). BE: set helmet `hsts` explicitly. | None. Browsers ignore HSTS over http and for raw IPs. **Caution:** HSTS is sticky for a year, so confirm every `*.planclothes.xyz` subdomain has valid HTTPS first. Start with `max-age=300`, then raise it. |
| 2 | Clickjacking (CWE-1021) | No `X-Frame-Options` or `frame-ancestors` on the FE host. A `<meta>` CSP **cannot** carry `frame-ancestors`, so the existing meta CSP does not help. | FE `.htaccess`: `X-Frame-Options: DENY` and a second header `Content-Security-Policy: frame-ancestors 'none'`. A frame-ancestors-only policy intersects with the existing meta CSP, so it cannot break anything. BE: `helmet({ frameguard:{action:"deny"} })`. | None. The only iframe is the outbound YouTube player, which is unaffected. |
| 8 | `Server` header leak (CWE-200) | Apache default `ServerTokens OS` advertises Apache and the OS version. | Appendix A (server admin): `ServerTokens Prod`, `ServerSignature Off`. FE `.htaccess`: `Header always unset Server` and `X-Powered-By`, best effort. BE: `app.disable("x-powered-by")` made explicit. | None. |
| 3 | Vulnerable ports open (CWE-284) | Nmap saw extra listening services on the host. I can't see the port list from the PDF figure. | Appendix A: `ufw` default-deny, allow only 80/443. Restrict SSH to the admin IP or VPN. Bind MongoDB to `127.0.0.1` with auth. BE: optional `LISTEN_HOST` env so Node can bind `127.0.0.1` behind Apache. Default is unchanged so nothing breaks. | None if Apache proxies to Node. If anything hits Node's port directly, leave `LISTEN_HOST` unset. **Please send the Nmap screenshot (Fig 3.1)** so I can name the exact ports. |
| 9 | BREACH / gzip (Low, CVE-2013-3587) | `mod_deflate` compresses HTML. BREACH needs a secret **and** attacker-reflected input in one compressed response. | Don't turn compression off. Stop compressing only the HTML document (`index.html` is about 3 KB) and `/api/user/*` responses. Keep gzip for the 480 KB JS bundle and the CSS. The scanner stops flagging `/`, and there is no performance loss. Config is in `.htaccess` (FE) and Appendix A (API). | None. |

## Extra weaknesses the audit table recorded but left out of the 9 findings

The test-case table marked these "Found"/defective. A re-audit will probably raise them, so I recommend fixing them in the same pass (Phase 4).

| Observation | Cause | Fix |
|---|---|---|
| No rate limiting / lockout; API flooding | `app.set("trust proxy")` is missing. Behind Apache every request appears to come from one proxy IP, so `authLimiter` (10/15 min) is shared by **everyone** and cannot tell attackers from admins. Only `/user/*` has a limiter. | `trust proxy: 1`, add a general `/api` limiter (about 300/min per IP), and a stricter per-account login limiter. |
| Username enumeration | `login` skips `bcrypt.compare` when the email is unknown, so the timing differs. `register` answers `409 Email already registered`. | Always run a dummy bcrypt compare. Keep the 409 (register is admin-only) but return it only to authenticated admins, which is already the case. |
| Stack traces on malformed input | Upload controllers return `error: uploadError.message`. Malformed JSON ends in the generic 500 handler instead of a 400. | Remove `error:` from responses. Add a 400 branch for body-parse errors. Never return `err.message` to the client. |
| Audit logging weak for admin actions | Only `morgan("dev")` console output. | Small `utils/audit.js` that logs actor, action, entity and time (create/update/delete/reorder, login, logout) to a file or collection. |
| Outdated libraries | `npm audit`: BE `proxy-addr` **critical** (IP spoofing, which also undermines rate limiting). FE `source-map-js` **high** (build-time only). | `npm audit fix` in both repos, then rebuild and smoke-test. |
| "IDOR" on another user's resources | All accounts are `admin`, so every admin can edit everything by design. | No change. I'll note it in the compliance reply as accepted by design. |

## Execution order

1. **Phase 1, BE config only (no code):** the `.env` values `ACCESS_TOKEN_EXPIRY=15m`, `REFRESH_TOKEN_EXPIRY=8h`, `NODE_ENV=production`, `COOKIE_SECURE=true`. (Findings 4 and 7.)
2. **Phase 2, BE code:** cookies flags, helmet (HSTS, frameguard, nosniff), `x-powered-by` off, `trust proxy`, upload hardening, single-session login. (Findings 4, 5, 6, 8, plus parts of 1, 2.)
3. **Phase 3, FE:** `public/.htaccess`, "signed out elsewhere" message, client-side filename check. (Findings 1, 2, 5, 6, 8, 9.)
4. **Phase 4, extras:** rate limiters, enumeration timing, error leaks, audit log, `npm audit fix` in both repos.
5. **Server admin handover:** Appendix A. (Findings 1, 2, 3, 8, 9 at server level.)
6. **Verify:** `curl -I` header checks, a cookie flag check in DevTools, upload tests (`a.php.jpg`, `a.jpg.png`, a PNG renamed `.jpg`, a normal JPEG), a two-browser login test, JWT `exp` decode, and a full admin create/edit/reorder/delete run in the browser. Then rebuild `dist` and send the updated audit hashes. Each backend change gets a small test using Node's built-in `node:test`, since the BE has none today.

## Open questions

- **Q1 (affects Finding 5):** Is any admin account shared by two people or devices at the same time? If yes, "newest login wins" will log the other person out. The alternatives are "reject a new login while one is active" or a "sign out other devices" button.
- **Q2:** Is the FE and API on the **same domain** (planclothes.xyz, API under `/api`)? I'm assuming yes, which allows `SameSite=Lax`. Note that `config.js` points at `http://172.18.37.78` with no `/api` prefix; I'll confirm how production is proxied before touching cookies.
- **Q3:** Can the server admin apply Appendix A? If not, `.htaccess` will only cover what Apache allows there. `ServerTokens`, the firewall and MongoDB binding can't be fixed from the code.

## Appendix A

Superseded: the server is nginx, not Apache. All server-level config (HSTS, clickjacking, server_tokens, gzip/BREACH, ports) is in docs/EC2-server-hardening.md.
