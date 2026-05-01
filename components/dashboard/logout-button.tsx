'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500"
    >
      Çıkış Yap
    </button>
  )
}
