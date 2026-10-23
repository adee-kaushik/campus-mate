import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GraduationCap, LayoutDashboard, CalendarCheck, ClipboardList, NotebookPen, Lightbulb, CalendarDays, Info } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "Planner", icon: CalendarCheck },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/quiz", label: "Quiz", icon: Lightbulb },
  { to: "/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/about", label: "About", icon: Info },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></span>
            Campus<span className="text-primary">Mate</span>
          </Link>
          <nav className="ml-auto hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-12">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t bg-card md:hidden">
        {nav.slice(0, 6).map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
            activeProps={{ className: "text-primary" }}>
            <n.icon className="h-5 w-5" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</div>;
}

export function PriorityBadge({ p }: { p: "Low" | "Medium" | "High" }) {
  const cls = p === "High" ? "bg-destructive/10 text-destructive" : p === "Medium" ? "bg-warning/15 text-warning-foreground" : "bg-success/15 text-success";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{p}</span>;
}

export const inputCls = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const btnCls = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const cardCls = "rounded-2xl border bg-card p-5 shadow-soft";
