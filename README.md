# The Velvet Tray

A curated premium gifting house. Monorepo containing:

| Workspace | Stack | Purpose |
|-----------|-------|---------|
| `api/`    | Node · Express · TypeScript · MongoDB · Socket.io | REST + realtime backend |
| `web/`    | Next.js 14 · Tailwind · TypeScript | Public storefront (thevelvettray.com) |
| `admin/`  | Next.js 14 · Tailwind · TypeScript · Socket.io client | Internal operations panel |

## Architecture

```
                    ┌────────────────────┐
                    │  Admin Panel (3001)│◀── realtime: orders, stock, enquiries
                    └─────────┬──────────┘
                              │ REST + WS
                              ▼
 Web (3000) ───── REST ──▶  API (4000) ──▶ MongoDB
                              │
                              ├─▶ Razorpay (stub)
                              ├─▶ Shiprocket / Delhivery (stub)
                              └─▶ Email / WhatsApp (stub)
```

## Local development

```bash
# 1. Install
cd api && npm install
cd ../web && npm install
cd ../admin && npm install

# 2. Configure
cp api/.env.example api/.env
cp web/.env.example web/.env.local
cp admin/.env.example admin/.env.local

# 3. Seed
cd api && npm run seed

# 4. Run (three terminals)
cd api   && npm run dev   # :4000
cd web   && npm run dev   # :3000
cd admin && npm run dev   # :3001
```

## Production

Each app ships a `Dockerfile`. Deploy:

- **api** → Fly.io / Render / Railway (attach MongoDB Atlas)
- **web** → Vercel
- **admin** → Vercel (protected by Cloudflare Access or IP allowlist)

## Branding

- Deep crimson `#7A1F2B` · Ivory `#F6F1E7` · Warm gold `#B08542`
- Headings: *Cormorant Garamond* · Body: *Inter*
- Tone: classic, premium, culturally rooted, calm, editorial
