import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import {
  MONTH_NAMES_ES,
  WEEKDAY_SHORT_ES,
  dateKey,
  isoWeek,
  monthMatrix,
  parseDateKey,
  weekKey,
} from "@/lib/date-utils";
import { supabase } from "@/integrations/supabase/client";

const QUARTER_BY_WEEK: Record<number, number> = { 13: 1, 26: 2, 39: 3, 52: 4 };

type DailyEntryRow = { entry_date: string; reflection: string; mood: number | null };
type WeeklyPlanRow = {
  year: number;
  week_number: number;
  plan_text: string;
  ai_summary: string | null;
};

export const Route = createFileRoute("/calendario")({
  validateSearch: (search) => ({
    mes: typeof search.mes === "string" ? search.mes : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Calendario — MyStoryAI" },
      {
        name: "description",
        content:
          "Vista de calendario para revisar tus registros diarios y planificar tus semanas.",
      },
      { property: "og:title", content: "Calendario — MyStoryAI" },
      {
        property: "og:description",
        content: "Explora tus registros diarios por mes y planifica cada semana.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <CalendarPage />
    </AppLayout>
  ),
});

function CalendarPage() {
  const { mes } = Route.useSearch();
  const today = new Date();
  const [cursor, setCursor] = useState(() => {
    if (mes && /^\d{4}-\d{2}$/.test(mes)) {
      const d = parseDateKey(`${mes}-01`);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const weeks = useMemo(
    () => monthMatrix(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const prev = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const next = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () =>
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const todayISO = dateKey(today);

  const [entries, setEntries] = useState<Record<string, DailyEntryRow>>({});
  const [weeklyPlans, setWeeklyPlans] = useState<
    Record<string, { plan_text: string; ai_summary: string | null }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
        const startDate = dateKey(monthStart);
        const endDate = dateKey(monthEnd);

        const [entriesRes, plansRes] = await Promise.all([
          supabase
            .from("daily_entries")
            .select("entry_date, reflection, mood")
            .gte("entry_date", startDate)
            .lte("entry_date", endDate),
          supabase.from("weekly_plans").select(
            "year, week_number, plan_text, ai_summary",
          ),
        ]);

        if (cancelled) return;

        if (entriesRes.error) throw entriesRes.error;
        if (plansRes.error) throw plansRes.error;

        const entriesMap: Record<string, DailyEntryRow> = {};
        for (const e of entriesRes.data ?? []) {
          entriesMap[e.entry_date] = e;
        }
        setEntries(entriesMap);

        const plansMap: Record<
          string,
          { plan_text: string; ai_summary: string | null }
        > = {};
        for (const p of (plansRes.data ?? []) as WeeklyPlanRow[]) {
          const wk = `${p.year}-W${p.week_number.toString().padStart(2, "0")}`;
          plansMap[wk] = { plan_text: p.plan_text, ai_summary: p.ai_summary };
        }
        setWeeklyPlans(plansMap);
      } catch (err) {
        if (!cancelled) {
          toast.error("No se pudieron cargar los datos del calendario.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cursor]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Vista mensual
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            <span className="text-gradient">
              {MONTH_NAMES_ES[cursor.getMonth()]} {cursor.getFullYear()}
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Toca un día para ver tu registro. Toca el número de la semana para planificarla y ver
            tu resumen IA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="rounded-full border border-border p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToday}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            Hoy
          </button>
          <button
            onClick={next}
            className="rounded-full border border-border p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="glass-card flex items-center justify-center gap-3 p-12 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Cargando calendario…</span>
        </div>
      ) : (
        <div className="glass-card overflow-hidden p-4 sm:p-6">
          {/* Header row: empty for week col + weekday names */}
          <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] gap-1 pb-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Sem
            </div>
            {WEEKDAY_SHORT_ES.map((d) => (
              <div
                key={d}
                className="px-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {weeks.map((row) => {
              const wk = weekKey(row[0]);
              const { week, year: isoYear } = isoWeek(row[0]);
              const plan = weeklyPlans[wk];
              const hasPlan = !!plan && !!plan.plan_text;
              const hasSummary = !!plan && !!plan.ai_summary;
              const quarterNum = QUARTER_BY_WEEK[week];
              const weekEnded =
                today.getTime() >
                new Date(
                  row[6].getFullYear(),
                  row[6].getMonth(),
                  row[6].getDate(),
                  23,
                  59,
                  59,
                ).getTime();
              const showQuarterBadge = !!quarterNum && weekEnded;
              return (
                <div
                  key={wk}
                  className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] gap-1"
                >
                  <div className="relative">
                    <Link
                      to="/semana/$week"
                      params={{ week: wk }}
                      className="group relative flex h-full flex-col items-center justify-center rounded-xl border border-border/60 bg-white/[0.02] py-2 text-center transition hover:border-primary/60 hover:bg-primary/10"
                      aria-label={`Semana ${week}`}
                    >
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary">
                        S
                      </span>
                      <span className="font-display text-base font-semibold text-foreground/90 group-hover:text-primary">
                        {week}
                      </span>
                      <span className="mt-0.5 flex gap-0.5">
                        {hasPlan && (
                          <span
                            className="h-1 w-1 rounded-full bg-primary"
                            aria-label="Plan"
                          />
                        )}
                        {hasSummary && (
                          <span
                            className="h-1 w-1 rounded-full bg-accent"
                            aria-label="Resumen"
                          />
                        )}
                      </span>
                    </Link>

                    {showQuarterBadge && (
                      <Link
                        to="/trimestre/$quarter"
                        params={{ quarter: `${isoYear}-T${quarterNum}` }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Trimestre ${quarterNum} de ${isoYear}`}
                        className="absolute -right-1 -top-1 z-10 rounded-md border border-accent/60 bg-accent/15 px-1 py-px text-[9px] font-bold leading-tight text-accent transition hover:bg-accent/30"
                      >
                        T{quarterNum}
                      </Link>
                    )}
                  </div>


                  {row.map((d) => {
                    const key = dateKey(d);
                    const inMonth = d.getMonth() === cursor.getMonth();
                    const isToday = key === todayISO;
                    const entry = entries[key];
                    const hasEntry = !!entry;
                    const isFuture =
                      d.getTime() > today.getTime() && !isToday;
                    return (
                      <Link
                        key={key}
                        to="/dia/$date"
                        params={{ date: key }}
                        className={`group relative flex aspect-square min-h-[3rem] flex-col rounded-xl border p-1.5 text-left transition sm:min-h-[4rem] sm:p-2 ${
                          isToday
                            ? "border-primary/70 bg-primary/10 shadow-glow"
                            : hasEntry
                              ? "border-accent/40 bg-accent/5 hover:border-accent/70"
                              : "border-border/60 bg-white/[0.02] hover:border-border hover:bg-white/[0.05]"
                        } ${!inMonth ? "opacity-40" : ""}`}
                      >
                        <span
                          className={`font-display text-sm font-semibold ${
                            isToday ? "text-primary" : "text-foreground/90"
                          }`}
                        >
                          {d.getDate()}
                        </span>
                        {hasEntry && (
                          <div className="mt-auto flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {entry.mood != null && (
                              <span className="text-[10px] font-semibold text-accent">
                                {entry.mood}
                              </span>
                            )}
                          </div>
                        )}
                        {!hasEntry && isFuture && (
                          <span className="mt-auto text-[9px] text-muted-foreground/50">—</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Hoy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Día con registro
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} /> Toca la semana para planificarla
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
