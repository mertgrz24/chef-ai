'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoutButton } from './logout-button'

const links = [
  { href: '/dashboard', label: 'Ana Sayfa', icon: '🏠' },
  { href: '/pantry',    label: 'Kilerim',   icon: '🥦' },
  { href: '/recipes',   label: 'Tariflerim', icon: '📋' },
  { href: '/profile',   label: 'Profil',    icon: '👤' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 md:hidden bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14">
        <Link
          href="/dashboard"
          className="text-xl font-bold"
          style={{ color: '#ffa51f' }}
          onClick={() => setOpen(false)}
        >
          ChefAI
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menüyü aç/kapat"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 transition hover:bg-gray-100 active:bg-gray-200 text-xl"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-gray-100 bg-white px-4 py-3 gap-1">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-amber-50 hover:text-amber-600"
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
          <div className="mt-2 pt-3 border-t border-gray-100">
            <LogoutButton />
          </div>
        </nav>
      )}
    </header>
  )
}
