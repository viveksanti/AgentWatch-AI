# AgentWatch

**A production-grade AI operations platform** — create agents, run them on real tasks, and monitor every execution with built-in observability.

🔗 **[Live demo](https://your-demo-url.vercel.app)** &nbsp;|&nbsp; Built with Next.js, NestJS, PostgreSQL, OpenAI

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
│  React 19        │                │  REST API        │              │  Prisma ORM  │
│  TypeScript      │                │  Prisma Client   │              └──────────────┘
│  Tailwind CSS    │                │  Throttler       │
│  Vercel          │                │  Scheduler       │     AI       ┌──────────────┐
└──────────────────┘                │  Railway         │ ──────────▶  │  OpenAI API  │
                                    └──────────────────┘              │  Gemini API  │
                                                                       └──────────────┘
```

---

## Engineering highlights

| Feature | Detail |
|---|---|
| **Dual AI provider** | OpenAI first, automatic Gemini fallback. Configurable timeout and model via env vars |
| **Simulation mode** | Full functionality with no API keys — realistic simulated responses, all executions recorded |
| **Demo protection** | Seeded agents marked `demo=true` in DB; server blocks delete/pause on them |
| **Rate limiting** | NestJS Throttler — 20 req/min per IP, applied globally except read-only observer endpoints |
| **Auto-prune** | `@Cron` job deletes executions older than 7 days nightly — no manual maintenance |
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
| Infra | Docker Compose (local), Railway (backend), Vercel (frontend), Neon (DB) |

---

## Project structure

```
agentwatch-ai/
├── docker-compose.yml        # one-command local stack
├── frontend/                 # Next.js dashboard
│   ├── app/                  # pages (overview, agents, executions, observability, about)
│   ├── components/           # app shell, icons, shared UI
│   ├── lib/                  # API client, TypeScript types
│   └── vercel.json           # Vercel deploy config
└── backend/                  # NestJS API
    ├── src/
    │   ├── agents/           # CRUD + demo protection + agent cap
    │   ├── executions/       # run, run-document, test, prune scheduler
    │   ├── observer/         # overview + per-agent breakdown endpoint
    │   ├── ai/               # OpenAI + Gemini with fallback + simulation
    │   └── prisma/           # DB service
    ├── prisma/
    │   ├── schema.prisma     # Agent (with demo flag) + Execution models
    │   ├── migrations/       # versioned SQL migrations
    │   └── seed.ts           # 5 demo agents seeded with demo=true
    ├── railway.json          # Railway deploy config
    └── nixpacks.toml         # Nixpacks build config
```

---

## Run locally (Docker — recommended)

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

## Deploy to production

### Backend → Railway

1. Create a new Railway project → **Deploy from GitHub repo** → select the repo
2. Set **Root Directory** to `backend`
3. Railway auto-detects `nixpacks.toml` for the build
4. Add a **PostgreSQL** plugin — Railway injects `DATABASE_URL` automatically
5. Set environment variables:

   | Variable | Value |
   |---|---|
   | `AI_SIMULATION` | `true` (or `false` + API keys for live mode) |
   | `FRONTEND_URL` | Your Vercel frontend URL |
   | `PORT` | `3001` |

### Frontend → Vercel

1. Import the repo in Vercel → set **Root Directory** to `frontend`
2. Add environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Your Railway backend URL + `/api` |

3. Deploy. Vercel handles everything else.

### Database → Neon (alternative to Railway Postgres)

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the connection string into Railway's `DATABASE_URL` env var

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
