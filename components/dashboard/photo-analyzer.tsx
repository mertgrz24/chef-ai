'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'idle' | 'previewing' | 'analyzing' | 'ingredients' | 'generating' | 'recipe'

export function PhotoAnalyzer() {
  const [step, setStep] = useState<Step>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [ingredients, setIngredients] = useState<string[]>([])
  const [recipe, setRecipe] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState(0)

  const busy = step === 'analyzing' || step === 'generating'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setIngredients([])
    setRecipe(null)
    setError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
      setStep('previewing')
    }
    reader.readAsDataURL(selected)
  }

  async function handleAnalyze() {
    if (!file) return

    setStep('analyzing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/vision', { method: 'POST', body: formData })
      const data = await res.json() as { ingredients?: string[]; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Analiz başarısız.')
        setStep('previewing')
        return
      }

      setIngredients(data.ingredients ?? [])
      setStep('ingredients')
    } catch {
      setError('Sunucuya ulaşılamadı.')
      setStep('previewing')
    }
  }

  async function handleGenerateRecipe() {
    if (ingredients.length === 0) return

    setStep('generating')
    setError(null)

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })
      const data = await res.json() as { recipe?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Tarif üretilemedi.')
        setStep('ingredients')
        return
      }

      setRecipe(data.recipe ?? null)
      setStep('recipe')
    } catch {
      setError('Sunucuya ulaşılamadı.')
      setStep('ingredients')
    }
  }

  function reset() {
    setStep('idle')
    setFile(null)
    setPreview(null)
    setIngredients([])
    setRecipe(null)
    setError(null)
    setInputKey((k) => k + 1) // remount input to clear its value
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Fotoğrafla Analiz Et</h2>

      {/* Hidden file input — label triggers it natively on all browsers/mobile */}
      <input
        key={inputKey}
        id="photo-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Upload / Preview area — label click opens file picker without JS */}
      <label
        htmlFor="photo-input"
        className={[
          'block rounded-2xl border-2 border-dashed border-gray-200 bg-white p-4 md:p-8 text-center transition',
          busy ? 'cursor-default opacity-60' : 'cursor-pointer hover:border-amber-300 hover:bg-amber-50/20',
        ].join(' ')}
      >
        {preview ? (
          <img
            src={preview}
            alt="Yüklenen fotoğraf"
            className="mx-auto max-h-52 rounded-xl object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="text-5xl">📷</span>
            <p className="text-sm font-medium text-gray-500">
              Fotoğraf seç veya kameradan çek
            </p>
            <p className="text-xs text-gray-400">JPEG · PNG · WebP · Maks 10 MB</p>
          </div>
        )}
      </label>

      {/* Analyze button */}
      {step === 'previewing' && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full sm:w-auto rounded-xl px-6 py-3 sm:py-2.5 text-sm font-semibold text-white transition hover:opacity-85 active:scale-[0.98]"
            style={{ backgroundColor: '#ffa51f' }}
          >
            Malzemeleri Tanı →
          </button>
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto rounded-xl px-4 py-3 sm:py-2.5 text-sm text-gray-400 transition hover:text-gray-600"
          >
            İptal
          </button>
        </div>
      )}

      {/* Analyzing state */}
      {step === 'analyzing' && (
        <p className="mt-3 text-sm text-amber-500 font-medium animate-pulse">
          Fotoğraf analiz ediliyor…
        </p>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-3 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Ingredients result */}
      <AnimatePresence>
        {(step === 'ingredients' || step === 'generating' || step === 'recipe') && (
          <motion.div
            key="ingredients"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 md:p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🥦</span>
              <span className="text-sm font-semibold text-gray-700">
                {ingredients.length > 0
                  ? `${ingredients.length} malzeme tespit edildi`
                  : 'Malzeme tespit edilemedi'}
              </span>
            </div>

            {ingredients.length > 0 ? (
              <>
                <div className="mb-5 flex flex-wrap gap-2">
                  {ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="rounded-full px-3 py-1 text-sm"
                      style={{ backgroundColor: '#ffa51f18', color: '#b36a00' }}
                    >
                      {ing}
                    </span>
                  ))}
                </div>

                {step === 'ingredients' && (
                  <button
                    type="button"
                    onClick={handleGenerateRecipe}
                    className="w-full sm:w-auto rounded-xl px-6 py-3 sm:py-2.5 text-sm font-semibold text-white transition hover:opacity-85 active:scale-[0.98]"
                    style={{ backgroundColor: '#ffa51f' }}
                  >
                    Bu malzemelerle tarif üret →
                  </button>
                )}

                {step === 'generating' && (
                  <p className="text-sm text-amber-500 font-medium animate-pulse">
                    Tarif üretiliyor…
                  </p>
                )}
              </>
            ) : (
              <div>
                <p className="mb-3 text-sm text-gray-400">
                  Fotoğrafta yiyecek tespit edilemedi. Farklı bir fotoğraf dene.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-gray-400 underline hover:text-gray-600"
                >
                  Yeni fotoğraf yükle
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe result */}
      <AnimatePresence>
        {step === 'recipe' && recipe && (
          <motion.div
            key="recipe"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 md:p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span className="text-sm font-semibold text-gray-700">Tarifiniz hazır</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {recipe}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 text-xs text-gray-400 underline hover:text-gray-600"
            >
              Yeni fotoğraf analiz et
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
