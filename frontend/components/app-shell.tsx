"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const nav = [
  ["/", "Overview", "dashboard"], ["/agents", "Agents", "agents"],
  ["/executions", "Executions", "runs"], ["/observability", "Observability", "pulse"],
  ["/about", "About", "dashboard"],
];

function useApiStatus() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const check = () =>
      fetch(`${base}/agents`)
        .then(() => setOk(true))
        .catch(() => setOk(false));
    check();
    const statusTimer = setInterval(check, 20_000);
    // Keep-alive ping every 14 min — prevents Render free tier spin-down
    const pingTimer = setInterval(() => fetch(`${base}/ping`).catch(() => {}), 14 * 60_000);
    return () => { clearInterval(statusTimer); clearInterval(pingTimer); };
  }, []);
  return ok;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const apiOk = useApiStatus();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark"><span /></span><span>AgentWatch<small>AI OPERATIONS</small></span></Link>
      <nav>{nav.map(([href, label, icon]) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon name={icon} />{label}</Link>)}</nav>
      <div className="sidebar-foot">
        <span className={`live-dot${apiOk === false ? " dot-error" : ""}`}/>
        <div>
          <strong>{apiOk === null ? "Connecting…" : apiOk ? "API connected" : "API unreachable"}</strong>
          <small>{apiOk === false ? "Check backend is running" : "AgentWatch is live"}</small>
        </div>
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <div className="mobile-brand">AgentWatch</div>
        <div className="top-status">
          <span className={`live-dot${apiOk === false ? " dot-error" : ""}`}/>
          {apiOk === false ? "API unreachable" : "System operational"}
        </div>
        <div className="avatar">AW</div>
      </header>
      <main>{children}</main>
    </div>
  </div>;
}
