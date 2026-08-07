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
