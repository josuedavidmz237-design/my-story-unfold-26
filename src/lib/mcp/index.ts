import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listHabits, { createHabit } from "./tools/habits";
import getDayEntry, { logHabit, saveDayEntry } from "./tools/entries";
import getGoal, { setGoal } from "./tools/goals";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "my-story-ai-progress-journal",
  title: "My Story AI: Progress Journal",
  version: "0.1.0",
  instructions:
    "Herramientas de MyStoryAI: hábitos, registros diarios (journaling), y la identidad deseada del usuario. Usa list_habits para obtener los IDs antes de log_habit.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listHabits, createHabit, getDayEntry, saveDayEntry, logHabit, getGoal, setGoal],
});
