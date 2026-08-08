import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type User = { id: string; name: string; email: string };
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

type Store = {
  user: User | null;
  entries: Record<string, DailyEntry>;
  weeklySummary: WeeklySummary | null;
  weeklyPlans: Record<string, string>;
  weeklySummaries: Record<string, WeeklySummary>;
  login: (name: string, email: string) => void;
  logout: () => void;
  saveTodayEntry: (data: { habitsCompleted: string[]; journalText: string; guidedAnswer: string }) => void;
  setWeeklySummary: (s: WeeklySummary) => void;
  setWeeklyPlan: (weekKey: string, text: string) => void;
  setWeeklySummaryFor: (weekKey: string, s: WeeklySummary) => void;
};


const Ctx = createContext<Store | null>(null);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [weeklySummary, setSummary] = useState<WeeklySummary | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<Record<string, string>>({});
  const [weeklySummaries, setWeeklySummaries] = useState<Record<string, WeeklySummary>>({});

  // Restore from sessionStorage on client
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mystoryai:store");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.user) setUser(s.user);
        if (s.entries) setEntries(s.entries);
        if (s.weeklySummary) setSummary(s.weeklySummary);
        if (s.weeklyPlans) setWeeklyPlans(s.weeklyPlans);
        if (s.weeklySummaries) setWeeklySummaries(s.weeklySummaries);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "mystoryai:store",
        JSON.stringify({ user, entries, weeklySummary, weeklyPlans, weeklySummaries }),
      );
    } catch {}
  }, [user, entries, weeklySummary, weeklyPlans, weeklySummaries]);


  const value = useMemo<Store>(
    () => ({
      user,
      entries,
      weeklySummary,
      weeklyPlans,
      weeklySummaries,
      login: (name, email) =>
        setUser({ id: "u_mock", name: name || email.split("@")[0] || "Amig@", email }),
      logout: () => setUser(null),
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
      setWeeklyPlan: (wk, text) => setWeeklyPlans((prev) => ({ ...prev, [wk]: text })),
      setWeeklySummaryFor: (wk, s) =>
        setWeeklySummaries((prev) => ({ ...prev, [wk]: s })),
    }),
    [user, entries, weeklySummary, weeklyPlans, weeklySummaries],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within MockStoreProvider");
  return ctx;
}
