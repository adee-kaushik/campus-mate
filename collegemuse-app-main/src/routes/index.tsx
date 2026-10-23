import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, NotebookPen, CheckCircle2, Circle } from "lucide-react";
import { useLocal, seeds, todayISO, type Task, type Assignment, type Note } from "@/lib/store";
import { cardCls, PriorityBadge, Empty } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusMate — Your smart study & campus assistant" },
      { name: "description", content: "Plan study tasks, track assignments, save notes and follow your timetable — all in one student dashboard." },
      { property: "og:title", content: "CampusMate — Your smart study & campus assistant" },
      { property: "og:description", content: "One simple dashboard for student tasks, deadlines, notes and revision." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [tasks, setTasks] = useLocal<Task[]>("tasks", seeds.tasks);
  const [assignments] = useLocal<Assignment[]>("assignments", seeds.assignments);
  const [notes] = useLocal<Note[]>("notes", seeds.notes);
  const today = tasks.filter((t) => t.date === todayISO());
  const done = today.filter((t) => t.done).length;
  const pct = today.length ? Math.round((done / today.length) * 100) : 0;
  const pending = assignments.filter((a) => a.status !== "Submitted").sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div className="space-y-6">
      <section className="bg-hero overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-soft md:p-10">
        <p className="text-sm font-medium opacity-80">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold md:text-5xl">Good to see you, student 👋</h1>
        <p className="mt-2 max-w-xl opacity-90">You've finished {done} of {today.length} tasks today. Keep going.</p>
        <div className="mt-6 h-3 w-full max-w-md overflow-hidden rounded-full bg-primary-foreground/25" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-primary-foreground transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm font-semibold">{pct}% complete</p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { to: "/planner", label: "Today's tasks", value: today.length, icon: CalendarCheck },
          { to: "/assignments", label: "Pending assignments", value: pending.length, icon: ClipboardList },
          { to: "/notes", label: "Saved notes", value: notes.length, icon: NotebookPen },
        ].map((s) => (
          <Link key={s.to} to={s.to} className={`${cardCls} transition hover:-translate-y-0.5`}>
            <s.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 font-display text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className={cardCls}>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Today's focus</h2><Link to="/planner" className="text-sm font-semibold text-primary">Add task →</Link></div>
          {today.length === 0 ? <Empty text="No tasks for today. Add one in the planner." /> : (
            <ul className="space-y-2">
              {today.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setTasks((p) => p.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-muted" aria-label={`Mark ${t.title} ${t.done ? "incomplete" : "complete"}`}>
                    {t.done ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <span className={`flex-1 text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                    <PriorityBadge p={t.priority} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={cardCls}>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Upcoming deadlines</h2><Link to="/assignments" className="text-sm font-semibold text-primary">View all →</Link></div>
          {pending.length === 0 ? <Empty text="Nothing pending. Nice work!" /> : (
            <ul className="divide-y">
              {pending.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.subject} · due {a.due}</p></div>
                  <PriorityBadge p={a.priority} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <p className="text-center text-xs text-muted-foreground">Demo data · saved only in this browser on this device.</p>
    </div>
  );
}
