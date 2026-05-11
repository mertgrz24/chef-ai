import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/profile'

const NUMERIC_FIELD_LIST = [
  'daily_calorie_goal', 'protein_goal_g', 'carbs_goal_g', 'fat_goal_g',
  'water_goal_l', 'daily_steps_goal', 'current_weight_kg', 'target_weight_kg',
]

const NUMERIC_FIELDS = new Set<string>(NUMERIC_FIELD_LIST)
const ALLOWED_FIELDS = new Set<string>([...NUMERIC_FIELD_LIST, 'full_name', 'diet_type'])

// GET /api/profile — fetch current user's profile
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Profil bulunamadı.' }, { status: 404 })
    }
    console.error('[GET /api/profile]', error)
    return NextResponse.json({ error: 'Profil getirilemedi.' }, { status: 500 })
  }

  return NextResponse.json({ profile: data as Profile })
}

// PUT /api/profile — update current user's profile
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { updated_at: now, goals_updated_at: now }

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_FIELDS.has(key)) continue

    if (NUMERIC_FIELDS.has(key)) {
      if (value !== null && (typeof value !== 'number' || value <= 0)) {
        return NextResponse.json(
          { error: `${key} alanı null veya pozitif bir sayı olmalı.` },
          { status: 400 }
        )
      }
    } else {
      if (value !== null && typeof value !== 'string') {
        return NextResponse.json(
          { error: `${key} alanı string veya null olmalı.` },
          { status: 400 }
        )
      }
    }

    patch[key] = value
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[PUT /api/profile]', error)
    return NextResponse.json({ error: 'Profil güncellenemedi.' }, { status: 500 })
  }

  return NextResponse.json({ profile: data as Profile })
}
