import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecipeWithGemini } from '@/lib/ai/gemini'

type ProfileRow = {
  daily_calorie_goal: number | null
  protein_goal_g: number | null
  carbs_goal_g: number | null
  fat_goal_g: number | null
  water_goal_l: number | null
  diet_type: string | null
}

function buildDietContext(profile: ProfileRow | null): string | undefined {
  if (!profile) return undefined
  const parts: string[] = []
  if (profile.daily_calorie_goal) parts.push(`günlük kalori ${profile.daily_calorie_goal} kcal`)
  if (profile.protein_goal_g) parts.push(`protein ${profile.protein_goal_g}g`)
  if (profile.carbs_goal_g) parts.push(`karbonhidrat ${profile.carbs_goal_g}g`)
  if (profile.fat_goal_g) parts.push(`yağ ${profile.fat_goal_g}g`)
  if (profile.water_goal_l) parts.push(`su ${profile.water_goal_l} litre`)
  if (profile.diet_type) parts.push(`diyet tipi: ${profile.diet_type}`)
  if (parts.length === 0) return undefined
  return `Diyet hedeflerim: ${parts.join(', ')}. Bu hedeflere uygun tarif öner.`
}

export async function POST(request: NextRequest) {
  // 1. Parse body
  let ingredients: string[]
  try {
    const body = await request.json() as { ingredients?: unknown }
    if (
      !Array.isArray(body.ingredients) ||
      body.ingredients.length === 0 ||
      body.ingredients.some((i) => typeof i !== 'string')
    ) {
      return NextResponse.json(
        { error: 'ingredients alanı dolu bir string dizisi olmalı.' },
        { status: 400 }
      )
    }
    ingredients = body.ingredients as string[]
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  // 2. Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  // TODO: Rate limiting — günlük 3 tarif (ücretsiz) kontrolü

  // 3. Fetch diet profile for context (non-fatal if unavailable)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, water_goal_l, diet_type')
    .eq('id', user.id)
    .single()

  const dietContext = buildDietContext(profileData as ProfileRow | null)

  // 4. Generate recipe with Gemini
  try {
    const result = await generateRecipeWithGemini(ingredients, dietContext)
    return NextResponse.json({ recipe: result.text, macros: result.macros })
  } catch (err) {
    console.error('[/api/recipes] Tarif üretme hatası:', err)
    return NextResponse.json(
      { error: 'Tarif üretilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
