/*
# Create weekly_plans table

1. New Tables
- `weekly_plans`
  - `id` (uuid, primary key, autogenerado con gen_random_uuid())
  - `user_id` (uuid, referencia a auth.users.id, NOT NULL, por defecto auth.uid())
  - `year` (integer, año, ej. 2026)
  - `week_number` (integer, número de semana ISO 1-53)
  - `plan_text` (text, texto libre donde el usuario planifica su semana)
  - `ai_summary` (text, resumen generado por IA, opcional al inicio)
  - `created_at` (timestamptz, automático con now())

2. Constraints
- Restricción UNIQUE en (user_id, year, week_number): una sola fila por usuario + año + semana.
- CHECK en week_number entre 1 y 53.
- CHECK en year positivo.

3. Security
- RLS habilitado en `weekly_plans`.
- 4 políticas (select/insert/update/delete) con scope `TO authenticated` y ownership check `auth.uid() = user_id`.
- `user_id` tiene DEFAULT auth.uid() para que los inserts del frontend que omitan user_id funcionen.
*/

CREATE TABLE IF NOT EXISTS weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  week_number integer NOT NULL,
  plan_text text NOT NULL DEFAULT '',
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT weekly_plans_unique UNIQUE (user_id, year, week_number),
  CONSTRAINT weekly_plans_week_number_check CHECK (week_number >= 1 AND week_number <= 53),
  CONSTRAINT weekly_plans_year_check CHECK (year > 0)
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_weekly_plans" ON weekly_plans;
CREATE POLICY "select_own_weekly_plans" ON weekly_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_weekly_plans" ON weekly_plans;
CREATE POLICY "insert_own_weekly_plans" ON weekly_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_weekly_plans" ON weekly_plans;
CREATE POLICY "update_own_weekly_plans" ON weekly_plans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_weekly_plans" ON weekly_plans;
CREATE POLICY "delete_own_weekly_plans" ON weekly_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
