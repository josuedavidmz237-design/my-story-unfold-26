CREATE TABLE public.weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  week_number integer NOT NULL,
  plan_text text NOT NULL DEFAULT '',
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT weekly_plans_week_range CHECK (week_number BETWEEN 1 AND 53),
  CONSTRAINT weekly_plans_user_year_week_key UNIQUE (user_id, year, week_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_plans TO authenticated;
GRANT ALL ON public.weekly_plans TO service_role;

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY weekly_plans_select_own ON public.weekly_plans FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY weekly_plans_insert_own ON public.weekly_plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY weekly_plans_update_own ON public.weekly_plans FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY weekly_plans_delete_own ON public.weekly_plans FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX weekly_plans_user_year_week_idx ON public.weekly_plans (user_id, year, week_number DESC);