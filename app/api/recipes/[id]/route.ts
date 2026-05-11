import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/types/recipe'

// GET /api/recipes/[id] — public endpoint, returns recipe if is_public = true
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Tarif bulunamadı.' }, { status: 404 })
    }
    console.error('[GET /api/recipes/[id]]', error)
    return NextResponse.json({ error: 'Tarif getirilemedi.' }, { status: 500 })
  }

  const recipe = data as Recipe

  if (!recipe.is_public) {
    return NextResponse.json({ error: 'Tarif bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json({ recipe })
}
