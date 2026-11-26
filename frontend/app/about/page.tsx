"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";

const STACK = [
  { label: "Next.js 16", detail: "App Router, React 19, TypeScript", tone: "violet" },
  { label: "NestJS 11", detail: "REST API, modular architecture, TypeScript", tone: "blue" },
  { label: "PostgreSQL + Prisma", detail: "Relational DB, migrations, type-safe ORM", tone: "green" },
  { label: "OpenAI + Gemini", detail: "Dual-provider AI with automatic fallback", tone: "orange" },
  { label: "Docker Compose", detail: "One-command local and production deployment", tone: "violet" },
  { label: "Tailwind CSS", detail: "Utility-first styling, responsive layout", tone: "blue" },
];

const DECISIONS = [
  {
    title: "Simulation mode by default",
    body: "The app runs fully without API keys — all executions are recorded with realistic simulated responses. This means anyone can demo the product without spending credits, and developers can run it locally instantly.",
  },
  {
    title: "Dual AI provider with fallback",
    body: "OpenAI is tried first. If it fails or is unconfigured, the app automatically falls back to Gemini. The timeout, model, and fallback are all configurable via environment variables — no code changes needed.",
  },
  {
    title: "Protected demo agents",
    body: "The five seeded agents are marked demo=true in the database. The backend blocks delete and pause operations on them, so the demo is always in a working state regardless of visitor actions.",
  },
  {
    title: "Rate limiting + auto-prune",
    body: "The API enforces 20 requests per minute per IP using NestJS Throttler. A nightly cron job deletes executions older than 7 days, keeping the shared demo database clean without manual intervention.",
  },
  {
    title: "Observability as a first-class feature",
    body: "Every execution stores latency, token count, and cost. The observability page shows live trends, per-agent breakdown, and success/failure distribution — the kind of data that matters in production AI systems.",
  },
];

export default function AboutPage() {
  return (
    <div className="page">
      <div className="about-header">
        <div>
          <span className="eyebrow">About this project</span>
          <h1>AgentWatch</h1>
          <p className="about-subtitle">A full-stack AI operations platform built to demonstrate production-grade engineering — not just a tutorial project.</p>
        </div>
        <div className="about-links">
          <a className="button primary" href="https://github.com/viveksanti/AgentWatch-AI" target="_blank" rel="noopener noreferrer">
            <Icon name="agents"/> View on GitHub
          </a>
          <Link className="button subtle" href="/executions">
            <Icon name="play"/> Try the demo
          </Link>
        </div>
      </div>

      <section className="about-section card">
        <h2>What it does</h2>
        <p>AgentWatch is an AI agent operations dashboard. You create agents with custom roles and system prompts, run them on text tasks or uploaded documents, and monitor every execution with full observability — latency, token usage, estimated cost, and success rate.</p>
        <p>The platform supports five pre-built agent types (recruiting, research, content, engineering, support) and lets visitors build their own agents from templates and run them immediately — all without an account or API key.</p>
      </section>

      <section className="about-section card">
        <h2>Tech stack</h2>
        <div className="stack-grid">
          {STACK.map((s) => (
            <div key={s.label} className="stack-card">
              <div className={`metric-icon ${s.tone}`}><Icon name="dashboard"/></div>
              <strong>{s.label}</strong>
              <span>{s.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section card">
        <h2>Engineering decisions</h2>
        <div className="decisions-list">
          {DECISIONS.map((d) => (
            <div key={d.title} className="decision-item">
              <strong>{d.title}</strong>
              <p>{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section card">
        <h2>Architecture</h2>
        <div className="arch-diagram">
          <div className="arch-box arch-fe">
            <strong>Frontend</strong>
            <span>Next.js · Vercel</span>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-box arch-be">
            <strong>Backend API</strong>
            <span>NestJS · Railway</span>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-box arch-db">
            <strong>Database</strong>
            <span>PostgreSQL · Neon</span>
          </div>
          <div className="arch-arrow arch-arrow-ai">→</div>
          <div className="arch-box arch-ai">
            <strong>AI Providers</strong>
            <span>OpenAI · Gemini</span>
          </div>
        </div>
      </section>
    </div>
  );
}
