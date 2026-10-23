import { useCallback, useEffect, useState } from "react";

export type Priority = "Low" | "Medium" | "High";
export type Task = { id: string; title: string; subject: string; date: string; priority: Priority; done: boolean };
export type Assignment = { id: string; title: string; subject: string; due: string; priority: Priority; status: "Not started" | "In progress" | "Submitted" };
export type Note = { id: string; title: string; subject: string; body: string; updated: number };
export type ClassSlot = { id: string; day: string; time: string; subject: string; room: string };

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
export const uid = () => Math.random().toString(36).slice(2, 10);
export const todayISO = today;

export const seeds = {
  tasks: (): Task[] => [
    { id: "t1", title: "Revise Physics chapter 3", subject: "Physics", date: today(), priority: "High", done: false },
    { id: "t2", title: "Solve 10 calculus problems", subject: "Mathematics", date: today(), priority: "Medium", done: true },
    { id: "t3", title: "Read C programming loops", subject: "Programming", date: today(), priority: "Low", done: false },
  ],
  assignments: (): Assignment[] => [
    { id: "a1", title: "Chemistry lab report", subject: "Chemistry", due: inDays(2), priority: "High", status: "In progress" },
    { id: "a2", title: "English essay draft", subject: "English", due: inDays(5), priority: "Medium", status: "Not started" },
  ],
  notes: (): Note[] => [
    { id: "n1", title: "Newton's laws", subject: "Physics", body: "1st: inertia. 2nd: F = ma. 3rd: every action has an equal and opposite reaction.", updated: 0 },
    { id: "n2", title: "Pointers in C", subject: "Programming", body: "A pointer stores a memory address. Use & to get address, * to dereference.", updated: 0 },
  ],
  timetable: (): ClassSlot[] => [
    { id: "c1", day: "Mon", time: "09:00", subject: "Mathematics", room: "A-101" },
    { id: "c2", day: "Mon", time: "11:00", subject: "Physics", room: "Lab 2" },
    { id: "c3", day: "Tue", time: "10:00", subject: "Programming", room: "CS-3" },
    { id: "c4", day: "Wed", time: "09:00", subject: "Chemistry", room: "Lab 1" },
    { id: "c5", day: "Thu", time: "14:00", subject: "English", room: "B-204" },
    { id: "c6", day: "Fri", time: "10:00", subject: "Mathematics", room: "A-101" },
  ],
};

export function useLocal<T>(key: string, seed: () => T) {
  const [value, setValue] = useState<T>(seed);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("campusmate:" + key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  const set = useCallback(
    (next: T | ((p: T) => T)) =>
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try { localStorage.setItem("campusmate:" + key, JSON.stringify(v)); } catch {}
        return v;
      }),
    [key],
  );
  return [value, set, ready] as const;
}

export function validateTitle(title: string): string | null {
  const t = title.trim();
  if (!t) return "Please enter a title.";
  if (t.length > 120) return "Keep the title under 120 characters.";
  return null;
}
