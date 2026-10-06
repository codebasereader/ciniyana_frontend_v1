# Ciniyaana: EC2 / nginx Server Hardening Checklist

Context: a security audit (Digital Age Strategies, report `DigAge:TR:KCCA:2026-27:0319`, 6 Oct 2026) raised 7 Medium and 2 Low findings for `https://www.planclothes.xyz`. The auditors guessed Apache, but the server is **nginx** (Ubuntu 18.04 on EC2). Five of the nine findings can only be fixed on the server. This file lists exactly what to change.

The application code fixes (cookies, JWT lifetime, single-session login, upload validation, rate limiting) are done in the repos and go out with the next backend and frontend deploy. Items marked **(after backend deploy)** depend on that.

**Merge these settings into your existing config. Do not replace it.** The paths and the Node port below are examples; keep whatever you already use.

Take a snapshot (AMI) and back up the config first:

```bash
sudo cp -a /etc/nginx /etc/nginx.bak-$(date +%F)
```

---

## 1. Open ports (Finding 3: "Vulnerable Ports Open")

Only 80 and 443 should be reachable from the internet.

**a) AWS Security Group** (EC2 console → Instance → Security → Security group → Edit inbound rules)

| Type | Port | Source |
|---|---|---|
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| SSH | 22 | **your office/VPN IP only**, never 0.0.0.0/0 |

Delete every other inbound rule, in particular the Node port (3000/5000), MongoDB 27017, FTP and RDP.

**b) Host firewall (defense in depth)**

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80,443/tcp
sudo ufw allow from <ADMIN_IP> to any port 22 proto tcp
sudo ufw enable
sudo ufw status verbose
```

Check the SSH rule before enabling, or you will lock yourself out.

**c) Bind internal services to localhost**

- MongoDB (`/etc/mongod.conf`): `net: { bindIp: 127.0.0.1 }` and `security: { authorization: enabled }`, then `sudo systemctl restart mongod`. If you use MongoDB Atlas, skip this and use the Atlas IP allow-list.
- Node API: set `LISTEN_HOST=127.0.0.1` in the backend `.env` **(after backend deploy)** so it is reachable only through nginx.

**Verify** (from a machine outside the VPC):

```bash
nmap -Pn -p- <public-ip>     # only 80 and 443 (and 22 from the allowed IP)
```

Please send the original Nmap output from the report (Fig 3.1) to the developer. It names the exact ports the auditors flagged.

---

## 2. nginx configuration (Findings 1, 2, 8, 9)

### 2a. Global: hide the version (Finding 8)

In `/etc/nginx/nginx.conf`, inside the `http { }` block:

```nginx
server_tokens off;
```

This removes the version and OS from the `Server` header and from error pages. The header will still say `nginx`. To remove it completely, install `nginx-extras` and add `more_clear_headers Server;`. The version leak is the real issue.

### 2b. Security headers snippet

Create `/etc/nginx/snippets/security-headers.conf`:

```nginx
# HSTS: start with 300 seconds, test the site, then raise to 31536000 (1 year)
add_header Strict-Transport-Security "max-age=300; includeSubDomains" always;

# Clickjacking: nobody may frame the site
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "frame-ancestors 'none'" always;

add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

The `frame-ancestors` policy does not conflict with the CSP already in `index.html`; the browser applies both. The site embeds YouTube videos, which is the site framing YouTube, not the other way round, so videos are unaffected.

> **HSTS is sticky.** Browsers remember it for the whole `max-age`. Confirm the site and every `*.planclothes.xyz` subdomain work over HTTPS before raising it to a year.

### 2c. Server blocks

