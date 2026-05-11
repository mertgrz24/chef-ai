'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { RecipeMacros } from '@/types/recipe'

type ParsedRecipe = {
  name: string
  ingredients: string[]
  instructions: string
}

// Parse the formatted text produced by gemini.ts's parseRecipeJson
function parseFormattedRecipe(text: string): ParsedRecipe | null {
  const lines = text.split('\n')

  const nameLine = lines.find((l) => l.trimStart().startsWith('🍽️'))
  if (!nameLine) return null
  const name = nameLine.replace(/🍽️\s*/, '').trim()
  if (!name) return null

  const ingredients = lines
    .filter((l) => l.trimStart().startsWith('•'))
    .map((l) => l.replace(/•\s*/, '').trim())
    .filter(Boolean)

  const hazirlikIdx = lines.findIndex((l) => l.includes('👨‍🍳'))
  const instructions =
    hazirlikIdx >= 0 ? lines.slice(hazirlikIdx + 1).join('\n').trim() : ''

  return { name, ingredients, instructions }
}

export function RecipeGenerator() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<string | null>(null)
  const [macros, setMacros] = useState<RecipeMacros | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Structured recipe data for saving
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null)
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const ingredients = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (ingredients.length === 0) return

    setLoading(true)
    setRecipe(null)
    setMacros(null)
    setError(null)
    setSavedRecipeId(null)
    setShareMessage(null)
    setSaveError(null)
    setParsedRecipe(null)

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })

      const data = await res.json() as {
        recipe?: string
        macros?: RecipeMacros | null
        error?: string
      }

      if (!res.ok) {
        setError(data.error ?? 'Bir hata oluştu.')
      } else {
        const text = data.recipe ?? null
        setRecipe(text)
        setMacros(data.macros ?? null)

        // Parse structured fields for the save endpoint
        if (text) {
          const parsed = parseFormattedRecipe(text)
          setParsedRecipe(
            parsed ?? {
              name: ingredients[0]
                ? `${ingredients[0].charAt(0).toUpperCase()}${ingredients[0].slice(1)} tarifi`
                : 'Chef-AI Tarifi',
              ingredients,
              instructions: text,
            }
          )
        }
      }
    } catch {
      setError('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!recipe || !parsedRecipe) return

    // Already saved — skip POST and go straight to share
    if (savedRecipeId) {
      await triggerShare(savedRecipeId)
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      const res = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: parsedRecipe.name,
          ingredients: parsedRecipe.ingredients,
          instructions: parsedRecipe.instructions,
          macros: macros ?? undefined,
        }),
      })

      const data = await res.json() as { recipe?: { id: string }; error?: string }

      if (!res.ok) {
        setSaveError(data.error ?? 'Kaydetme başarısız.')
      } else if (data.recipe?.id) {
        setSavedRecipeId(data.recipe.id)
        router.refresh() // re-render dashboard server component (history + count)
        await triggerShare(data.recipe.id)
      }
    } catch {
      setSaveError('Sunucuya ulaşılamadı.')
    } finally {
      setSaving(false)
    }
  }

  async function triggerShare(id: string) {
    const url = `${window.location.origin}/recipe/${id}`
    const shareData = {
      title: parsedRecipe?.name ?? 'Chef-AI Tarifi',
      text: 'Chef-AI ile ürettiğim tarife bak!',
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // User dismissed the native sheet — don't fall through to clipboard
        if (err instanceof Error && err.name === 'AbortError') return
        // Any other share error → fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('Link kopyalandı ✓')
      setTimeout(() => setShareMessage(null), 3000)
    } catch {
      setSaveError(`Panoya kopyalanamadı — link: ${url}`)
    }
  }

  function resetRecipe() {
    setRecipe(null)
    setMacros(null)
    setInput('')
    setSavedRecipeId(null)
    setShareMessage(null)
    setSaveError(null)
    setParsedRecipe(null)
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
              <span className="text-sm font-semibold text-gray-700">Tarifiniz hazır</span>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {recipe}
            </p>

            {macros && (
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-4 text-xs text-gray-500">
                <span>🔥 <span className="font-semibold text-gray-700">{macros.calories} kcal</span></span>
                <span>💪 <span className="font-semibold text-gray-700">{macros.protein_g}g</span> protein</span>
                <span>🍚 <span className="font-semibold text-gray-700">{macros.carbs_g}g</span> karb</span>
                <span>🧈 <span className="font-semibold text-gray-700">{macros.fat_g}g</span> yağ</span>
              </div>
            )}

            {/* Save & Share */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: '#ffa51f' }}
              >
                {saving
                  ? 'Kaydediliyor…'
                  : savedRecipeId
                  ? '🔗 Tekrar Paylaş'
                  : '🔗 Kaydet & Paylaş'}
              </button>

              {shareMessage && (
                <p className="mt-2 text-xs font-medium text-green-600">{shareMessage}</p>
              )}
              {saveError && (
                <p className="mt-2 text-xs text-red-500">{saveError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={resetRecipe}
              className="mt-4 text-xs text-gray-400 underline hover:text-gray-600"
            >
              Yeni tarif üret
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
