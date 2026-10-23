import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, cardCls } from "@/components/AppShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CampusMate — The problem we solve" },
      { name: "description", content: "Why CampusMate exists: students' tasks, deadlines and notes are scattered across too many places." },
      { property: "og:title", content: "About CampusMate" },
      { property: "og:description", content: "One clear daily plan for students." },
    ],
  }),
  component: About,
});

function About() {
  const blocks = [
    { h: "The problem", p: "Students track classes in a timetable, assignments in chat groups, notes in files and revision in notebooks. It's easy to miss a deadline or forget what to study next." },
    { h: "Our solution", p: "CampusMate brings a daily study plan, assignment deadlines, revision notes and a class timetable into one simple dashboard." },
    { h: "How your data is stored", p: "Planner, notes and timetable are saved in this browser on this device, so clearing browser data will remove them. Shared assignments and accounts (student and teacher login) are stored securely online." },
    { h: "Privacy", p: "Use fictional or non-sensitive data. CampusMate doesn't collect personal information and doesn't guarantee grades or academic outcomes." },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="About CampusMate" subtitle="Learn · Plan · Grow" />
      <div className="grid gap-4 sm:grid-cols-2">
        {blocks.map((b) => (
          <section key={b.h} className={cardCls}>
            <h2 className="font-display text-lg font-bold">{b.h}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{b.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
