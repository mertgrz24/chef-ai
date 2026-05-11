import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/types/recipe'

// POST /api/recipes/save — persist a generated recipe for the current user
export async function POST(request: NextRequest) {
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

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return NextResponse.json({ error: 'name alanı zorunlu.' }, { status: 400 })
  }
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
  if (typeof body.instructions !== 'string' || body.instructions.trim() === '') {
    return NextResponse.json({ error: 'instructions alanı zorunlu.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      ingredients: body.ingredients as string[],
      instructions: body.instructions.trim(),
      macros: body.macros ?? null,
      diet_context: typeof body.diet_context === 'string' ? body.diet_context : null,
      is_public: true,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/recipes/save]', error)
    return NextResponse.json({ error: 'Tarif kaydedilemedi.' }, { status: 500 })
  }

  return NextResponse.json({ recipe: data as Recipe }, { status: 201 })
}
