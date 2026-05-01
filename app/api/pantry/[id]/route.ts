import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/pantry/[id] — remove a pantry item (RLS enforces ownership)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'id parametresi gerekli.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('pantry')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // redundant with RLS but explicit is safer

  if (error) {
    console.error('[DELETE /api/pantry/[id]]', error)
    return NextResponse.json({ error: 'Malzeme silinemedi.' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
