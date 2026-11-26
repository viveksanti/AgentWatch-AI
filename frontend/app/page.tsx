"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Overview } from "@/lib/types";
import { ExecutionTable, Loading, PageHeader } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function OverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.overview().then(setData).catch(e => setError(e.message)); }, []);
  return <div className="page">
    <PageHeader
      eyebrow="AgentWatch · AI Operations"
      title="Your AI workforce, in one place."
      description="Create agents, run them on real tasks, and monitor every execution — latency, tokens, cost, and success rate — without touching a config file."
      action={<Link className="button primary" href="/executions"><Icon name="play"/>Try it now</Link>}
    />
    {error && <div className="error-banner">Unable to reach the API — check that the backend is running. {error}</div>}

    <div className="hero-cards">
      <Link href="/executions" className="hero-card card">
        <div className="hero-card-icon violet"><Icon name="play"/></div>
        <strong>Run a task</strong>
        <p>Pick one of five pre-built agents — recruiting, research, content, code review, or support — edit the prompt and run it instantly.</p>
        <span className="hero-card-cta">Go to Executions →</span>
      </Link>
      <Link href="/agents" className="hero-card card">
        <div className="hero-card-icon blue"><Icon name="agents"/></div>
        <strong>Build an agent</strong>
        <p>Define a purpose, set a system prompt, and create an agent that persists and can be run repeatedly from any context.</p>
        <span className="hero-card-cta">Go to Agents →</span>
      </Link>
      <Link href="/observability" className="hero-card card">
        <div className="hero-card-icon green"><Icon name="pulse"/></div>
        <strong>Watch it run</strong>
        <p>Every execution is tracked — latency trend, token usage, success rate, and cost. The dashboard updates live as you use it.</p>
        <span className="hero-card-cta">Go to Observability →</span>
      </Link>
    </div>

    {!data ? <Loading/> : <>
      <section className="metric-grid">
        <Metric label="Total agents" value={data.agents} note={`${data.activeAgents} active`} icon="agents" tone="violet" />
        <Metric label="Executions" value={data.executions} note="All-time runs" icon="runs" tone="blue" />
        <Metric label="Success rate" value={`${data.successRate}%`} note={`${data.statuses.FAILED ?? 0} failed`} icon="pulse" tone="green" />
        <Metric label="Avg. latency" value={`${data.avgLatency}ms`} note="Last 100 runs" icon="dashboard" tone="orange" />
      </section>
      <section className="split-grid">
        <div className="card activity-card"><div className="card-head"><div><h2>Execution activity</h2><p>Response time across recent runs</p></div><Link href="/observability">View analytics</Link></div><MiniChart values={data.timeline.map(x => x.latency)}/></div>
        <div className="card health-card"><div className="card-head"><div><h2>System health</h2><p>Current operational state</p></div></div><div className="health-score"><div className="score-ring" style={{"--score": `${data.successRate * 3.6}deg`} as React.CSSProperties}><span>{Math.round(data.successRate)}<small>%</small></span></div><div><strong>Healthy</strong><p>All agents are operating normally.</p></div></div><div className="health-row"><span>Active agents</span><strong>{data.activeAgents}/{data.agents}</strong></div><div className="health-row"><span>Tokens processed</span><strong>{data.totalTokens.toLocaleString()}</strong></div></div>
      </section>
      <section className="card"><div className="card-head"><div><h2>Recent executions</h2><p>Latest activity across all agents</p></div><Link href="/executions">View all</Link></div>{data.latestExecutions.length ? <ExecutionTable rows={data.latestExecutions}/> : <div className="compact-empty">No executions yet — head to Executions and run your first task.</div>}</section>
    </>}
  </div>;
}

function Metric({ label, value, note, icon, tone }: { label: string; value: string | number; note: string; icon: string; tone: string }) { return <div className="metric card"><div className={`metric-icon ${tone}`}><Icon name={icon}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }
function MiniChart({ values }: { values: number[] }) { const points = (values.length ? values : [0]).slice(-20); const max = Math.max(...points, 1); return <div className="mini-chart">{points.map((v, i) => <span key={i} style={{height: `${Math.max(8, (v / max) * 100)}%`}} title={`${v} ms`}/>)}</div>; }
