import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useLocal, seeds, uid, validateTitle, todayISO, type Assignment, type Priority } from "@/lib/store";
import { PageHeader, cardCls, inputCls, btnCls, PriorityBadge, Empty } from "@/components/AppShell";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "Assignment Tracker — CampusMate" },
      { name: "description", content: "Track assignment subjects, deadlines, priority and status." },
      { property: "og:title", content: "Assignment Tracker — CampusMate" },
      { property: "og:description", content: "Never miss a deadline again." },
    ],
  }),
  component: Assignments,
});

const statuses: Assignment["status"][] = ["Not started", "In progress", "Submitted"];

function Assignments() {
  const [items, setItems] = useLocal<Assignment[]>("assignments", seeds.assignments);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState(todayISO());
  const [priority, setPriority] = useState<Priority>("Medium");
  const [error, setError] = useState<string | null>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateTitle(title) ?? (!due ? "Please pick a due date." : null);
    setError(err);
    if (err) return;
    setItems((p) => [...p, { id: uid(), title: title.trim(), subject: subject.trim() || "General", due, priority, status: "Not started" }]);
    setTitle(""); setSubject("");
  };
  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - new Date(todayISO()).getTime()) / 864e5);

  return (
    <div>
      <PageHeader title="Assignment Tracker" subtitle="Subjects, deadlines, priority and status." />
      <form onSubmit={add} className={`${cardCls} mb-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]`}>
        <div>
          <input aria-label="Assignment title" className={inputCls} placeholder="e.g. Engineering Drawing Sheet" value={title} onChange={(e) => setTitle(e.target.value)} />
          {error && <p className="mt-1 text-xs font-medium text-destructive" role="alert">{error}</p>}
        </div>
        <input aria-label="Subject" className={inputCls} placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <input aria-label="Due date" type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
        <select aria-label="Priority" className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
        <button className={btnCls}><Plus className="h-4 w-4" />Add</button>
      </form>
      {items.length === 0 ? <Empty text="No assignments yet. Add one above." /> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {[...items].sort((a, b) => a.due.localeCompare(b.due)).map((a) => {
            const left = daysLeft(a.due);
            return (
              <li key={a.id} className={cardCls}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-semibold ${a.status === "Submitted" ? "text-muted-foreground line-through" : ""}`}>{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.subject} · due {a.due} · {a.status === "Submitted" ? "submitted" : left < 0 ? `${-left}d overdue` : left === 0 ? "due today" : `${left}d left`}</p>
                  </div>
                  <PriorityBadge p={a.priority} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <select aria-label="Status" className={`${inputCls} py-1.5`} value={a.status} onChange={(e) => setItems((p) => p.map((x) => x.id === a.id ? { ...x, status: e.target.value as Assignment["status"] } : x))}>
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button aria-label="Delete assignment" onClick={() => setItems((p) => p.filter((x) => x.id !== a.id))} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
