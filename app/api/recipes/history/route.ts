import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/types/recipe'

// GET /api/recipes/history — last 20 saved recipes for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[GET /api/recipes/history]', error)
    return NextResponse.json({ error: 'Tarih getirilemedi.' }, { status: 500 })
  }

  return NextResponse.json({ recipes: data as Recipe[] })
}
