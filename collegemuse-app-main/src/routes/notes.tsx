import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Pencil, Search } from "lucide-react";
import { useLocal, seeds, uid, validateTitle, type Note } from "@/lib/store";
import { PageHeader, cardCls, inputCls, btnCls, Empty } from "@/components/AppShell";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes Hub — CampusMate" },
      { name: "description", content: "Create, edit, search and delete your revision notes." },
      { property: "og:title", content: "Notes Hub — CampusMate" },
      { property: "og:description", content: "All your revision notes, searchable in one place." },
    ],
  }),
  component: Notes,
});

function Notes() {
  const [notes, setNotes] = useLocal<Note[]>("notes", seeds.notes);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subject: "", body: "" });
  const [error, setError] = useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateTitle(form.title);
    setError(err);
    if (err) return;
    const data = { title: form.title.trim(), subject: form.subject.trim() || "General", body: form.body, updated: Date.now() };
    setNotes((p) => editing ? p.map((n) => n.id === editing ? { ...n, ...data } : n) : [{ id: uid(), ...data }, ...p]);
    setForm({ title: "", subject: "", body: "" }); setEditing(null);
  };
  const s = q.toLowerCase();
  const shown = notes.filter((n) => [n.title, n.subject, n.body].some((v) => v.toLowerCase().includes(s)));

  return (
    <div>
      <PageHeader title="Notes Hub" subtitle="Short revision notes you can find later." />
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <form onSubmit={save} className={`${cardCls} h-fit space-y-3`}>
          <h2 className="font-display text-lg font-bold">{editing ? "Edit note" : "New note"}</h2>
          <input aria-label="Note title" className={inputCls} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {error && <p className="text-xs font-medium text-destructive" role="alert">{error}</p>}
          <input aria-label="Subject" className={inputCls} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea aria-label="Note content" rows={6} className={inputCls} placeholder="Write your note…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div className="flex gap-2">
            <button className={btnCls}>{editing ? "Save changes" : "Save note"}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ title: "", subject: "", body: "" }); }} className="rounded-xl px-4 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>}
          </div>
        </form>
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input aria-label="Search notes" className={`${inputCls} pl-9`} placeholder="Search by title, subject or text" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {shown.length === 0 ? <Empty text={notes.length ? "No notes match your search." : "No notes yet. Write your first one."} /> : (
            <ul className="space-y-3">
              {shown.map((n) => (
                <li key={n.id} className={cardCls}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">{n.subject}</span>
                      <h3 className="mt-2 font-semibold">{n.title}</h3>
                    </div>
                    <div className="flex">
                      <button aria-label="Edit note" onClick={() => { setEditing(n.id); setForm({ title: n.title, subject: n.subject, body: n.body }); }} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                      <button aria-label="Delete note" onClick={() => setNotes((p) => p.filter((x) => x.id !== n.id))} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
