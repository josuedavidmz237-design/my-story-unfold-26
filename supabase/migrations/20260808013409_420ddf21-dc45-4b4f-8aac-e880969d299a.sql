ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS categoria text,
  ADD COLUMN IF NOT EXISTS meta_diaria integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS nota text,
  ADD COLUMN IF NOT EXISTS fecha date NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE public.habits
  ADD CONSTRAINT habits_meta_diaria_positive CHECK (meta_diaria > 0);