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
    <PageHeader eyebrow="Command center" title="Good to see you." description="Here’s what your AI workforce has been doing." action={<Link className="button primary" href="/executions"><Icon name="play"/>Run a task</Link>}/>
    {error && <div className="error-banner">Unable to reach the API. Start the backend on port 3001. {error}</div>}
    {!data ? <Loading/> : <>
      {data.runtimeMode === "SIMULATION" && <div className="mode-banner"><strong>Simulation mode</strong><span>Executions are recorded normally, but responses are simulated until OPENAI_API_KEY is added to backend/.env.</span></div>}
      <section className="metric-grid">
        <Metric label="Total agents" value={data.agents} note={`${data.activeAgents} active`} icon="agents" tone="violet" />
        <Metric label="Executions" value={data.executions} note="All-time runs" icon="runs" tone="blue" />
        <Metric label="Success rate" value={`${data.successRate}%`} note={`${data.statuses.FAILED ?? 0} failed`} icon="pulse" tone="green" />
        <Metric label="Avg. latency" value={`${data.avgLatency}ms`} note="Last 100 runs" icon="dashboard" tone="orange" />
      </section>
      <section className="split-grid">
        <div className="card activity-card"><div className="card-head"><div><h2>Execution activity</h2><p>Performance across recent runs</p></div><Link href="/observability">View analytics</Link></div><MiniChart values={data.timeline.map(x => x.latency)}/></div>
        <div className="card health-card"><div className="card-head"><div><h2>System health</h2><p>Current operational state</p></div></div><div className="health-score"><div className="score-ring" style={{"--score": `${data.successRate * 3.6}deg`} as React.CSSProperties}><span>{Math.round(data.successRate)}<small>%</small></span></div><div><strong>Healthy</strong><p>Your agents are operating normally.</p></div></div><div className="health-row"><span>Active agents</span><strong>{data.activeAgents}/{data.agents}</strong></div><div className="health-row"><span>Tokens processed</span><strong>{data.totalTokens.toLocaleString()}</strong></div></div>
      </section>
      <section className="card"><div className="card-head"><div><h2>Recent executions</h2><p>Latest activity across your agents</p></div><Link href="/executions">View all</Link></div>{data.latestExecutions.length ? <ExecutionTable rows={data.latestExecutions}/> : <div className="compact-empty">No executions yet. Run your first task to see activity here.</div>}</section>
    </>}
  </div>;
}

function Metric({ label, value, note, icon, tone }: { label: string; value: string | number; note: string; icon: string; tone: string }) { return <div className="metric card"><div className={`metric-icon ${tone}`}><Icon name={icon}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }
function MiniChart({ values }: { values: number[] }) { const points = (values.length ? values : [0]).slice(-20); const max = Math.max(...points, 1); return <div className="mini-chart">{points.map((v, i) => <span key={i} style={{height: `${Math.max(8, (v / max) * 100)}%`}} title={`${v} ms`}/>)}</div>; }
