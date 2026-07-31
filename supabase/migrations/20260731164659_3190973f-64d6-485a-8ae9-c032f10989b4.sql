-- 1. user_goals
CREATE TABLE public.user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  desired_identity text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_goals TO authenticated;
GRANT ALL ON public.user_goals TO service_role;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_goals_select_own" ON public.user_goals FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_goals_insert_own" ON public.user_goals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_goals_update_own" ON public.user_goals FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_goals_delete_own" ON public.user_goals FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 2. habits
CREATE TABLE public.habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_select_own" ON public.habits FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "habits_insert_own" ON public.habits FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "habits_update_own" ON public.habits FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "habits_delete_own" ON public.habits FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 3. daily_entries
CREATE TABLE public.daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  reflection text NOT NULL,
  mood integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_entries_mood_range CHECK (mood IS NULL OR (mood >= 1 AND mood <= 5)),
  CONSTRAINT daily_entries_user_date_unique UNIQUE (user_id, entry_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_entries TO authenticated;
GRANT ALL ON public.daily_entries TO service_role;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_entries_select_own" ON public.daily_entries FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "daily_entries_insert_own" ON public.daily_entries FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "daily_entries_update_own" ON public.daily_entries FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "daily_entries_delete_own" ON public.daily_entries FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 4. habit_logs
CREATE TABLE public.habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT habit_logs_habit_date_unique UNIQUE (habit_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_logs TO authenticated;
GRANT ALL ON public.habit_logs TO service_role;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs_select_own" ON public.habit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "habit_logs_insert_own" ON public.habit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "habit_logs_update_own" ON public.habit_logs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "habit_logs_delete_own" ON public.habit_logs FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 5. Índices
CREATE INDEX idx_user_goals_user_id ON public.user_goals (user_id);
CREATE INDEX idx_habits_user_id ON public.habits (user_id);
CREATE INDEX idx_daily_entries_user_date ON public.daily_entries (user_id, entry_date DESC);
CREATE INDEX idx_habit_logs_user_date ON public.habit_logs (user_id, log_date DESC);