# Deployment — The Velvet Tray

End-to-end guide to ship the three apps to production.

## 0 · Architecture overview

```
            ┌──────────────┐                  ┌──────────────┐
   users →  │  web (Vercel)│ ───── REST ────▶ │  api (Render)│
            └──────────────┘                  │  Express     │
            ┌──────────────┐ ─── REST + WS ──▶│  Socket.io   │
   ops   →  │ admin (Vercel│                  └──────┬───────┘
            └──────────────┘                         │
                                                     ▼
                                            ┌──────────────────┐
                                            │ MongoDB (Atlas)  │
                                            └──────────────────┘
```

- **web**  → `thevelvettray.com`
- **admin** → `admin.thevelvettray.com` (IP-restricted or behind Cloudflare Access)
- **api**  → `api.thevelvettray.com`

## 1 · Prerequisites

| Service | Plan | Cost |
|---|---|---|
| MongoDB Atlas | M0 (free) for staging, M10 (~$57/mo) for prod | Free–$57 |
| Render / Fly / Railway | Starter ($7/mo) for the API | $7 |
| Vercel | Hobby (free) → Pro ($20/mo) at scale | $0–$20 |
| Razorpay | KYC'd account, Live keys | 2% per transaction |
| Shiprocket / Delhivery | Pay per shipment | per-shipment |
| Domain + DNS | Cloudflare | Free |

## 2 · Database — MongoDB Atlas

1. Sign up: https://cloud.mongodb.com
2. Create a cluster → free tier "M0" is enough for launch
3. Database access: create a user `velvettray` with a strong password
4. Network access: temporarily allow `0.0.0.0/0`, tighten to your API host's IPs after deploy
5. Connect → copy the `mongodb+srv://...` URI
6. Save the URI as the API's `MONGODB_URI` secret

## 3 · API — Render (recommended)

1. Push the repo to GitHub
2. Render → New → Web Service → connect repo, root directory `api/`
3. Build command: `npm ci && npm run build`
4. Start command: `node dist/index.js`
5. Environment:

```
NODE_ENV=production
PORT=4000
API_URL=https://api.thevelvettray.com
WEB_ORIGIN=https://thevelvettray.com,https://www.thevelvettray.com
ADMIN_ORIGIN=https://admin.thevelvettray.com
MONGODB_URI=<your Atlas URI>
JWT_ACCESS_SECRET=<32+ random chars>
JWT_REFRESH_SECRET=<32+ random chars>
COOKIE_DOMAIN=.thevelvettray.com
RAZORPAY_KEY_ID=<from Razorpay>
RAZORPAY_KEY_SECRET=<from Razorpay>
RAZORPAY_WEBHOOK_SECRET=<from Razorpay webhooks>
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SEED_ADMIN_EMAIL=concierge@thevelvettray.com
SEED_ADMIN_PASSWORD=<strong password>
```

6. Custom domain → `api.thevelvettray.com` → CNAME provided by Render
7. Health check path: `/v1/health`
8. After first deploy, run the seed once: `render shell` → `node dist/seed/index.js`
   *(or via Render's job runner; seed is idempotent)*

## 4 · Web — Vercel

1. Vercel → New Project → import repo, root `web/`
2. Framework: Next.js (auto-detected)
3. Environment:

```
NEXT_PUBLIC_API_URL=https://api.thevelvettray.com/v1
NEXT_PUBLIC_SITE_URL=https://thevelvettray.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=<rzp_live_...>
```

4. Domains: `thevelvettray.com`, `www.thevelvettray.com`
5. Deploy — first build takes 2–4 min

## 5 · Admin — Vercel (separate project)

1. Vercel → New Project → import repo, root `admin/`
2. Environment:

```
NEXT_PUBLIC_API_URL=https://api.thevelvettray.com/v1
NEXT_PUBLIC_API_ORIGIN=https://api.thevelvettray.com
```

3. Domain: `admin.thevelvettray.com`
4. **Restrict access** — pick one:
   - Vercel Pro: enable **Password protection** at project level
   - Cloudflare Access: put admin behind a Cloudflare Zero Trust app
   - Vercel firewall rules: allow only your office/VPN IPs

## 6 · Razorpay — production setup

1. Live mode → Settings → API Keys → generate `rzp_live_...` + secret
2. Webhooks → add `https://api.thevelvettray.com/v1/payments/webhook` *(stub today, route to add later)*
3. Webhook secret → save as `RAZORPAY_WEBHOOK_SECRET`
4. Test a real ₹1 payment end-to-end before going live

## 7 · Shipping — Shiprocket / Delhivery

The codebase has a `ShippingProvider` interface with a stub at
`api/src/services/shipping.service.ts`. To go live:

1. Get API credentials from Shiprocket
2. Implement a `ShiprocketProvider` class implementing `ShippingProvider`
3. Call `setShippingProvider(new ShiprocketProvider(...))` at API boot

Until then, the stub returns sensible quotes and tracking numbers prefixed `STUB-`.

## 8 · DNS — Cloudflare

| Record | Type | Value |
|---|---|---|
| `thevelvettray.com` | A | (Vercel anycast IP — copy from Vercel) |
| `www` | CNAME | `cname.vercel-dns.com` |
| `admin` | CNAME | `cname.vercel-dns.com` |
| `api` | CNAME | (Render-provided hostname) |

Set Cloudflare proxy to **DNS only** (grey cloud) for the API initially —
Socket.io websockets need a careful Cloudflare config; revisit once stable.

## 9 · Post-deploy checklist

- [ ] `curl https://api.thevelvettray.com/v1/ready` returns `{ ok: true, db: 'up' }`
- [ ] `curl https://thevelvettray.com/sitemap.xml` returns XML with hampers
- [ ] Sign in to admin with seeded creds and rotate the password
- [ ] Place a ₹1 test order on web, verify it appears in admin in realtime
- [ ] Set Razorpay spend cap so a runaway loop can't bill catastrophically
- [ ] Tighten Atlas IP allowlist
- [ ] Set up Render → Slack alert on failed deploys
- [ ] Schedule a daily MongoDB backup (Atlas M10+ does this automatically)

## 10 · Updating

```bash
git push origin main         # web + admin redeploy automatically on Vercel
                             # api redeploys automatically on Render
```

For schema changes, run a migration script in `api/src/migrations/`
before deploy. The seed script is idempotent — safe to re-run.

## 11 · Rollback

- **web / admin**: Vercel → Deployments → previous → "Promote to Production"
- **api**: Render → Deploys → previous → "Rollback"
- **db**: Atlas → Backups → point-in-time restore

Both Vercel and Render preserve the previous deploy as a one-click revert.

## 12 · Cost expectations (first 6 months)

| Stage | Monthly |
|---|---|
| Pre-launch (M0 + free Vercel + Render starter) | ~$7 |
| First 1k orders/mo (M10 + Vercel Pro + Render starter) | ~$84 + Razorpay 2% |
| 10k orders/mo (M30 + Vercel Pro + Render standard) | ~$240 + Razorpay 2% |

Razorpay is per-transaction so it scales with revenue, not flat.