```nginx
# Port 80: redirect everything to HTTPS (Finding 1)
server {
    listen 80;
    server_name www.planclothes.xyz planclothes.xyz;
    return 301 https://www.planclothes.xyz$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.planclothes.xyz;

    # ssl_certificate / ssl_certificate_key: keep your existing lines (certbot)

    root /var/www/ciniyana/dist;          # <- your existing frontend path
    index index.html;

    # IMPORTANT: add_header is NOT inherited into a location that has its own
    # add_header. Keep the include in every such location (as below).
    include snippets/security-headers.conf;

    # Never serve hidden files (.env, .git, .htaccess ...)
    location ~ /\. { deny all; return 404; }

    # Single-page app. HTML is not gzipped (BREACH, Finding 9). JS/CSS still are.
    location = /index.html {
        gzip off;
        include snippets/security-headers.conf;
        add_header Cache-Control "no-cache" always;
    }
    location / {
        try_files $uri /index.html;
    }

    # API reverse proxy: keep your existing proxy_pass / port / path rewrite
    location /api/ {
        include snippets/security-headers.conf;
        # The backend (helmet) sets the same headers. Hide its copies so each
        # header is sent once, with the value from the snippet above.
        proxy_hide_header Strict-Transport-Security;
        proxy_hide_header X-Frame-Options;
        proxy_hide_header X-Content-Type-Options;
        proxy_hide_header Content-Security-Policy;
        proxy_hide_header Referrer-Policy;
        proxy_pass http://127.0.0.1:5000;          # <- your Node port
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Admin image uploads: the default 1 MB limit would break them.
        client_max_body_size 50m;
    }

    # Login/refresh responses are not compressed (BREACH)
    location /api/user/ {
        include snippets/security-headers.conf;
        # The backend (helmet) sets the same headers. Hide its copies so each
        # header is sent once, with the value from the snippet above.
        proxy_hide_header Strict-Transport-Security;
        proxy_hide_header X-Frame-Options;
        proxy_hide_header X-Content-Type-Options;
        proxy_hide_header Content-Security-Policy;
        proxy_hide_header Referrer-Policy;
        gzip off;
        proxy_pass http://127.0.0.1:5000;          # <- same upstream as above
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Notes:

- **`X-Forwarded-For` must be sent to Node.** The backend now trusts exactly one proxy hop (`trust proxy 1`) so its rate limits work per visitor. Without these headers every visitor shares one limit. If another proxy or load balancer sits in front of nginx, tell the developer so the hop count can be set (`TRUST_PROXY_HOPS`).
- If your API is proxied at a different path than `/api/` (the frontend `config.js` currently points at a bare host), keep your existing paths and only add the `include`, `gzip off` and header lines.
- Make sure `gzip on;` and `gzip_types` (css, javascript, json, svg) are enabled in `nginx.conf`. The 480 KB admin bundle needs it. HTML is excluded by the rules above.
- If the server sits behind an AWS load balancer or CloudFront that terminates TLS, port 80 on the instance may not exist; apply the redirect and HSTS at that layer instead.

---

## 3. Apply and test

```bash
sudo nginx -t                    # must say "syntax is ok" and "test is successful"
sudo systemctl reload nginx
```

Check headers:

```bash
curl -sI  https://www.planclothes.xyz/ | egrep -i "strict-transport|x-frame|content-security|x-content-type|^server|x-powered"
curl -sI  http://www.planclothes.xyz/ | head -3        # expect: 301 -> https
```

Expected: HSTS, `X-Frame-Options: DENY`, a `frame-ancestors 'none'` CSP, `nosniff`, `Server: nginx` with **no version**, and no `X-Powered-By`.

Check compression:

```bash
curl -sI -H "Accept-Encoding: gzip" https://www.planclothes.xyz/ | grep -i content-encoding                  # nothing
curl -sI -H "Accept-Encoding: gzip" https://www.planclothes.xyz/assets/<any>.js | grep -i content-encoding  # gzip
```

Check hidden files are blocked: `curl -sI https://www.planclothes.xyz/.env` should return 404.

Then open the site, log in to `/admin`, upload an image, and confirm pages and images load.

---

## 4. Backend `.env` on the server

File: the backend `.env` (never commit it). Restart the Node process afterwards (`pm2 restart <name>` or `sudo systemctl restart <service>`).

| Setting | Value | Why | When |
|---|---|---|---|
| `NODE_ENV` | `production` | Currently **missing**; part of why cookies lacked the `Secure` flag (Finding 4). | **Now.** Needs HTTPS (section 2). |
| `ACCESS_TOKEN_EXPIRY` | `15m` | Currently `480m` (8 hours) (Finding 7). The frontend refreshes silently, so users are not logged out. | **Now** |
| `REFRESH_TOKEN_EXPIRY` | `8h` | Currently `7d`. Acts as an idle timeout. | **Now** |
| `COOKIE_SECURE` | `true` | Explicit secure-cookie flag. | **(after backend deploy)** |
| `LISTEN_HOST` | `127.0.0.1` | Node listens only on localhost behind nginx. | **(after backend deploy)** |

Everyone has to log in again once after the backend deploy.

Do not enable secure cookies on a server still reached over plain `http://` (for example the `http://172.18.37.78` VPN address). Browsers discard Secure cookies there, and login will appear to fail.

---

## 5. Run the Node API as a managed service

Run the API under `pm2` or `systemd` as a **non-root** user (not one with sudo rights), with `.env` readable only by that user:

```bash
chmod 600 /path/to/backend/.env
```

Backend logs now include one JSON `"type":"audit"` line per login and admin change. Keep them (pm2/journald) and rotate them.

---

## 6. Operating system (recommended)

Ubuntu 18.04 reached end of standard support in 2023, and any future scan will keep flagging it.

- Short term: `sudo pro attach <token>` (Ubuntu Pro, free for up to 5 machines) for ESM security patches.
- Proper fix: build a new 22.04 or 24.04 instance, migrate, and switch the Elastic IP.
- Meanwhile: `sudo apt update && sudo apt upgrade` and reboot in a quiet window.

---

## Checklist

- [ ] AMI snapshot and `/etc/nginx` backup taken
- [ ] Security Group: only 80, 443, and 22 from the admin IP
- [ ] `ufw` enabled (SSH rule verified first)
- [ ] MongoDB bound to localhost with auth (or Atlas IP allow-list)
- [ ] `server_tokens off;` set
- [ ] HTTP -> HTTPS redirect works
- [ ] HSTS present (start at 300 s, then raise to 31536000)
- [ ] `X-Frame-Options: DENY` and `frame-ancestors 'none'` present on `/` and `/api/`
- [ ] No gzip on HTML and `/api/user/`; gzip still on JS and CSS
- [ ] `X-Forwarded-For` / `X-Forwarded-Proto` passed to Node; `client_max_body_size` set
- [ ] `/.env` returns 404
- [ ] `.env` updated (`NODE_ENV`, token expiries) and Node restarted
- [ ] `curl` header check and a manual admin login and image upload pass
- [ ] Re-run `nmap` from outside and send the result to the developer
