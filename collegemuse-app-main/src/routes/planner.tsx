import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, CheckCircle2, Circle, Plus } from "lucide-react";
import { useLocal, seeds, uid, todayISO, validateTitle, type Task, type Priority } from "@/lib/store";
import { PageHeader, cardCls, inputCls, btnCls, PriorityBadge, Empty } from "@/components/AppShell";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — CampusMate" },
      { name: "description", content: "Add, complete and organise your daily study tasks." },
      { property: "og:title", content: "Study Planner — CampusMate" },
      { property: "og:description", content: "Add, complete and organise your daily study tasks." },
    ],
  }),
  component: Planner,
});

function Planner() {
  const [tasks, setTasks] = useLocal<Task[]>("tasks", seeds.tasks);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(todayISO());
  const [priority, setPriority] = useState<Priority>("Medium");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Done">("All");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateTitle(title);
    setError(err);
    if (err) return;
    setTasks((p) => [{ id: uid(), title: title.trim(), subject: subject.trim() || "General", date, priority, done: false }, ...p]);
    setTitle(""); setSubject("");
  };
  const shown = tasks.filter((t) => filter === "All" || (filter === "Done" ? t.done : !t.done)).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader title="Study Planner" subtitle="Plan what to study and tick it off." />
      <form onSubmit={add} className={`${cardCls} mb-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]`}>
        <div>
          <label className="sr-only" htmlFor="t">Task title</label>
          <input id="t" className={inputCls} placeholder="e.g. Revise Physics chapter 3" value={title} onChange={(e) => setTitle(e.target.value)} />
          {error && <p className="mt-1 text-xs font-medium text-destructive" role="alert">{error}</p>}
        </div>
        <input aria-label="Subject" className={inputCls} placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <input aria-label="Date" type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        <select aria-label="Priority" className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
        <button className={btnCls}><Plus className="h-4 w-4" />Add</button>
      </form>
      <div className="mb-3 flex gap-2">
        {(["All", "Pending", "Done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-sm font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{f}</button>
        ))}
      </div>
      {shown.length === 0 ? <Empty text="No tasks here yet. Add your first study task above." /> : (
        <ul className="space-y-2">
          {shown.map((t) => (
            <li key={t.id} className={`${cardCls} flex items-center gap-3 p-4`}>
              <button aria-label={t.done ? "Mark incomplete" : "Mark complete"} onClick={() => setTasks((p) => p.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}>
                {t.done ? <CheckCircle2 className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
              </button>
              <div className="flex-1">
                <p className={`font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.subject} · {t.date}{t.done ? " · Done" : ""}</p>
              </div>
              <PriorityBadge p={t.priority} />
              <button aria-label="Delete task" onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
