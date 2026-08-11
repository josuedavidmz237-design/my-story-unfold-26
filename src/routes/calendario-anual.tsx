import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { MONTH_NAMES_ES } from "@/lib/date-utils";

const QUARTERS = [
  { num: 1, label: "T1", months: [0, 1, 2] },
  { num: 2, label: "T2", months: [3, 4, 5] },
  { num: 3, label: "T3", months: [6, 7, 8] },
  { num: 4, label: "T4", months: [9, 10, 11] },
];

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export const Route = createFileRoute("/calendario-anual")({
  head: () => ({
    meta: [
      { title: "Calendario Anual — MyStoryAI" },
      {
        name: "description",
        content:
          "Vista anual de tu año con acceso rápido a cada mes, trimestre y resumen anual.",
      },
      { property: "og:title", content: "Calendario Anual — MyStoryAI" },
      {
        property: "og:description",
        content:
          "Explora tu año mes a mes y consulta tus resúmenes trimestrales y anual.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <AnnualCalendarPage />
    </AppLayout>
  ),
});

function AnnualCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());

  const prev = () => setYear((y) => y - 1);
  const next = () => setYear((y) => y + 1);
  const goCurrent = () => setYear(today.getFullYear());

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Vista anual
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            <span className="text-gradient">Calendario Anual</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Explora tu año: toca un mes para ver su vista mensual, un trimestre para su resumen, o
            el resumen anual al final.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="rounded-full border border-border p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            aria-label="Año anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goCurrent}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            Actual
          </button>
          <button
            onClick={next}
            className="rounded-full border border-border p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            aria-label="Año siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="glass-card overflow-hidden p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-center gap-4 border-b border-border/40 pb-4">
          <button
            onClick={prev}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            aria-label="Año anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{year}</h2>
          <button
            onClick={next}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            aria-label="Año siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {QUARTERS.map((q) => (
            <div
              key={q.num}
              className="grid grid-cols-[2.5rem_1fr] items-stretch gap-3 sm:grid-cols-[3rem_1fr]"
            >
              <Link
                to="/trimestre/$quarter"
                params={{ quarter: `${year}-T${q.num}` }}
                className="flex items-center justify-center rounded-xl border border-accent/60 bg-accent/15 text-accent transition hover:bg-accent/30"
                aria-label={`Trimestre ${q.num} de ${year}`}
              >
                <span className="font-display text-lg font-bold sm:text-xl">{q.label}</span>
              </Link>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {q.months.map((m) => (
                  <Link
                    key={m}
                    to="/calendario"
                    search={{ mes: monthKey(year, m) }}
                    className="group flex flex-col items-center justify-center rounded-xl border border-border/60 bg-white/[0.02] p-3 text-center transition hover:border-primary/60 hover:bg-primary/10 sm:p-4"
                  >
                    <CalendarDays
                      size={16}
                      className="mb-1 text-muted-foreground group-hover:text-primary"
                    />
                    <span className="text-xs font-medium text-foreground/90 group-hover:text-primary sm:text-sm">
                      {MONTH_NAMES_ES[m]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border/40 pt-6">
          <Link
            to="/resumen-anual/$year"
            params={{ year: `${year}` }}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold sm:text-base"
          >
            <Sparkles size={18} />
            Resumen anual
          </Link>
        </div>
      </div>
    </div>
  );
}
