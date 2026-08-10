import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader as Loader2, Sparkles, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/trimestre/$quarter")({
  head: () => ({
    meta: [
      { title: "Trimestre — MyStoryAI" },
      {
        name: "description",
        content:
          "Revisa tu resumen trimestral generado por IA y planifica libremente tu siguiente trimestre.",
      },
      { property: "og:title", content: "Trimestre — MyStoryAI" },
      {
        property: "og:description",
        content:
          "Resumen trimestral por IA y espacio libre para planificar tu próximo trimestre.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <QuarterPage />
    </AppLayout>
  ),
});

const QUARTER_RANGE_ES: Record<number, string> = {
  1: "Enero – Marzo",
  2: "Abril – Junio",
  3: "Julio – Septiembre",
  4: "Octubre – Diciembre",
};

function QuarterPage() {
  const { quarter } = useParams({ from: "/trimestre/$quarter" });
  const yearNum = Number(quarter.split("-T")[0]);
  const quarterNum = Number(quarter.split("-T")[1]);

  const [plan, setPlan] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("quarterly_recaps")
          .select("plan_text, ai_summary")
          .eq("year", yearNum)
          .eq("quarter_number", quarterNum)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        setPlan(data?.plan_text ?? "");
        setAiSummary(data?.ai_summary ?? null);
      } catch (err) {
        if (!cancelled) {
          toast.error("No se pudo cargar el trimestre.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [yearNum, quarterNum]);

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const { data: existing, error: selectError } = await supabase
        .from("quarterly_recaps")
        .select("id")
        .eq("year", yearNum)
        .eq("quarter_number", quarterNum)
        .maybeSingle();
      if (selectError) throw selectError;

      let error;
      if (existing) {
        ({ error } = await supabase
          .from("quarterly_recaps")
          .update({ plan_text: plan })
          .eq("year", yearNum)
          .eq("quarter_number", quarterNum));
      } else {
        ({ error } = await supabase.from("quarterly_recaps").insert({
          year: yearNum,
          quarter_number: quarterNum,
          plan_text: plan,
        }));
      }
      if (error) throw error;

      setSavedFlash(true);
      toast.success("Planificación trimestral guardada");
      setTimeout(() => setSavedFlash(false), 1600);
    } catch (err) {
      toast.error("No se pudo guardar la planificación.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
          Trimestre {quarterNum} · {yearNum}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          <span className="text-gradient">
            {QUARTER_RANGE_ES[quarterNum] ?? "Trimestre"}
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Mira cómo se vio tu trimestre y escribe cómo quieres vivir el siguiente.
        </p>
      </header>

      {loading ? (
        <div className="glass-card flex items-center justify-center gap-3 p-12 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Cargando trimestre…</span>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h2 className="font-display text-xl font-semibold">
                Resumen IA del trimestre
              </h2>
            </div>
            {aiSummary ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {aiSummary}
              </p>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Tu resumen trimestral estará disponible pronto.
                </p>
              </div>
            )}
          </section>

          <section className="glass-card p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">
                Planificación del siguiente trimestre
              </h2>
              {plan && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                  <Check size={12} /> Guardado
                </span>
              )}
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Escribe libremente: prioridades, hábitos a sostener, lo que quieres dejar
              atrás.
            </p>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="El próximo trimestre quiero…"
              rows={12}
              maxLength={6000}
              className="w-full resize-y rounded-xl border border-border bg-white/[0.03] p-3 text-sm outline-none focus:border-ring focus:shadow-[0_0_0_3px_oklch(0.68_0.22_305_/_25%)]"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {plan.length}/6000
              </span>
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
        </div>
      )}
    </div>
  );
}
