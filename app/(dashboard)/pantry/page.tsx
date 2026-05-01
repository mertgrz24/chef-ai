import { createClient } from '@/lib/supabase/server'
import { PantryClient, type PantryItem } from '@/components/pantry/pantry-client'

export default async function PantryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('pantry')
    .select('id, name, expiry_date, quantity, created_at')
    .eq('user_id', user!.id)
    .order('expiry_date', { ascending: true })

  const items: PantryItem[] = data ?? []

  return <PantryClient initialItems={items} />
}
