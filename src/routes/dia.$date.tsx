import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, CalendarDays } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/mock-store";
import { parseDateKey, dateKey, weekKey } from "@/lib/date-utils";

export const Route = createFileRoute("/dia/$date")({
  head: () => ({
    meta: [
      { title: "Registro del día — MyStoryAI" },
      { name: "description", content: "Consulta tu registro diario de hábitos y journaling." },
      { property: "og:title", content: "Registro del día — MyStoryAI" },
      {
        property: "og:description",
        content: "Consulta tu registro diario de hábitos y journaling.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <DayDetailPage />
    </AppLayout>
  ),
});

function DayDetailPage() {
  const { date } = useParams({ from: "/dia/$date" });
  const { entries, habits } = useStore();
  const entry = entries[date];
  const d = parseDateKey(date);
  const isToday = dateKey(new Date()) === date;
  const wk = weekKey(d);

  const dateLabel = d.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/calendario"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Volver al calendario
        </Link>
        <Link
          to="/semana/$week"
          params={{ week: wk }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <CalendarDays size={14} /> Ver semana
        </Link>
      </div>

      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {isToday ? "Hoy" : "Registro del día"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold capitalize sm:text-4xl">
          <span className="text-gradient">{dateLabel}</span>
        </h1>
      </header>

      {!entry ? (
        <div className="glass-card flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border/60 bg-white/[0.03]">
            <CalendarDays className="text-muted-foreground" size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Sin registro este día</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              No guardaste hábitos ni notas para esta fecha.
              {isToday && " Puedes hacerlo ahora desde 'Hoy'."}
            </p>
          </div>
          {isToday && (
            <Link
              to="/hoy"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Ir a mi check-in
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">Hábitos</h2>
            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay hábitos configurados.</p>
            ) : (
              <ul className="space-y-2">
                {habits.map((h) => {
                  const done = entry.habitsCompleted.includes(h.id);
                  return (
                    <li
                      key={h.id}
                      className={`flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3 ${
                        done ? "bg-white/[0.05]" : "bg-white/[0.02] opacity-70"
                      }`}
                    >
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                          done
                            ? "gradient-warm text-accent-foreground"
                            : "border border-border bg-background/40 text-transparent"
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className="text-sm font-medium">{h.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              {entry.habitsCompleted.length}/{habits.length} completados
            </p>
          </section>

          <section className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h2 className="font-display text-xl font-semibold">Diario</h2>
            </div>

            {entry.guidedAnswer && (
              <div className="rounded-xl border border-border/60 bg-white/[0.03] p-4">
                <p className="font-display text-sm font-medium text-foreground">
                  {entry.guidedQuestion}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                  {entry.guidedAnswer}
                </p>
              </div>
            )}

            {entry.journalText ? (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notas libres
                </p>
                <p className="whitespace-pre-wrap rounded-xl border border-border bg-white/[0.03] p-3 text-sm">
                  {entry.journalText}
                </p>
              </div>
            ) : (
              !entry.guidedAnswer && (
                <p className="text-sm text-muted-foreground">
                  No escribiste en el diario este día.
                </p>
              )
            )}
          </section>
        </div>
      )}
    </div>
  );
}
