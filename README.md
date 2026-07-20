# AgentWatch

AgentWatch is a full-stack AI operations dashboard for creating, running, testing, and monitoring AI agents from one place. It provides execution history and observability for reliability, latency, token usage, and estimated cost.

The application works in simulation mode out of the box, so you can explore it without an OpenAI API key. Add a key when you are ready to run agents against a live model.

## Features

- Create and configure agents with custom prompts, models, and temperatures
- Run agents on text tasks or uploaded PDF, DOCX, and TXT documents
- Test agent responses against expected keywords
- Review execution output, status, errors, latency, tokens, and estimated cost
- Monitor platform health, execution trends, and success rates
- Start with seeded demo agents for recruiting, research, content, engineering, and support
- Use simulation mode locally without consuming API credits

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts
- **Backend:** NestJS 11, TypeScript, Prisma
- **Database:** PostgreSQL
- **AI:** OpenAI API

## Project structure

```text
agentwatch-ai/
├── frontend/    # Next.js dashboard
└── backend/     # NestJS API, Prisma schema, migrations, and seed data
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL

### 1. Configure the backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and update the database connection:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agentwatch?schema=public"
OPENAI_API_KEY=""
AI_SIMULATION="true"
FRONTEND_URL="http://localhost:3000"
PORT="3001"
```

Prepare and seed the database, then start the API:

```bash
npm run db:setup
npm run start:dev
```

The API will be available at `http://localhost:3001/api`.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Live AI mode

Set `OPENAI_API_KEY` in `backend/.env` and change `AI_SIMULATION` to `false`, then restart the backend. You can also set `OPENAI_BASE_URL` when using an OpenAI-compatible endpoint.

## Available scripts

Run scripts from their respective directories.

| Area | Command | Purpose |
| --- | --- | --- |
| Frontend | `npm run dev` | Start the development server |
| Frontend | `npm run build` | Create a production build |
| Frontend | `npm run lint` | Run ESLint |
| Backend | `npm run start:dev` | Start the API in watch mode |
| Backend | `npm run build` | Compile the API |
| Backend | `npm test` | Run unit tests |
| Backend | `npm run test:e2e` | Run end-to-end tests |
| Backend | `npm run db:setup` | Apply migrations, generate Prisma Client, and seed demo agents |

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Live mode only | OpenAI API key |
| `OPENAI_BASE_URL` | No | Custom OpenAI-compatible API endpoint |
| `AI_SIMULATION` | No | Set to `true` to force simulated responses |
| `FRONTEND_URL` | No | Comma-separated allowed CORS origins |
| `PORT` | No | Backend port; defaults to `3001` |
| `NEXT_PUBLIC_API_URL` | No | Frontend API URL; defaults to `http://localhost:3001/api` |

## License

No license has been added yet.
