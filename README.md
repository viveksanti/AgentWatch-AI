# AgentWatch

**A production-grade AI operations platform** — create agents, run them on real tasks, and monitor every execution with built-in observability.

🔗 **[Live demo](https://your-demo-url.vercel.app)** &nbsp;·&nbsp; **[View on GitHub](https://github.com/YOUR_USERNAME/agentwatch-ai)**

> Built with Next.js · NestJS · PostgreSQL · OpenAI · Docker · Deployed free on Vercel + Render + Neon

---

## What it does

AgentWatch is a full-stack AI agent dashboard. You configure agents with custom roles and system prompts, run them on text tasks or uploaded documents (PDF, DOCX, TXT), and monitor every execution with full observability — latency, token usage, estimated cost, and success rate.

**Five pre-built agents are ready to use out of the box:**
- 🧑‍💼 **Resume Recruiter** — evaluates candidates against job descriptions
- 🔎 **Research Scout** — produces decision-ready research briefs
- ✍️ **Content Studio** — drafts product copy and campaigns
- 🛠️ **Code Reviewer** — reviews implementations for correctness and security
- 💬 **Support Copilot** — drafts empathetic customer support responses

Visitors can also **build their own agent** from a template (email drafter, meeting summarizer, SEO analyst, contract reviewer, sales coach, or fully custom), run a task, and see the result immediately — no account or API key required.

---

## Architecture

```
┌──────────────────┐     HTTPS      ┌──────────────────┐     SQL      ┌──────────────┐
│  Next.js 16      │ ────────────▶  │  NestJS 11       │ ──────────▶  │  PostgreSQL  │
│  React 19        │                │  REST API        │              │  Neon (free) │
│  TypeScript      │                │  Throttler       │              └──────────────┘
│  Tailwind CSS    │                │  Scheduler       │
│  Vercel (free)   │                │  Render (free)   │     AI       ┌──────────────┐
└──────────────────┘                └──────────────────┘ ──────────▶  │  OpenAI API  │
                                                                       │  Gemini API  │
                                                                       └──────────────┘
```

---

## Engineering highlights

| Feature | Detail |
|---|---|
| **Dual AI provider** | OpenAI first, automatic Gemini fallback. Configurable timeout and model via env vars |
| **Simulation mode** | Full functionality with no API keys — realistic simulated responses, all executions recorded |
| **Demo protection** | Seeded agents marked `demo=true` in DB; server blocks delete/pause on them server-side |
| **Rate limiting** | NestJS Throttler — 20 req/min per IP, applied globally; read-only endpoints exempt |
| **Auto-prune** | `@Cron` job deletes executions older than 7 days nightly — no manual maintenance |
| **Keep-alive ping** | Frontend pings `/api/ping` every 14 min — prevents Render free tier spin-down |
| **Document AI** | PDF, DOCX, TXT extraction via `pdf-parse` + `mammoth`; prompt-injected securely |
| **Observability** | Per-execution latency, tokens, cost; per-agent breakdown chart; 15s live refresh |
| **One-command local** | `docker compose up --build` — Postgres + backend + frontend, DB seeded automatically |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | NestJS 11, TypeScript, `@nestjs/throttler`, `@nestjs/schedule` |
| Database | PostgreSQL 16, Prisma ORM |
| AI | OpenAI SDK, Gemini REST API |
| Infra (local) | Docker Compose |
| Infra (production) | Vercel (frontend) · Render (backend) · Neon (database) — all free |

---

## Project structure

```
agentwatch-ai/
├── docker-compose.yml        # one-command local stack
├── render.yaml               # Render Infrastructure-as-Code (backend + DB)
├── frontend/                 # Next.js dashboard
│   ├── app/                  # pages: overview, agents, executions, observability, about
│   ├── components/           # app shell (keep-alive ping), icons, shared UI
│   ├── lib/                  # API client, TypeScript types
│   └── vercel.json           # Vercel deploy config
└── backend/                  # NestJS API
    ├── src/
    │   ├── agents/           # CRUD + demo protection + 50-agent cap
    │   ├── executions/       # run, run-document, test, nightly prune scheduler
    │   ├── observer/         # overview + per-agent breakdown endpoint
    │   ├── ai/               # OpenAI + Gemini with fallback + simulation
    │   └── app.controller.ts # health check + /api/ping keep-alive
    ├── prisma/
    │   ├── schema.prisma     # Agent (demo flag) + Execution models
    │   ├── migrations/       # versioned SQL migrations
    │   └── seed.ts           # 5 demo agents seeded with demo=true
    └── railway.json          # Railway deploy config (alternative)
```

---

## 🚀 Run locally (Docker — recommended)

```bash
git clone https://github.com/YOUR_USERNAME/agentwatch-ai.git
cd agentwatch-ai
docker compose up --build
```

Open **http://localhost:3000**. Database is created and seeded automatically.

### Enable live AI (optional)

Edit `docker-compose.yml`, uncomment and fill:

```yaml
# OPENAI_API_KEY: "sk-..."
# GEMINI_API_KEY: "..."
# AI_SIMULATION: "false"
```

Then `docker compose up --build`.

---

## ☁️ Deploy to production — free forever

**Stack: Vercel (frontend) + Render (backend) + Neon (database)**

No credit card required. No expiry.

### Step 1 — Database on Neon (2 min)

1. Sign up at [neon.tech](https://neon.tech) — free, no card
2. Create a new project → copy the **Connection string** (starts with `postgresql://...`)
3. Keep this tab open — you'll need the string in Step 2

### Step 2 — Backend on Render (5 min)

1. Sign up at [render.com](https://render.com) — free, no card
2. New → **Blueprint** → connect your GitHub repo
3. Render reads `render.yaml` automatically and creates the web service
4. In the Render dashboard, set these environment variables on the `agentwatch-backend` service:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Paste the Neon connection string from Step 1 |
   | `AI_SIMULATION` | `true` *(or `false` + API keys for live AI)* |
   | `FRONTEND_URL` | Leave blank for now — fill in after Step 3 |

5. Click **Deploy** — Render runs migrations, seeds demo agents, and starts the API
6. Copy your Render service URL (e.g. `https://agentwatch-backend.onrender.com`)

> **Cold start note:** Render's free tier spins down after 15 minutes of inactivity. The app automatically pings `/api/ping` every 14 minutes to prevent this while anyone has the tab open.

### Step 3 — Frontend on Vercel (3 min)

1. Sign up at [vercel.com](https://vercel.com) — free, no card
2. New Project → Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Your Render URL + `/api` e.g. `https://agentwatch-backend.onrender.com/api` |

5. Deploy — Vercel builds and publishes to a `*.vercel.app` URL

### Step 4 — Wire CORS (1 min)

Go back to Render → `agentwatch-backend` → Environment → set:

| Variable | Value |
|---|---|
| `FRONTEND_URL` | Your Vercel URL e.g. `https://agentwatch.vercel.app` |

Redeploy the backend. Done — your app is live.

---

### Live AI mode (optional)

Set `OPENAI_API_KEY` and/or `GEMINI_API_KEY` as environment variables on the Render service and change `AI_SIMULATION` to `false`. OpenAI is tried first; Gemini is used as automatic fallback.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Live mode | OpenAI API key |
| `OPENAI_BASE_URL` | No | Custom OpenAI-compatible endpoint |
| `GEMINI_API_KEY` | No | Gemini fallback key |
| `GEMINI_MODEL` | No | Gemini model — defaults to `gemini-2.5-flash` |
| `AI_PROVIDER_TIMEOUT_MS` | No | Per-provider timeout — defaults to 30s |
| `AI_SIMULATION` | No | `true` forces simulated responses |
| `FRONTEND_URL` | No | Comma-separated CORS origins |
| `PORT` | No | Backend port — defaults to 3001 |
| `NEXT_PUBLIC_API_URL` | No | Frontend API base URL — defaults to `http://localhost:3001/api` |

---

## Available scripts

| Area | Command | Purpose |
|---|---|---|
| Frontend | `npm run dev` | Development server |
| Frontend | `npm run build` | Production build |
| Backend | `npm run start:dev` | API in watch mode |
| Backend | `npm run build` | Compile TypeScript |
| Backend | `npm test` | Unit tests |
| Backend | `npm run db:setup` | Migrate + generate + seed |

---

## License

No license added yet.
