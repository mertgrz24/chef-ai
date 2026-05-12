'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MealPlan, MealItem } from '@/types/meal-plan'

const DAY_LABELS: Record<string, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MEAL_ICONS = { breakfast: '🌅', dinner: '🌙' } as const
const MEAL_LABELS = { breakfast: 'Kahvaltı', dinner: 'Akşam' } as const

export default function MealPlanPage() {
  const [plan, setPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [regenKey, setRegenKey] = useState<string | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchPlan = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/meal-plan')
      if (res.ok) {
        const data = (await res.json()) as { plan: MealPlan }
        setPlan(data.plan)
      } else if (res.status === 404) {
        setPlan(null)
      } else {
        setError('Plan yüklenirken hata oluştu.')
      }
    } catch {
      setError('Plan yüklenirken hata oluştu.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchPlan()
  }, [fetchPlan])

  async function generatePlan() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/meal-plan/generate', { method: 'POST' })
      if (res.ok) {
        const data = (await res.json()) as { plan: MealPlan }
        setPlan(data.plan)
      } else {
        setError('Plan oluşturulamadı. Lütfen tekrar deneyin.')
      }
    } catch {
      setError('Plan oluşturulamadı. Lütfen tekrar deneyin.')
    }
    setGenerating(false)
  }

  async function regenMeal(day: string, meal: 'breakfast' | 'dinner') {
    const key = `${day}-${meal}`
    setRegenKey(key)
    setError(null)
    try {
      const res = await fetch('/api/meal-plan/regenerate-day', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, meal }),
      })

      const data = (await res.json()) as { plan?: MealPlan; error?: string; detail?: string }
      console.log('[regenMeal] yanıt:', res.status, data)

      if (!res.ok) {
        setError(data.error ?? 'Öğün yenilenemedi. Lütfen tekrar deneyin.')
        return
      }

      if (!data.plan) {
        setError('Öğün yenilenemedi: API boş yanıt döndürdü.')
        return
      }

      // Surgical update — only patch the one meal, leave other days untouched
      const newMealItem = data.plan.meals.find((d) => d.day === day)?.[meal]
      if (newMealItem) {
        setPlan((prev) =>
          prev
            ? {
                ...prev,
                meals: prev.meals.map((d) =>
                  d.day === day ? { ...d, [meal]: newMealItem } : d
                ),
              }
            : prev
        )
      } else {
        // Fallback: replace whole plan if we can't isolate the meal
        setPlan(data.plan ?? null)
      }
    } catch (err) {
      console.error('[regenMeal] fetch hatası:', err)
      setError('Öğün yenilenemedi. Lütfen tekrar deneyin.')
    } finally {
      setRegenKey(null)
    }
  }

  function toggleExpand(key: string) {
    setExpandedKey((prev) => (prev === key ? null : key))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="mb-3 text-4xl">⏳</div>
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const sortedDays = plan
    ? DAY_ORDER.map((d) => plan.meals.find((m) => m.day === d)).filter(Boolean)
    : []

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">🗓️ Haftalık Yemek Planım</h1>
        {plan && !generating && (
          <button
            onClick={() => { void generatePlan() }}
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-600 transition hover:bg-amber-100"
          >
            🔄 Tüm Planı Yenile
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Generating whole plan spinner */}
      {generating && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-12 text-center">
          <div className="mb-3 flex justify-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-300 border-t-transparent" />
          </div>
          <p className="text-sm font-medium text-amber-700">
            Planın hazırlanıyor... Bu biraz sürebilir.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!plan && !generating && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mb-4 text-5xl">🗓️</div>
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Bu hafta için plan oluşturulmadı
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Yapay zeka, diyet hedeflerine göre 7 günlük kişisel planını oluşturur.
          </p>
          <button
            onClick={() => { void generatePlan() }}
            className="inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white transition"
            style={{ backgroundColor: '#ffa51f' }}
          >
            🗓️ Haftalık Planımı Oluştur
          </button>
        </div>
      )}

      {/* Plan list */}
      {plan && !generating && (
        <div className="space-y-4">
          {sortedDays.map((dayData) => {
            if (!dayData) return null
            return (
              <div
                key={dayData.day}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                {/* Day header */}
                <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-3">
                  <span className="text-sm font-semibold text-gray-700">
                    📅 {DAY_LABELS[dayData.day] ?? dayData.day}
                  </span>
                </div>

                {/* Meals */}
                <div className="divide-y divide-gray-50">
                  {(['breakfast', 'dinner'] as const).map((mealType) => {
                    const mealItem = dayData[mealType] as MealItem
                    const key = `${dayData.day}-${mealType}`
                    const isExpanded = expandedKey === key
                    const isRegening = regenKey === key

                    return (
                      <div key={mealType}>
                        {/* Meal row */}
                        <div className="flex items-center gap-3 px-5 py-3.5">
                          <span className="text-lg">{MEAL_ICONS[mealType]}</span>
                          <span className="w-16 flex-shrink-0 text-xs font-medium text-gray-400">
                            {MEAL_LABELS[mealType]}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleExpand(key)}
                            className="min-w-0 flex-1 text-left text-sm font-medium text-gray-800 transition hover:text-amber-600"
                          >
                            {isRegening ? (
                              <span className="flex items-center gap-2 text-gray-400">
                                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                                Yenileniyor...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                {mealItem.name}
                                <span className="text-xs text-gray-300">
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => { void regenMeal(dayData.day, mealType) }}
                            disabled={isRegening || regenKey !== null}
                            title="Bu öğünü yenile"
                            className="flex-shrink-0 rounded-lg p-1.5 text-sm text-gray-400 transition hover:bg-amber-50 hover:text-amber-500 disabled:opacity-30"
                          >
                            🔄
                          </button>
                        </div>

                        {/* Accordion detail */}
                        {isExpanded && !isRegening && (
                          <div className="space-y-3 border-t border-gray-50 bg-gray-50/50 px-5 py-4">
                            {mealItem.ingredients.length > 0 && (
                              <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Malzemeler
                                </p>
                                <ul className="space-y-0.5">
                                  {mealItem.ingredients.map((ing, i) => (
                                    <li key={i} className="text-sm text-gray-700">
                                      • {ing}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {mealItem.instructions && (
                              <div>
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Hazırlık
                                </p>
                                <p className="whitespace-pre-line text-sm text-gray-700">
                                  {mealItem.instructions}
                                </p>
                              </div>
                            )}
                            {mealItem.macros && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                <MacroBadge
                                  icon="🔥"
                                  value={`${mealItem.macros.calories} kcal`}
                                />
                                <MacroBadge
                                  icon="💪"
                                  value={`${mealItem.macros.protein_g}g protein`}
                                />
                                <MacroBadge
                                  icon="🍚"
                                  value={`${mealItem.macros.carbs_g}g karb`}
                                />
                                <MacroBadge
                                  icon="🧈"
                                  value={`${mealItem.macros.fat_g}g yağ`}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MacroBadge({ icon, value }: { icon: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      {icon} {value}
    </span>
  )
}
