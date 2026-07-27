import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, Plus, X, Loader2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { useStore, type Habit } from "@/lib/mock-store";

export const Route = createFileRoute("/habitos")({
  head: () => ({
    meta: [
      { title: "Hábitos — MyStoryAI" },
      {
        name: "description",
        content: "Crea, edita y elimina los hábitos que quieres cultivar.",
      },
      { property: "og:title", content: "Hábitos — MyStoryAI" },
      {
        property: "og:description",
        content: "Crea, edita y elimina los hábitos que quieres cultivar.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <HabitsPage />
    </AppLayout>
  ),
});

function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit } = useStore();
  const [editing, setEditing] = useState<Habit | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Habit | null>(null);

  return (
    <div className="space-y-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Tus <span className="text-gradient">hábitos</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Estas son las cosas que quieres cultivar. Aparecen en tu check-in diario.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-primary inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nuevo hábito</span>
        </button>
      </header>

      {habits.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
            <ListChecks className="text-white" size={26} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Aún no tienes hábitos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Empieza con uno pequeño. Puedes editarlo o agregar más cuando quieras.
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="btn-primary rounded-full px-5 py-2 text-sm font-semibold"
          >
            Crear mi primer hábito
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {habits.map((h) => (
            <li
              key={h.id}
              className="glass-card flex items-center gap-3 p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary text-white">
                <ListChecks size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{h.name}</p>
                <p className="text-xs text-muted-foreground">
                  Creado {new Date(h.createdAt).toLocaleDateString("es-PE")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditing(h)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  aria-label={`Editar ${h.name}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmDelete(h)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  aria-label={`Eliminar ${h.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <HabitFormModal
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={async (name) => {
            const res = editing
              ? updateHabit(editing.id, name)
              : addHabit(name);
            if (!res.ok) return res.error ?? "Error";
            toast.success(editing ? "Hábito actualizado" : "Hábito creado");
            return null;
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="¿Eliminar este hábito?"
          description={`"${confirmDelete.name}" dejará de aparecer en tu check-in diario.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteHabit(confirmDelete.id);
            toast.success("Hábito eliminado");
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}

function HabitFormModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: Habit;
  onSubmit: (name: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const err = await onSubmit(name);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-xl font-semibold">
            {initial ? "Editar hábito" : "Nuevo hábito"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nombre del hábito
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              maxLength={50}
              className="w-full rounded-xl border border-border bg-white/[0.05] px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:shadow-[0_0_0_3px_oklch(0.68_0.22_305_/_25%)]"
              placeholder="Ej. Correr 20 minutos"
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="font-medium text-destructive">{error ?? ""}</span>
              <span className="text-muted-foreground">{name.length}/50</span>
            </div>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
            >
              {saving && <Loader2 className="animate-spin" size={14} />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-sm p-6 text-center">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
