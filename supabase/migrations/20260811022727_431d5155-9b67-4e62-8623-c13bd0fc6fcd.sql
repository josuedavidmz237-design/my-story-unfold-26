CREATE TABLE public.annual_recaps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  ai_summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, year)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.annual_recaps TO authenticated;
GRANT ALL ON public.annual_recaps TO service_role;

ALTER TABLE public.annual_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "annual_recaps_select_own" ON public.annual_recaps FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "annual_recaps_insert_own" ON public.annual_recaps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "annual_recaps_update_own" ON public.annual_recaps FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "annual_recaps_delete_own" ON public.annual_recaps FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_annual_recaps_user_year ON public.annual_recaps (user_id, year DESC);