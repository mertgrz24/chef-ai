export type DietType =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'paleo'
  | 'gluten_free'
  | 'dairy_free'
  | (string & {});

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  updated_at: string | null;

  // Diet goals — all nullable (user may not have set them yet)
  daily_calorie_goal: number | null;
  protein_goal_g: number | null;
  carbs_goal_g: number | null;
  fat_goal_g: number | null;
  water_goal_l: number | null;
  daily_steps_goal: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  diet_type: DietType | null;
  goals_updated_at: string | null;
}

export type ProfileUpdatePayload = Partial<Pick<Profile,
  | 'full_name'
  | 'daily_calorie_goal'
  | 'protein_goal_g'
  | 'carbs_goal_g'
  | 'fat_goal_g'
  | 'water_goal_l'
  | 'daily_steps_goal'
  | 'current_weight_kg'
  | 'target_weight_kg'
  | 'diet_type'
>>
