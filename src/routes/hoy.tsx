import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Sparkles, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { guidedQuestionForToday, todayKey, useStore } from "@/lib/mock-store";
import { useHabits } from "@/lib/use-habits";

export const Route = createFileRoute("/hoy")({
  head: () => ({
    meta: [
      { title: "Hoy — MyStoryAI" },
      {
        name: "description",
        content: "Marca tus hábitos del día y escribe una entrada corta en tu diario.",
      },
      { property: "og:title", content: "Hoy — MyStoryAI" },
      {
        property: "og:description",
        content: "Marca tus hábitos del día y escribe una entrada corta en tu diario.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <TodayPage />
    </AppLayout>
  ),
});

function TodayPage() {
  const { entries, saveTodayEntry } = useStore();
  const { habits, loading: habitsLoading } = useHabits();
  const key = todayKey();
  const existing = entries[key];
  const question = useMemo(() => guidedQuestionForToday(), []);

  const [completed, setCompleted] = useState<string[]>(existing?.habitsCompleted ?? []);
  const [journalText, setJournalText] = useState(existing?.journalText ?? "");
  const [guidedAnswer, setGuidedAnswer] = useState(existing?.guidedAnswer ?? "");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setCompleted(existing?.habitsCompleted ?? []);
    setJournalText(existing?.journalText ?? "");
    setGuidedAnswer(existing?.guidedAnswer ?? "");
  }, [existing?.id]);

  const toggle = (id: string) =>
    setCompleted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canSave = completed.length > 0 || journalText.trim() || guidedAnswer.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    saveTodayEntry({
      habitsCompleted: completed,
      journalText: journalText.trim(),
      guidedAnswer: guidedAnswer.trim(),
    });
    setSaving(false);
    setJustSaved(true);
    toast.success("¡Registro guardado! 🎉");
    setTimeout(() => setJustSaved(false), 2000);
  };

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {today}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
          Tu <span className="text-gradient">check-in</span> de hoy
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Marca los hábitos que cumpliste y escribe algo de lo que viviste hoy. Todo lo que
          registres alimenta tu resumen semanal.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Habits */}
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Hábitos de hoy</h2>
            <span className="text-xs text-muted-foreground">
              {completed.length}/{habits.length}
            </span>
          </div>

          {habitsLoading ? (
            <div className="grid place-items-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={20} />
            </div>
          ) : habits.length === 0 ? (
            <EmptyHabits />
          ) : (
            <ul className="space-y-2">
              {habits.map((h) => {
                const done = completed.includes(h.id);
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => toggle(h.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl border border-border/70 bg-white/[0.03] px-4 py-3 text-left transition ${
                        done ? "today-glow" : "hover:bg-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${
                          done
                            ? "border-transparent gradient-warm text-accent-foreground"
                            : "border-border bg-background/40 text-transparent"
                        }`}
                        aria-hidden
                      >
                        <Check size={16} strokeWidth={3} />
                      </span>
                      <span
                        className={`flex-1 min-w-0 text-sm font-medium ${
                          done ? "text-foreground" : "text-foreground/90"
                        }`}
                      >
                        {h.name}
                      </span>
                      {done && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                          hecho
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4">
            <Link
              to="/habitos"
              className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary-glow"
            >
              <PlusCircle size={14} /> Gestionar hábitos
            </Link>
          </div>
        </section>

        {/* Journal */}
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h2 className="font-display text-xl font-semibold">Tu diario</h2>
          </div>

          <div className="rounded-xl border border-border/60 bg-white/[0.03] p-4">
            <p className="font-display text-base font-medium leading-snug text-foreground">
              {question}
            </p>
            <textarea
              value={guidedAnswer}
              onChange={(e) => setGuidedAnswer(e.target.value)}
              placeholder="Responde en una o dos líneas…"
              className="mt-3 w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              rows={2}
            />
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notas libres del día
            </span>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="¿Qué pasó hoy? ¿Qué sentiste? Sin filtro."
              className="w-full resize-y rounded-xl border border-border bg-white/[0.03] p-3 text-sm outline-none focus:border-ring focus:shadow-[0_0_0_3px_oklch(0.68_0.22_305_/_25%)]"
              rows={6}
              maxLength={2000}
            />
            <span className="mt-1 block text-right text-[11px] text-muted-foreground">
              {journalText.length}/2000
            </span>
          </label>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {existing
            ? "Ya guardaste tu registro de hoy. Puedes actualizarlo cuando quieras."
            : "Debes marcar al menos un hábito o escribir algo para guardar."}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Guardando…
            </>
          ) : justSaved ? (
            <>
              <Check size={16} /> Guardado
            </>
          ) : existing ? (
            "Actualizar registro de hoy"
          ) : (
            "Guardar registro de hoy"
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyHabits() {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">Aún no tienes hábitos configurados.</p>
      <Link
        to="/habitos"
        className="btn-primary mt-4 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
      >
        <PlusCircle size={16} /> Crea tu primer hábito
      </Link>
    </div>
  );
}
