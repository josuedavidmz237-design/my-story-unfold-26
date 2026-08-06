import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, notAuthenticated, supabaseForUser, toolError } from "../supabase";

export default defineTool({
  name: "list_habits",
  title: "Listar hábitos",
  description: "Lista los hábitos del usuario autenticado.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input: Record<string, never>, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("habits")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });
    if (error) return toolError(error.message);
    return jsonResult({ habits: data ?? [] });
  },
});

export const createHabit = defineTool({
  name: "create_habit",
  title: "Crear hábito",
  description: "Crea un hábito nuevo para el usuario autenticado.",
  inputSchema: { name: z.string().trim().describe("Nombre del hábito.") },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    if (!name.trim()) return toolError("El nombre del hábito no puede estar vacío.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("habits")
      .insert({ name: name.trim(), user_id: ctx.getUserId() as string })
      .select("id, name, created_at");
    if (error) return toolError(error.message);
    return jsonResult({ habit: data?.[0] });
  },
});
