import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  jsonResult,
  notAuthenticated,
  supabaseForUser,
  todayIso,
  toolError,
} from "../supabase";

const dateInput = z
  .string()
  .trim()
  .optional()
  .describe("Fecha en formato YYYY-MM-DD. Por defecto, hoy.");

export default defineTool({
  name: "get_day_entry",
  title: "Ver registro de un día",
  description:
    "Devuelve la reflexión (journaling) y los hábitos completados de una fecha.",
  inputSchema: { date: dateInput },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const day = date?.trim() || todayIso();
    const supabase = supabaseForUser(ctx);
    const [entry, logs] = await Promise.all([
      supabase
        .from("daily_entries")
        .select("id, entry_date, reflection, mood")
        .eq("entry_date", day)
        .maybeSingle(),
      supabase
        .from("habit_logs")
        .select("habit_id, completed, log_date")
        .eq("log_date", day),
    ]);
    if (entry.error) return toolError(entry.error.message);
    if (logs.error) return toolError(logs.error.message);
    return jsonResult({ date: day, entry: entry.data, habit_logs: logs.data ?? [] });
  },
});

export const saveDayEntry = defineTool({
  name: "save_day_entry",
  title: "Guardar registro del día",
  description:
    "Crea o actualiza la reflexión diaria (y opcionalmente el ánimo) de una fecha.",
  inputSchema: {
    reflection: z.string().trim().describe("Texto del journaling del día."),
    mood: z.number().int().optional().describe("Ánimo del 1 al 5."),
    date: dateInput,
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ reflection, mood, date }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    if (!reflection.trim()) return toolError("La reflexión no puede estar vacía.");
    if (mood !== undefined && (mood < 1 || mood > 5))
      return toolError("El ánimo debe estar entre 1 y 5.");
    const day = date?.trim() || todayIso();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_entries")
      .upsert(
        {
          user_id: ctx.getUserId() as string,
          entry_date: day,
          reflection: reflection.trim(),
          ...(mood !== undefined ? { mood } : {}),
        },
        { onConflict: "user_id,entry_date" },
      )
      .select("id, entry_date, reflection, mood");
    if (error) return toolError(error.message);
    return jsonResult({ entry: data?.[0] });
  },
});

export const logHabit = defineTool({
  name: "log_habit",
  title: "Marcar hábito",
  description: "Marca o desmarca un hábito como completado en una fecha.",
  inputSchema: {
    habit_id: z.string().trim().describe("ID del hábito (ver list_habits)."),
    completed: z.boolean().describe("true para completado, false para no completado."),
    date: dateInput,
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ habit_id, completed, date }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const day = date?.trim() || todayIso();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("habit_logs")
      .upsert(
        {
          user_id: ctx.getUserId() as string,
          habit_id,
          log_date: day,
          completed,
        },
        { onConflict: "habit_id,log_date" },
      )
      .select("id, habit_id, log_date, completed");
    if (error) return toolError(error.message);
    return jsonResult({ log: data?.[0] });
  },
});
