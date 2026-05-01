import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/dashboard/logout-button'
import { MobileNav } from '@/components/dashboard/mobile-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f0' }}>
      {/* Mobile top bar — only on small screens */}
      <MobileNav />

      <div className="flex">
        {/* Sidebar — hidden on mobile, visible md+ */}
        <aside className="hidden md:flex w-60 min-h-screen flex-col border-r border-gray-200 bg-white px-4 py-6">
          <Link href="/dashboard" className="mb-8 text-2xl font-bold" style={{ color: '#ffa51f' }}>
            ChefAI
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            <NavLink href="/dashboard">Ana Sayfa</NavLink>
            <NavLink href="/pantry">Kilerim</NavLink>
            <NavLink href="/recipes">Tariflerim</NavLink>
            <NavLink href="/profile">Profil</NavLink>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <LogoutButton />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-amber-50 hover:text-amber-600"
    >
      {children}
    </Link>
  )
}
