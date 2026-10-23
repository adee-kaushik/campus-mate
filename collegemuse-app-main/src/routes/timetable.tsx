import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useLocal, seeds, uid, validateTitle, type ClassSlot } from "@/lib/store";
import { PageHeader, cardCls, inputCls, btnCls } from "@/components/AppShell";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "Class Timetable — CampusMate" },
      { name: "description", content: "View and manage your weekly class timetable." },
      { property: "og:title", content: "Class Timetable — CampusMate" },
      { property: "og:description", content: "Your week of classes at a glance." },
    ],
  }),
  component: Timetable,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Timetable() {
  const [slots, setSlots] = useLocal<ClassSlot[]>("timetable", seeds.timetable);
  const [f, setF] = useState({ day: "Mon", time: "09:00", subject: "", room: "" });
  const [error, setError] = useState<string | null>(null);
  const todayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateTitle(f.subject);
    setError(err ? "Please enter a subject." : null);
    if (err) return;
    setSlots((p) => [...p, { id: uid(), ...f, subject: f.subject.trim() }]);
    setF({ ...f, subject: "", room: "" });
  };

  return (
    <div>
      <PageHeader title="Class Timetable" subtitle="Demo timetable — edit it to match your week." />
      <form onSubmit={add} className={`${cardCls} mb-6 grid gap-3 md:grid-cols-[1fr_1fr_2fr_1fr_auto]`}>
        <select aria-label="Day" className={inputCls} value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
        <input aria-label="Time" type="time" className={inputCls} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
        <div>
          <input aria-label="Subject" className={inputCls} placeholder="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
          {error && <p className="mt-1 text-xs font-medium text-destructive" role="alert">{error}</p>}
        </div>
        <input aria-label="Room" className={inputCls} placeholder="Room" value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} />
        <button className={btnCls}><Plus className="h-4 w-4" />Add</button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DAYS.map((d) => {
          const list = slots.filter((s) => s.day === d).sort((a, b) => a.time.localeCompare(b.time));
          return (
            <section key={d} className={`${cardCls} ${d === todayKey ? "ring-2 ring-primary" : ""}`}>
              <h2 className="mb-3 flex items-center justify-between font-display text-lg font-bold">{d}{d === todayKey && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Today</span>}</h2>
              {list.length === 0 ? <p className="text-sm text-muted-foreground">No classes.</p> : (
                <ul className="space-y-2">
                  {list.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-xl bg-muted p-2.5">
                      <span className="font-mono text-xs font-semibold text-primary">{s.time}</span>
                      <div className="flex-1"><p className="text-sm font-medium">{s.subject}</p>{s.room && <p className="text-xs text-muted-foreground">{s.room}</p>}</div>
                      <button aria-label={`Remove ${s.subject}`} onClick={() => setSlots((p) => p.filter((x) => x.id !== s.id))} className="rounded p-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
