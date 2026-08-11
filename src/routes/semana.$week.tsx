import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader as Loader2, Sparkles, Wand as Wand2, Check, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { dateKey, parseWeekKey } from "@/lib/date-utils";
import { supabase } from "@/integrations/supabase/client";

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

function WeekPage() {
  const { week } = useParams({ from: "/semana/$week" });
  const { start, end } = useMemo(() => parseWeekKey(week), [week]);
  const now = new Date();
  const isFinished =
    now.getTime() >
    new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      23,
      59,
      59,
    ).getTime();
  const isCurrent = !isFinished && now.getTime() >= start.getTime();

  const [plan, setPlan] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const yearNum = Number(week.split("-W")[0]);
  const weekNum = Number(week.split("-W")[1]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("weekly_plans")
          .select("plan_text, ai_summary")
          .eq("year", yearNum)
          .eq("week_number", weekNum)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        setPlan(data?.plan_text ?? "");
        setAiSummary(data?.ai_summary ?? null);
      } catch (err) {
        if (!cancelled) {
          toast.error("No se pudo cargar el plan de la semana.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [week, yearNum, weekNum]);

  useEffect(() => {
    if (!generating) return;
    const int = setInterval(
      () => setStepIndex((i) => (i + 1) % THINKING_STEPS.length),
      700,
    );
    return () => clearInterval(int);
  }, [generating]);

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("weekly_plans")
        .select("id")
        .eq("year", yearNum)
        .eq("week_number", weekNum)
        .maybeSingle();

      let error;
      if (existing) {
        ({ error } = await supabase
          .from("weekly_plans")
          .update({ plan_text: plan })
          .eq("year", yearNum)
          .eq("week_number", weekNum));
      } else {
        ({ error } = await supabase.from("weekly_plans").insert({
          year: yearNum,
          week_number: weekNum,
          plan_text: plan,
        }));
      }

      if (error) throw error;
      setSavedFlash(true);
      toast.success("Plan de la semana guardado");
      setTimeout(() => setSavedFlash(false), 1600);
    } catch (err) {
      toast.error("No se pudo guardar el plan.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const generateSummary = async () => {
    setGenerating(true);
    setStepIndex(0);
    await new Promise((r) => setTimeout(r, 2200));
    const generated = "Tu resumen IA aparecerá aquí una vez se integre el servicio de IA.";
    setAiSummary(generated);
    try {
      const { data: existing } = await supabase
        .from("weekly_plans")
        .select("id")
        .eq("year", yearNum)
        .eq("week_number", weekNum)
        .maybeSingle();

      let error;
      if (existing) {
        ({ error } = await supabase
          .from("weekly_plans")
          .update({ ai_summary: generated })
          .eq("year", yearNum)
          .eq("week_number", weekNum));
      } else {
        ({ error } = await supabase.from("weekly_plans").insert({
          year: yearNum,
          week_number: weekNum,
          plan_text: "",
          ai_summary: generated,
        }));
      }
      if (error) throw error;
      toast.success("Resumen IA generado y guardado");
    } catch (err) {
      toast.error("No se pudo guardar el resumen IA.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const fmt = (d: Date) =>
    d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });

  return (
    <div className="space-y-6">
      <Link
        to="/calendario"
        search={{}}
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

      {loading ? (
        <div className="glass-card flex items-center justify-center gap-3 p-12 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Cargando semana…</span>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Plan */}
          <section className="glass-card p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">Planificación de la semana</h2>
              {plan && (
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
                disabled={!plan.trim() || saving}
                className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : savedFlash ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}
                {savedFlash ? "Guardado" : saving ? "Guardando…" : "Guardar plan"}
              </button>
            </div>
          </section>

          {/* Summary */}
          <section className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h2 className="font-display text-xl font-semibold">Resumen IA de la semana</h2>
            </div>

            {generating ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full gradient-primary animate-pulse-glow">
                  <Loader2 className="animate-spin text-white" size={26} />
                </div>
                <p className="font-display text-sm">{THINKING_STEPS[stepIndex]}</p>
              </div>
            ) : aiSummary ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-foreground/90">{aiSummary}</p>
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
      )}
    </div>
  );
}
