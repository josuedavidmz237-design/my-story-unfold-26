import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Loader2, Wand2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useStore, type WeeklySummary } from "@/lib/mock-store";
import { useHabits } from "@/lib/use-habits";

export const Route = createFileRoute("/resumen")({
  head: () => ({
    meta: [
      { title: "Resumen semanal — MyStoryAI" },
      {
        name: "description",
        content: "Recibe una narrativa generada por IA sobre tu semana de hábitos y journaling.",
      },
      { property: "og:title", content: "Resumen semanal — MyStoryAI" },
      {
        property: "og:description",
        content: "Recibe una narrativa generada por IA sobre tu semana de hábitos y journaling.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <SummaryPage />
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

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function SummaryPage() {
  const { entries, weeklySummary, setWeeklySummary } = useStore();
  const { habits } = useHabits();
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const int = setInterval(
      () => setStepIndex((i) => (i + 1) % THINKING_STEPS.length),
      700,
    );
    return () => clearInterval(int);
  }, [loading]);

  const generate = async () => {
    setLoading(true);
    setStepIndex(0);
    await new Promise((r) => setTimeout(r, 2400));

    // Compute a mock rate based on last 7 entries
    const totalPossible = Math.max(habits.length * 7, 1);
    const done = Object.values(entries)
      .slice(-7)
      .reduce((acc, e) => acc + e.habitsCompleted.length, 0);
    const baseline = Math.round((done / totalPossible) * 100);
    // Nudge to something visible/motivating on demo
    const rate = Math.min(
      100,
      Math.max(baseline, 55 + Math.floor(Math.random() * 30)),
    );

    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    const start = startDate.toISOString().slice(0, 10);

    const summary: WeeklySummary = {
      id: `w_${Date.now()}`,
      weekStart: start,
      weekEnd: end,
      narrative: pick(NARRATIVES),
      keyLearning: pick(LEARNINGS),
      habitsCompletionRate: rate,
    };

    setWeeklySummary(summary);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Semana en curso
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          Tu <span className="text-gradient">resumen semanal</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Una narrativa breve, generada a partir de tus hábitos y journaling de los últimos 7 días.
        </p>
      </header>

      {loading ? (
        <ThinkingState label={THINKING_STEPS[stepIndex]} />
      ) : weeklySummary ? (
        <SummaryCard summary={weeklySummary} onRegenerate={generate} />
      ) : (
        <EmptyState onGenerate={generate} />
      )}
    </div>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-10 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-cta shadow-glow">
        <Wand2 className="text-white" size={28} />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold">
          Aún no generas tu resumen de esta semana
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Cuando estés listo, la IA analizará tu semana y te contará qué patrones ve.
        </p>
      </div>
      <button
        onClick={onGenerate}
        className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-glow"
      >
        <Sparkles size={16} /> Generar resumen semanal
      </button>
    </div>
  );
}

function ThinkingState({ label }: { label: string }) {
  return (
    <div className="glass-card flex flex-col items-center gap-5 p-12 text-center">
      <div className="relative grid h-20 w-20 place-items-center rounded-full gradient-primary animate-pulse-glow">
        <Loader2 className="animate-spin text-white" size={30} />
      </div>
      <p className="font-display text-lg text-foreground">{label}</p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary/70"
            style={{ animation: `pulse-glow 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  summary,
  onRegenerate,
}: {
  summary: WeeklySummary;
  onRegenerate: () => void;
}) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });

  return (
    <div className="space-y-4">
      <article className="glass-card overflow-hidden">
        <div className="border-b border-border/60 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {formatDate(summary.weekStart)} – {formatDate(summary.weekEnd)}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Tu semana en resumen
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/90">
            {summary.narrative}
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Aprendizaje clave
            </p>
            <p className="mt-2 font-display text-lg font-medium leading-snug">
              {summary.keyLearning}
            </p>
          </div>
          <CompletionRing rate={summary.habitsCompletionRate} />
        </div>
      </article>

      <div className="flex justify-end">
        <button
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <RefreshCw size={14} /> Volver a generar
        </button>
      </div>
    </div>
  );
}

function CompletionRing({ rate }: { rate: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (rate / 100) * c;

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.68 0.22 305)" />
              <stop offset="100%" stopColor="oklch(0.83 0.17 85)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 900ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-2xl font-bold">{rate}%</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              hábitos
            </p>
          </div>
        </div>
      </div>
      <div className="hidden sm:block text-xs text-muted-foreground max-w-[10rem]">
        Porcentaje de hábitos cumplidos esta semana.
      </div>
    </div>
  );
}
