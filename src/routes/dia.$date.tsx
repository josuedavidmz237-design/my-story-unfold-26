import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Loader as Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { parseDateKey, dateKey, weekKey } from "@/lib/date-utils";
import { supabase } from "@/integrations/supabase/client";

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

type DailyEntryRow = {
  id: string;
  entry_date: string;
  reflection: string;
  mood: number | null;
};

function DayDetailPage() {
  const { date } = useParams({ from: "/dia/$date" });
  const d = parseDateKey(date);
  const isToday = dateKey(new Date()) === date;
  const wk = weekKey(d);

  const [entry, setEntry] = useState<DailyEntryRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("daily_entries")
          .select("id, entry_date, reflection, mood")
          .eq("entry_date", date)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        setEntry(data as DailyEntryRow | null);
      } catch (err) {
        if (!cancelled) {
          toast.error("No se pudo cargar el registro de este día.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

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
          search={{}}
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

      {loading ? (
        <div className="glass-card flex items-center justify-center gap-3 p-12 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm">Cargando registro…</span>
        </div>
      ) : !entry ? (
        <div className="glass-card flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border/60 bg-white/[0.03]">
            <CalendarDays className="text-muted-foreground" size={22} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Sin registro este día</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              No guardaste una reflexión ni un estado de ánimo para esta fecha.
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
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h2 className="font-display text-xl font-semibold">Reflexión</h2>
            </div>
            {entry.reflection ? (
              <p className="whitespace-pre-wrap rounded-xl border border-border bg-white/[0.03] p-4 text-sm leading-relaxed text-foreground/90">
                {entry.reflection}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No escribiste una reflexión este día.
              </p>
            )}
          </section>

          <section className="glass-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">Estado de ánimo</h2>
            {entry.mood != null ? (
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl font-bold text-gradient">
                  {entry.mood}
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-border/60">
                    <div
                      className="h-2 rounded-full gradient-primary"
                      style={{ width: `${(entry.mood / 10) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Escala del 1 al 10
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No registraste tu estado de ánimo este día.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
