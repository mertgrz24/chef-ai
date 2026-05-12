import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getWeekStartDate(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  const week_start_date = getWeekStartDate()

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', week_start_date)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Bu hafta için plan bulunamadı.' }, { status: 404 })
  }

  return NextResponse.json({ plan: data })
}
