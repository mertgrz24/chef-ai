import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklyMealPlan } from '@/lib/ai/gemini'

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
  return `Diyet hedeflerim: ${parts.join(', ')}. Bu hedeflere uygun tarifler öner.`
}

function getWeekStartDate(): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, water_goal_l, diet_type')
    .eq('id', user.id)
    .single()

  const dietContext = buildDietContext(profileData as ProfileRow | null)

  try {
    const meals = await generateWeeklyMealPlan(dietContext)
    const week_start_date = getWeekStartDate()

    const { data, error: dbError } = await supabase
      .from('meal_plans')
      .upsert(
        {
          user_id: user.id,
          week_start_date,
          meals,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,week_start_date' }
      )
      .select()
      .single()

    if (dbError) {
      console.error('[/api/meal-plan/generate] DB hatası:', dbError)
      return NextResponse.json(
        { error: 'Plan kaydedilemedi.', detail: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ plan: data }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/meal-plan/generate] Haftalık plan üretme hatası:', message)
    return NextResponse.json(
      { error: 'Yemek planı üretilemedi. Lütfen tekrar deneyin.', detail: message },
      { status: 500 }
    )
  }
}
