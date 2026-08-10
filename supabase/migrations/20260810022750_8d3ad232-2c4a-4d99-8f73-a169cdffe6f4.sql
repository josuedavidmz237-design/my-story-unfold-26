CREATE TABLE IF NOT EXISTS public.quarterly_recaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  quarter_number integer NOT NULL,
  ai_summary text,
  plan_text text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quarterly_recaps_quarter_range CHECK (quarter_number BETWEEN 1 AND 4),
  CONSTRAINT quarterly_recaps_unique_period UNIQUE (user_id, year, quarter_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quarterly_recaps TO authenticated;
GRANT ALL ON public.quarterly_recaps TO service_role;

ALTER TABLE public.quarterly_recaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quarterly_recaps_select_own ON public.quarterly_recaps;
CREATE POLICY quarterly_recaps_select_own ON public.quarterly_recaps FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS quarterly_recaps_insert_own ON public.quarterly_recaps;
CREATE POLICY quarterly_recaps_insert_own ON public.quarterly_recaps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS quarterly_recaps_update_own ON public.quarterly_recaps;
CREATE POLICY quarterly_recaps_update_own ON public.quarterly_recaps FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS quarterly_recaps_delete_own ON public.quarterly_recaps;
CREATE POLICY quarterly_recaps_delete_own ON public.quarterly_recaps FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS quarterly_recaps_user_period_idx ON public.quarterly_recaps (user_id, year DESC, quarter_number DESC);