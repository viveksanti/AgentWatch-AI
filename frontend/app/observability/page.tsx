"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Overview } from "@/lib/types";
import { ErrorBanner, Loading, PageHeader } from "@/components/ui";

export default function ObservabilityPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = () => api.overview().then(setData).catch(e => setError(e.message));
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page">
      <PageHeader eyebrow="Live telemetry" title="Observability" description="Track reliability, speed, usage, and spend across your AI workforce." action={<span className="refresh-note"><i/>Refreshes every 15s</span>}/>
      {error && <ErrorBanner message={error}/>}
      {!data ? <Loading/> : <>
        <section className="metric-grid">
          <ObsMetric label="Success rate" value={`${data.successRate}%`} detail="All executions"/>
          <ObsMetric label="Average latency" value={`${data.avgLatency} ms`} detail="Last 100 executions"/>
          <ObsMetric label="Tokens processed" value={data.totalTokens.toLocaleString()} detail="Last 100 executions"/>
          <ObsMetric label="Estimated cost" value={`$${data.totalCost.toFixed(4)}`} detail="Tracked usage"/>
        </section>

        <section className="split-grid analytics">
          <div className="card">
            <div className="card-head"><div><h2>Latency trend</h2><p>Response time per execution</p></div></div>
            <LineChart values={data.timeline.map(x => x.latency)} label="ms"/>
          </div>
          <div className="card">
            <div className="card-head"><div><h2>Token usage</h2><p>Tokens consumed per execution</p></div></div>
            <LineChart values={data.timeline.map(x => x.tokens)} label="tokens"/>
          </div>
        </section>

        <section className="split-grid analytics">
          <div className="card">
            <div className="card-head"><div><h2>Execution outcomes</h2><p>Success and failure distribution</p></div></div>
            <div className="outcome">
              <div className="donut" style={{"--success": `${data.successRate * 3.6}deg`} as React.CSSProperties}><span>{data.executions}</span></div>
              <div className="legend">
                <p><i className="green"/>Successful <strong>{data.statuses.SUCCESS ?? 0}</strong></p>
                <p><i className="red"/>Failed <strong>{data.statuses.FAILED ?? 0}</strong></p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div><h2>Runtime summary</h2><p>Current platform totals</p></div></div>
            <div className="summary-list">
              <div><span>Total agents</span><strong>{data.agents}</strong></div>
              <div><span>Active agents</span><strong>{data.activeAgents}</strong></div>
              <div><span>Total executions</span><strong>{data.executions}</strong></div>
              <div><span>Operational status</span><strong className="operational">Healthy</strong></div>
            </div>
          </div>
        </section>

        {data.agentBreakdown?.length > 0 && (
          <section className="card">
            <div className="card-head"><div><h2>Runs per agent</h2><p>Execution volume and token usage by agent</p></div></div>
            <div className="agent-breakdown">
              {data.agentBreakdown.map((row) => {
                const max = data.agentBreakdown[0].runs;
                const pct = Math.max(4, Math.round((row.runs / max) * 100));
                return (
                  <div key={row.agentId} className="ab-row">
                    <span className="ab-name">{row.name}</span>
                    <div className="ab-bar-wrap">
                      <div className="ab-bar" style={{ width: `${pct}%` }}/>
                    </div>
                    <span className="ab-runs">{row.runs} run{row.runs !== 1 ? "s" : ""}</span>
                    <span className="ab-tokens">{row.tokens.toLocaleString()} tokens</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </>}
    </div>
  );
}

function ObsMetric({label,value,detail}:{label:string;value:string;detail:string}) {
  return <div className="metric card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function LineChart({ values, label }: { values: number[]; label: string }) {
  const v = (values.length ? values : [0]).slice(-30);
  const max = Math.max(...v, 1);
  const pts = v.map((n,i) => `${(i / Math.max(v.length - 1, 1)) * 100},${92 - (n/max)*78}`).join(" ");
  return (
    <div className="line-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fill-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7457e8" stopOpacity=".28"/>
            <stop offset="1" stopColor="#7457e8" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${pts} 100,100`} fill={`url(#fill-${label})`}/>
        <polyline points={pts} fill="none" stroke="#7457e8" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
      </svg>
      <div className="chart-axis"><span>Oldest</span><strong>{Math.round(v.at(-1) ?? 0)} {label}</strong><span>Latest</span></div>
    </div>
  );
}
