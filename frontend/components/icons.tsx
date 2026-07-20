import type { SVGProps } from "react";

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    agents: <><path d="M12 8V4H8"/><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M8 13h.01M16 13h.01M8 17h8"/></>,
    runs: <><path d="m9 18 6-6-6-6"/><path d="M3 12h12"/><path d="M17 4h4v16h-4"/></>,
    pulse: <><path d="M3 12h4l2-7 4 14 2-7h6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    play: <path d="m8 5 11 7-11 7Z"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
