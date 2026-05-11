-- profiles tablosu (V2.1) — Supabase SQL Editor'da manuel çalıştırıldı, 4 Mayıs 2026
-- Bu dosya referans amaçlıdır, tekrar çalıştırma.
CREATE TABLE public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT,
  full_name            TEXT,
  daily_calorie_goal   INT,
  protein_goal_g       INT,
  carbs_goal_g         INT,
  fat_goal_g           INT,
  water_goal_l         NUMERIC(3,1),
  daily_steps_goal     INT,
  current_weight_kg    NUMERIC(5,2),
  target_weight_kg     NUMERIC(5,2),
  diet_type            TEXT,
  goals_updated_at     TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
