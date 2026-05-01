'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function RecipeGenerator() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const ingredients = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (ingredients.length === 0) return

    setLoading(true)
    setRecipe(null)
    setError(null)

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })

      const data = await res.json() as { recipe?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Bir hata oluştu.')
      } else {
        setRecipe(data.recipe ?? null)
      }
    } catch {
      setError('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Tarif Üret</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Malzemeleri virgülle ayır: tavuk, soğan, sarımsak…"
          disabled={loading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || input.trim() === ''}
          className="w-full sm:self-start sm:w-auto rounded-xl px-6 py-3 sm:py-2.5 text-sm font-semibold text-white transition hover:opacity-85 active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: '#ffa51f' }}
        >
          {loading ? 'Tarif üretiliyor…' : 'Tarif Üret →'}
        </button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-4 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}

        {recipe && (
          <motion.div
            key="recipe"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span className="text-sm font-semibold text-gray-700">
                Tarifiniz hazır
              </span>
            </div>
            {/* Render newlines from Claude's response */}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {recipe}
            </p>
            <button
              onClick={() => { setRecipe(null); setInput('') }}
              className="mt-5 text-xs text-gray-400 underline hover:text-gray-600"
            >
              Yeni tarif üret
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
