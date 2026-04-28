'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Signup attempt:', { email, password, confirmPassword })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"
      style={{ borderColor: '#ebebeb' }}
    >
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Hesap Oluştur
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            required
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Şifre Tekrar</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#ffa51f' }}
        >
          Üye Ol
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="font-medium text-amber-500 hover:underline">
          Giriş yap →
        </Link>
      </p>
    </motion.div>
  )
}
