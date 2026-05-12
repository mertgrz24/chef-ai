import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSingleMeal } from '@/lib/ai/gemini'
import type { MealPlanDay } from '@/types/meal-plan'

const VALID_DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const

type ValidDay = (typeof VALID_DAYS)[number]
type ValidMeal = 'breakfast' | 'dinner'

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

function getWeekStartDate(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

export async function PATCH(request: NextRequest) {
  // 1. Validate body
  let day: ValidDay
  let meal: ValidMeal

  try {
    const body = (await request.json()) as { day?: unknown; meal?: unknown }
    if (typeof body.day !== 'string' || !(VALID_DAYS as readonly string[]).includes(body.day)) {
      return NextResponse.json(
        { error: `Geçersiz gün. Beklenen: ${VALID_DAYS.join(' | ')}` },
        { status: 400 }
      )
    }
    if (body.meal !== 'breakfast' && body.meal !== 'dinner') {
      return NextResponse.json(
        { error: 'meal alanı "breakfast" veya "dinner" olmalı.' },
        { status: 400 }
      )
    }
    day = body.day as ValidDay
    meal = body.meal
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  // 3. Fetch current week's plan
  const week_start_date = getWeekStartDate()
  const { data: currentPlan, error: fetchError } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', week_start_date)
    .single()

  if (fetchError || !currentPlan) {
    return NextResponse.json({ error: 'Bu hafta için plan bulunamadı.' }, { status: 404 })
  }

  // 4. Fetch diet context (non-fatal)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, water_goal_l, diet_type')
    .eq('id', user.id)
    .single()

  const dietContext = buildDietContext(profileData as ProfileRow | null)

  // 5. Regenerate the single meal
  try {
    const newMeal = await generateSingleMeal(day, meal, dietContext)

    const updatedMeals = (currentPlan.meals as MealPlanDay[]).map((d) => {
      if (d.day !== day) return d
      return { ...d, [meal]: newMeal }
    })

    // 6. Persist update
    const { data: updatedPlan, error: updateError } = await supabase
      .from('meal_plans')
      .update({ meals: updatedMeals, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('week_start_date', week_start_date)
      .select()
      .single()

    if (updateError || !updatedPlan) {
      console.error('[/api/meal-plan/regenerate-day] Güncelleme hatası:', updateError)
      return NextResponse.json({ error: 'Plan güncellenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ plan: updatedPlan })
  } catch (err) {
    console.error('[/api/meal-plan/regenerate-day] Öğün üretme hatası:', err)
    return NextResponse.json(
      { error: 'Öğün üretilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
