export interface RecipeMacros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface Recipe {
  id: string
  user_id: string
  name: string
  ingredients: string[]
  instructions: string
  macros?: RecipeMacros
  diet_context?: string
  is_public: boolean
  created_at: string
}
