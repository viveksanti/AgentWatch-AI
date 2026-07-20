"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const nav = [
  ["/", "Overview", "dashboard"], ["/agents", "Agents", "agents"],
  ["/executions", "Executions", "runs"], ["/observability", "Observability", "pulse"],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark"><span /></span><span>AgentWatch<small>AI OPERATIONS</small></span></Link>
      <nav>{nav.map(([href, label, icon]) => <Link key={href} href={href} className={pathname === href ? "active" : ""}><Icon name={icon} />{label}</Link>)}</nav>
      <div className="sidebar-foot"><span className="live-dot"/><div><strong>API connection</strong><small>localhost:3001</small></div></div>
    </aside>
    <div className="main-area">
      <header className="topbar"><div className="mobile-brand">AgentWatch</div><div className="top-status"><span className="live-dot"/>System operational</div><div className="avatar">AW</div></header>
      <main>{children}</main>
    </div>
  </div>;
}
