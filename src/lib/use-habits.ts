import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Habit = {
  id: string;
  name: string;
  categoria: string | null;
  meta_diaria: number;
  nota: string | null;
  fecha: string;
  created_at: string;
};

export type HabitInput = {
  name: string;
  categoria: string | null;
  meta_diaria: number;
  nota: string | null;
  fecha?: string;
};

function msg(e: unknown) {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado";
}

/** Única capa de acceso a datos para hábitos (Supabase, tabla `habits`). */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("habits")
      .select("id, name, categoria, meta_diaria, nota, fecha, created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { ok: false as const, error: error.message };
    }
    setError(null);
    setHabits((data ?? []) as Habit[]);
    return { ok: true as const };
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createHabit = useCallback(
    async (input: HabitInput) => {
      try {
        const { error } = await supabase.from("habits").insert({
          name: input.name,
          categoria: input.categoria,
          meta_diaria: input.meta_diaria,
          nota: input.nota,
          fecha: input.fecha ?? new Date().toISOString().slice(0, 10),
        });
        if (error) return { ok: false as const, error: error.message };
        await refetch();
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, error: msg(e) };
      }
    },
    [refetch],
  );

  const updateHabit = useCallback(
    async (id: string, input: HabitInput) => {
      try {
        const { error } = await supabase
          .from("habits")
          .update({
            name: input.name,
            categoria: input.categoria,
            meta_diaria: input.meta_diaria,
            nota: input.nota,
          })
          .eq("id", id);
        if (error) return { ok: false as const, error: error.message };
        await refetch();
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, error: msg(e) };
      }
    },
    [refetch],
  );

  const deleteHabit = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) return { ok: false as const, error: error.message };
      setHabits((prev) => prev.filter((h) => h.id !== id));
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: msg(e) };
    }
  }, []);

  return { habits, loading, error, refetch, createHabit, updateHabit, deleteHabit };
}
