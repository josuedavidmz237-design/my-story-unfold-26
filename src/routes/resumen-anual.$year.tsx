import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader as Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/resumen-anual/$year")({
  head: ({ params }) => ({
    meta: [
      { title: `Resumen Anual ${params.year} — MyStoryAI` },
      {
        name: "description",
        content: `Tu resumen anual ${params.year} generado por IA en MyStoryAI.`,
      },
      { property: "og:title", content: `Resumen Anual ${params.year} — MyStoryAI` },
      {
        property: "og:description",
        content: `Consulta el resumen anual ${params.year} generado por IA.`,
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <AnnualSummaryPage />
    </AppLayout>
  ),
});

function AnnualSummaryPage() {
  const { year: yearParam } = useParams({ from: "/resumen-anual/$year" });
  const year = Number(yearParam);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("annual_recaps")
          .select("ai_summary")
          .eq("year", year)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        setAiSummary(data?.ai_summary ?? null);
      } catch (err) {
        if (!cancelled) {
          toast.error("No se pudo cargar el resumen anual.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year]);

  return (
    <div className="space-y-6">
      <Link
        to="/calendario-anual"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Volver al calendario anual
      </Link>

      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Resumen anual · {year}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          <span className="text-gradient">{year}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Revisa el resumen generado por IA para todo el año.
        </p>
      </header>

      {loading ? (
        <div className="glass-card flex items-center justify-center gap-3 p-12 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Cargando resumen anual…</span>
        </div>
      ) : (
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h2 className="font-display text-xl font-semibold">Resumen IA del año</h2>
          </div>
          {aiSummary ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {aiSummary}
            </p>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Tu resumen anual estará disponible al finalizar el año.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
