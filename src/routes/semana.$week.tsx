import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Wand2,
  Check,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { useStore, type WeeklySummary } from "@/lib/mock-store";
import { dateKey, parseWeekKey } from "@/lib/date-utils";

export const Route = createFileRoute("/semana/$week")({
  head: () => ({
    meta: [
      { title: "Semana — MyStoryAI" },
      {
        name: "description",
        content: "Planifica tu semana y consulta tu resumen semanal generado por IA.",
      },
      { property: "og:title", content: "Semana — MyStoryAI" },
      {
        property: "og:description",
        content: "Planifica tu semana y consulta tu resumen semanal generado por IA.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <WeekPage />
    </AppLayout>
  ),
});

const THINKING_STEPS = [
  "Analizando tus hábitos…",
  "Buscando patrones en tu journal…",
  "Conectando aprendizajes de la semana…",
  "Construyendo tu historia…",
];

const NARRATIVES = [
  "Esta semana te vi apareciendo por ti. Cumpliste con la mayoría de tus hábitos y, cuando escribiste, volvías al mismo tema: querer más calma. Eso no es casualidad, es una pista.",
  "Fue una semana de sostenerte, incluso los días que no querías. Tu diario habla de cansancio pero también de pequeñas decisiones que sí tomaste. Eso cuenta más de lo que parece.",
  "Se nota un cambio: estás priorizando lo que te da energía en vez de lo urgente. Tus registros lo dicen entre líneas — y tus hábitos empiezan a acompañar esa idea.",
];

const LEARNINGS = [
  "Cuando duermes bien, todo lo demás se vuelve más fácil. Es tu palanca.",
  "No necesitas hacerlo perfecto, necesitas volver. Cada re-inicio también cuenta.",
  "Lo que llamas 'flojera' muchas veces es falta de descanso real. Escúchalo antes de forzarlo.",
];

function pick<T>(a: T[]) {
  return a[Math.floor(Math.random() * a.length)];
}

function WeekPage() {
  const { week } = useParams({ from: "/semana/$week" });
  const {
    habits,
    entries,
    weeklyPlans,
    weeklySummaries,
    setWeeklyPlan,
    setWeeklySummaryFor,
  } = useStore();

  const { start, end } = useMemo(() => parseWeekKey(week), [week]);
  const now = new Date();
  const isFinished = now.getTime() > new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime();
  const isCurrent = !isFinished && now.getTime() >= start.getTime();

  const days = useMemo(() => {
    const arr: { d: Date; key: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push({ d, key: dateKey(d) });
    }
    return arr;
  }, [start]);

  const [plan, setPlan] = useState(weeklyPlans[week] ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const summary = weeklySummaries[week];

  useEffect(() => {
    setPlan(weeklyPlans[week] ?? "");
  }, [week, weeklyPlans]);

  useEffect(() => {
    if (!loading) return;
    const int = setInterval(
      () => setStepIndex((i) => (i + 1) % THINKING_STEPS.length),
      700,
    );
    return () => clearInterval(int);
  }, [loading]);

  const handleSavePlan = () => {
    setWeeklyPlan(week, plan);
    setSavedFlash(true);
    toast.success("Plan de la semana guardado");
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const generateSummary = async () => {
    setLoading(true);
    setStepIndex(0);
    await new Promise((r) => setTimeout(r, 2200));

    const weekEntries = days
      .map(({ key }) => entries[key])
      .filter(Boolean);
    const totalPossible = Math.max(habits.length * 7, 1);
    const done = weekEntries.reduce((acc, e) => acc + e.habitsCompleted.length, 0);
    const baseline = Math.round((done / totalPossible) * 100);
    const rate = Math.min(
      100,
      Math.max(baseline, 55 + Math.floor(Math.random() * 30)),
    );

    const s: WeeklySummary = {
      id: `w_${Date.now()}`,
      weekStart: dateKey(start),
      weekEnd: dateKey(end),
      narrative: pick(NARRATIVES),
      keyLearning: pick(LEARNINGS),
      habitsCompletionRate: rate,
    };
    setWeeklySummaryFor(week, s);
    setLoading(false);
  };

  const fmt = (d: Date) =>
    d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });

  return (
    <div className="space-y-6">
      <Link
        to="/calendario"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Volver al calendario
      </Link>

      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {week.replace("-W", " · Semana ")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          <span className="text-gradient">
            {fmt(start)} – {fmt(end)}
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {isFinished
            ? "Semana finalizada. Genera tu resumen IA y revisa tu plan."
            : isCurrent
              ? "Semana en curso. Planifica tus intenciones."
              : "Semana futura. Escribe cómo quieres que se vea."}
        </p>
      </header>

      {/* Mini week strip */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map(({ d, key }) => {
            const entry = entries[key];
            const isToday = dateKey(now) === key;
            return (
              <Link
                key={key}
                to="/dia/$date"
                params={{ date: key }}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                  isToday
                    ? "border-primary/60 bg-primary/10"
                    : entry
                      ? "border-accent/40 bg-accent/5 hover:border-accent/60"
                      : "border-border/60 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {d.toLocaleDateString("es-PE", { weekday: "short" })}
                </span>
                <span className="font-display text-base font-semibold">{d.getDate()}</span>
                {entry ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                ) : (
                  <span className="h-1.5 w-1.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan */}
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">Planificación de la semana</h2>
            {weeklyPlans[week] && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                <Check size={12} /> Guardado
              </span>
            )}
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Escribe libremente cómo quieres vivir esta semana: intenciones, prioridades, temas a
            cuidar, lo que sea.
          </p>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Esta semana quiero…"
            rows={10}
            maxLength={4000}
            className="w-full resize-y rounded-xl border border-border bg-white/[0.03] p-3 text-sm outline-none focus:border-ring focus:shadow-[0_0_0_3px_oklch(0.68_0.22_305_/_25%)]"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{plan.length}/4000</span>
            <button
              onClick={handleSavePlan}
              disabled={!plan.trim()}
              className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
            >
              {savedFlash ? <Check size={16} /> : <Save size={16} />}
              {savedFlash ? "Guardado" : "Guardar plan"}
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h2 className="font-display text-xl font-semibold">Resumen IA de la semana</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full gradient-primary animate-pulse-glow">
                <Loader2 className="animate-spin text-white" size={26} />
              </div>
              <p className="font-display text-sm">{THINKING_STEPS[stepIndex]}</p>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground/90">{summary.narrative}</p>
              <div className="rounded-xl border border-border/60 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Aprendizaje clave
                </p>
                <p className="mt-1.5 font-display text-base font-medium">
                  {summary.keyLearning}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-white/[0.03] p-4">
                <span className="text-xs text-muted-foreground">Hábitos cumplidos</span>
                <span className="font-display text-2xl font-bold text-gradient">
                  {summary.habitsCompletionRate}%
                </span>
              </div>
              <button
                onClick={generateSummary}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                <RefreshCw size={12} /> Volver a generar
              </button>
            </div>
          ) : isFinished ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-cta shadow-glow">
                <Wand2 className="text-white" size={22} />
              </div>
              <p className="text-sm text-muted-foreground">
                Semana finalizada. Genera tu narrativa IA.
              </p>
              <button
                onClick={generateSummary}
                className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                <Sparkles size={14} /> Generar resumen
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Tu resumen IA aparecerá aquí cuando la semana haya culminado.
              </p>
              {isCurrent && (
                <p className="mt-2 text-xs text-muted-foreground/70">
                  Mientras tanto, sigue registrando tu día a día.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
