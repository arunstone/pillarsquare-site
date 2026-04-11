# Pillar Square Properties — Session Handoff Document

**Domain:** example.com  
**Stack:** React 18 + Vite + TypeScript + TailwindCSS + FastAPI + PostgreSQL 16  
**Session:** Phase 1 + 2A + 2B + 3 complete | Phase 4 in progress

---

## Phase 3 — Frontend (complete)

All pages built: `Home`, `Projects`, `ProjectDetail`, `Services`, `About`, `Blog`, `BlogDetail`, `Contact`, `NotFound`

**Design system:** dark theme (`--bg-primary #0a0a0f`), gold accents (`--accent-gold #c8a951`), dot-grid body background, Cormorant Garamond (headings) + Outfit (body) + JetBrains Mono (stats)

| File | Notes |
|------|-------|
| `src/pages/Home.tsx` | 4-layer parallax hero, about+stats, 2×2 glass services, 9-step timeline, masonry+filter projects, testimonial carousel, contact form |
| `src/pages/ContactPage.tsx` | Form → `POST /api/inquiries`; contact info from `useSettings()` with fallbacks; map at lat 12.9367 lng 80.2095 |
| `src/pages/BlogDetailPage.tsx` | `react-markdown` + `remark-gfm`; custom component map styled to design system |
| `src/pages/ServicesPage.tsx` | `icon_name` → Lucide icon map (`building-2`, `hard-hat`, `indian-rupee`, `wrench`); glass hover cards |
| `src/pages/AboutPage.tsx` | Team image → Unsplash placeholder |
| `src/components/Layout/Navbar.tsx` | Transparent → `rgba(10,10,15,0.85)` + blur(20px) + gold border after 50px scroll |
| `src/index.css` | `.glass` hover border/glow; dot-grid opacity 0.04 fixed; body color `--text-secondary` |

**Seed (`backend/app/seed.py`):** 6 projects (3 images each) + 3 blog posts — idempotent by slug  
**Deps added:** `react-markdown`, `remark-gfm`

---

## Phase 4 — Telegram/n8n (complete)

- Webhook: `POST /api/inquiries/webhook/telegram-inquiry`
- Auth: `X-Webhook-Secret` header (matches `WEBHOOK_SECRET` env var)
- `telegram-bot` service removed from `docker-compose.yml`
- n8n handles bot logic externally; FastAPI only receives webhook payload
- Tested: web and telegram inquiries both saving to DB

---

## Phase 5 — Docker & Deploy (complete)

- `docker-compose.prod.yml` — gunicorn + uvicorn workers, no exposed DB port, `uploads_data` shared volume, certbot auto-renew service
- `nginx/conf.d/default.conf` — gzip, security headers, HSTS, rate-limit on `/api/inquiries`, ACME challenge, SSL placeholder
- `scripts/deploy.sh` — git pull → build → migrate → seed (first-run only) → certbot → up --remove-orphans → health check
- `scripts/backup-db.sh` — pg_dump with timestamp, 7-day retention, cron-compatible
- `.env.example` — all current vars documented
- `README.md` — overview, quickstart, env reference, deploy guide, backup guide
- Pending: CI/CD GitHub Actions, Sentry error monitoring

---

## API Routes (key)

| Route | Auth | Notes |
|-------|------|-------|
| `GET /api/projects` | public | `?featured=true`, `?category=`, `?status=`, paginated |
| `GET /api/projects/{slug}` | public | eager-loads images |
| `GET /api/services` | public | ordered by `sort_order` |
| `GET /api/testimonials` | public | `?featured_only=true` |
| `GET /api/blog` | public | published only, paginated |
| `GET /api/blog/{slug}` | public | |
| `POST /api/inquiries` | public | name+phone required; rate-limited 5/hr/IP |
| `GET /api/settings` | public | returns `{key: value}` dict |
| `POST /api/admin/login` | — | returns JWT |
| `POST /api/admin/upload` | JWT | image upload → `/app/uploads/` |
| `GET /api/admin/inquiries` | JWT | filterable, paginated |
| `POST /api/webhook/telegram-inquiry` | — | **TODO** — n8n webhook target |

---

## Environment Variables (required)

`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `SECRET_KEY`, `DEBUG`, `ALLOWED_ORIGINS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `VITE_API_BASE_URL`, `DOMAIN`, `CERTBOT_EMAIL`

---

## Current Issues

- `telegram-bot` service still in docker-compose — remove once n8n webhook endpoint is added
- No admin panel frontend — JWT-protected routes exist but no CMS UI
- `src/pages/HomePage.tsx` orphan file (old version) — safe to delete
- No CI/CD or error monitoring yet
