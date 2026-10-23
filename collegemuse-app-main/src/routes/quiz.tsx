import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy } from "lucide-react";
import { PageHeader, cardCls, btnCls } from "@/components/AppShell";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quick Quiz — CampusMate" },
      { name: "description", content: "Practise with a short multiple-choice quiz and get instant scoring." },
      { property: "og:title", content: "Quick Quiz — CampusMate" },
      { property: "og:description", content: "Five quick questions with instant feedback." },
    ],
  }),
  component: Quiz,
});

const QUESTIONS = [
  { q: "Which law states F = ma?", options: ["Newton's 1st law", "Newton's 2nd law", "Newton's 3rd law", "Ohm's law"], a: 1, why: "Newton's second law relates force, mass and acceleration." },
  { q: "What is the derivative of x²?", options: ["x", "2x", "x²/2", "2"], a: 1, why: "Power rule: d/dx xⁿ = n·xⁿ⁻¹." },
  { q: "In C, which symbol gets a variable's address?", options: ["*", "&", "#", "%"], a: 1, why: "& is the address-of operator; * dereferences." },
  { q: "What is the chemical symbol for sodium?", options: ["So", "S", "Na", "Sd"], a: 2, why: "Na comes from the Latin 'natrium'." },
  { q: "Which data structure is FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], a: 1, why: "A queue removes items in the order they were added." },
];

function Quiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const cur = QUESTIONS[i] ?? QUESTIONS[0]!;

  const choose = (k: number) => { if (picked !== null) return; setPicked(k); if (k === cur.a) setScore((s) => s + 1); };
  const next = () => { if (i + 1 >= QUESTIONS.length) setFinished(true); else { setI(i + 1); setPicked(null); } };
  const restart = () => { setI(0); setPicked(null); setScore(0); setFinished(false); };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Quick Quiz" subtitle="Sample revision questions · instant scoring." />
      {finished ? (
        <div className={`${cardCls} text-center`}>
          <Trophy className="mx-auto h-12 w-12 text-accent" />
          <p className="mt-3 font-display text-4xl font-extrabold">{score} / {QUESTIONS.length}</p>
          <p className="mt-1 text-muted-foreground">{score === QUESTIONS.length ? "Perfect score!" : score >= 3 ? "Great job — keep revising." : "Review your notes and try again."}</p>
          <button onClick={restart} className={`${btnCls} mt-6`}>Try again</button>
        </div>
      ) : (
        <div className={cardCls}>
          <div className="mb-4 flex justify-between text-sm text-muted-foreground"><span>Question {i + 1} of {QUESTIONS.length}</span><span>Score: {score}</span></div>
          <h2 className="font-display text-xl font-bold">{cur.q}</h2>
          <div className="mt-4 grid gap-2">
            {cur.options.map((o, k) => {
              const state = picked === null ? "" : k === cur.a ? "border-success bg-success/10" : k === picked ? "border-destructive bg-destructive/10" : "opacity-60";
              return (
                <button key={o} onClick={() => choose(k)} disabled={picked !== null} className={`rounded-xl border p-3 text-left text-sm font-medium transition hover:bg-muted ${state}`}>
                  {o}{picked !== null && k === cur.a && " ✓ Correct"}{picked === k && k !== cur.a && " ✗ Your answer"}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="mt-4 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
              <strong>{picked === cur.a ? "Correct! " : "Not quite. "}</strong>{cur.why}
            </div>
          )}
          <button onClick={next} disabled={picked === null} className={`${btnCls} mt-5 w-full disabled:opacity-40`}>{i + 1 >= QUESTIONS.length ? "See results" : "Next question"}</button>
        </div>
      )}
    </div>
  );
}
