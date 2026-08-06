import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { jsonResult, notAuthenticated, supabaseForUser, toolError } from "../supabase";

export default defineTool({
  name: "get_goal",
  title: "Ver identidad deseada",
  description: "Devuelve la identidad/meta deseada del usuario autenticado.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input: Record<string, never>, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_goals")
      .select("id, desired_identity, created_at")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) return toolError(error.message);
    return jsonResult({ goal: data?.[0] ?? null });
  },
});

export const setGoal = defineTool({
  name: "set_goal",
  title: "Definir identidad deseada",
  description: "Crea o actualiza la identidad/meta deseada del usuario autenticado.",
  inputSchema: {
    desired_identity: z
      .string()
      .trim()
      .describe("En quién quiere convertirse el usuario."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ desired_identity }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const identity = desired_identity.trim();
    if (!identity) return toolError("La identidad deseada no puede estar vacía.");
    const supabase = supabaseForUser(ctx);
    const existing = await supabase
      .from("user_goals")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);
    if (existing.error) return toolError(existing.error.message);

    const current = existing.data?.[0];
    const { data, error } = current
      ? await supabase
          .from("user_goals")
          .update({ desired_identity: identity })
          .eq("id", current.id)
          .select("id, desired_identity, created_at")
      : await supabase
          .from("user_goals")
          .insert({ desired_identity: identity, user_id: ctx.getUserId() as string })
          .select("id, desired_identity, created_at");
    if (error) return toolError(error.message);
    return jsonResult({ goal: data?.[0] });
  },
});
