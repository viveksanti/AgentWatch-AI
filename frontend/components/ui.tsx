"use client";

import { Icon } from "./icons";
import type { Execution } from "@/lib/types";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function Empty({ title, text }: { title: string; text: string }) { return <div className="empty"><div className="empty-icon"><Icon name="pulse" /></div><h3>{title}</h3><p>{text}</p></div>; }

export function Loading() { return <div className="loading"><span/><span/><span/></div>; }

export function ErrorBanner({ message }: { message: string }) { return <div className="error-banner">{message}</div>; }

export function Status({ value }: { value: string }) { return <span className={`status ${value.toLowerCase()}`}><i />{value}</span>; }

export function ExecutionTable({ rows, onSelect }: { rows: Execution[]; onSelect?: (row: Execution) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>Agent</th><th>Task</th><th>Status</th><th>Model</th><th>Latency</th><th>Created</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} onClick={() => onSelect?.(row)} className={onSelect ? "clickable" : ""}><td><strong>{row.agent?.name ?? "Unknown"}</strong></td><td className="task-cell">{row.task}</td><td><Status value={row.status}/></td><td><code>{row.model}</code></td><td>{row.latency.toLocaleString()} ms</td><td>{new Date(row.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>;
}
