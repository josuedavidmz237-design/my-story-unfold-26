import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type User = { id: string; name: string; email: string };
export type Habit = { id: string; name: string; icon?: string; createdAt: string };
export type DailyEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  habitsCompleted: string[];
  journalText: string;
  guidedQuestion: string;
  guidedAnswer: string;
};
export type WeeklySummary = {
  id: string;
  weekStart: string;
  weekEnd: string;
  narrative: string;
  keyLearning: string;
  habitsCompletionRate: number;
};

const GUIDED_QUESTIONS = [
  "Si olvidas todo de hoy, ¿qué no quieres olvidar?",
  "¿Qué te dio energía hoy?",
  "¿Qué evitaste que en realidad necesitabas hacer?",
  "¿Con quién te sentiste mejor hoy y por qué?",
  "¿Qué pequeña victoria tuviste hoy?",
  "¿Qué te dijo tu cuerpo hoy?",
  "¿Qué aprendiste sobre ti hoy?",
];

export function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function guidedQuestionForToday() {
  const day = new Date().getDate();
  return GUIDED_QUESTIONS[day % GUIDED_QUESTIONS.length];
}

const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Leer 20 minutos", icon: "BookOpen", createdAt: new Date().toISOString() },
  { id: "h2", name: "Meditar", icon: "Sparkles", createdAt: new Date().toISOString() },
  { id: "h3", name: "Caminar 30 min", icon: "Footprints", createdAt: new Date().toISOString() },
  { id: "h4", name: "Escribir en el diario", icon: "PenLine", createdAt: new Date().toISOString() },
];

type Store = {
  user: User | null;
  habits: Habit[];
  entries: Record<string, DailyEntry>;
  weeklySummary: WeeklySummary | null;
  weeklyPlans: Record<string, string>;
  weeklySummaries: Record<string, WeeklySummary>;
  login: (name: string, email: string) => void;
  logout: () => void;
  addHabit: (name: string, icon?: string) => { ok: boolean; error?: string };
  updateHabit: (id: string, name: string, icon?: string) => { ok: boolean; error?: string };
  deleteHabit: (id: string) => void;
  saveTodayEntry: (data: { habitsCompleted: string[]; journalText: string; guidedAnswer: string }) => void;
  setWeeklySummary: (s: WeeklySummary) => void;
  setWeeklyPlan: (weekKey: string, text: string) => void;
  setWeeklySummaryFor: (weekKey: string, s: WeeklySummary) => void;
};


const Ctx = createContext<Store | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [weeklySummary, setSummary] = useState<WeeklySummary | null>(null);

  // Restore from sessionStorage on client
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mystoryai:store");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.user) setUser(s.user);
        if (s.habits) setHabits(s.habits);
        if (s.entries) setEntries(s.entries);
        if (s.weeklySummary) setSummary(s.weeklySummary);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "mystoryai:store",
        JSON.stringify({ user, habits, entries, weeklySummary }),
      );
    } catch {}
  }, [user, habits, entries, weeklySummary]);

  const value = useMemo<Store>(
    () => ({
      user,
      habits,
      entries,
      weeklySummary,
      login: (name, email) =>
        setUser({ id: "u_mock", name: name || email.split("@")[0] || "Amig@", email }),
      logout: () => setUser(null),
      addHabit: (name, icon) => {
        const trimmed = name.trim();
        if (!trimmed) return { ok: false, error: "El nombre no puede estar vacío" };
        if (trimmed.length > 50) return { ok: false, error: "Máximo 50 caracteres" };
        if (habits.some((h) => h.name.toLowerCase() === trimmed.toLowerCase()))
          return { ok: false, error: "Ya tienes un hábito con ese nombre" };
        setHabits((prev) => [
          ...prev,
          { id: `h_${Date.now()}`, name: trimmed, icon, createdAt: new Date().toISOString() },
        ]);
        return { ok: true };
      },
      updateHabit: (id, name, icon) => {
        const trimmed = name.trim();
        if (!trimmed) return { ok: false, error: "El nombre no puede estar vacío" };
        if (trimmed.length > 50) return { ok: false, error: "Máximo 50 caracteres" };
        if (habits.some((h) => h.id !== id && h.name.toLowerCase() === trimmed.toLowerCase()))
          return { ok: false, error: "Ya tienes un hábito con ese nombre" };
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name: trimmed, icon } : h)));
        return { ok: true };
      },
      deleteHabit: (id) => {
        setHabits((prev) => prev.filter((h) => h.id !== id));
        setEntries((prev) => {
          const next = { ...prev };
          for (const k of Object.keys(next)) {
            next[k] = { ...next[k], habitsCompleted: next[k].habitsCompleted.filter((x) => x !== id) };
          }
          return next;
        });
      },
      saveTodayEntry: ({ habitsCompleted, journalText, guidedAnswer }) => {
        const date = todayKey();
        setEntries((prev) => ({
          ...prev,
          [date]: {
            id: prev[date]?.id ?? `e_${Date.now()}`,
            date,
            habitsCompleted,
            journalText,
            guidedQuestion: guidedQuestionForToday(),
            guidedAnswer,
          },
        }));
      },
      setWeeklySummary: (s) => setSummary(s),
    }),
    [user, habits, entries, weeklySummary],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within MockStoreProvider");
  return ctx;
}
