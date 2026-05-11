import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Recipe } from '@/types/recipe'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function PublicRecipePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) notFound()

  const recipe = data as Recipe
  if (!recipe.is_public) notFound()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f0' }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: '#ffa51f' }}>
            ChefAI
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 transition hover:text-gray-700">
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{recipe.name}</h1>
          <p className="mb-6 text-xs text-gray-400">{formatDate(recipe.created_at)}</p>

          {/* Ingredients */}
          <div className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
              <span>📝</span> Malzemeler
            </h2>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: '#ffa51f' }}
                  />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
              <span>👨‍🍳</span> Hazırlık
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {recipe.instructions}
            </p>
          </div>

          {/* Macros */}
          {recipe.macros && (
            <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-gray-600">
              <span>🔥 <span className="font-semibold text-gray-800">{recipe.macros.calories} kcal</span></span>
              <span>💪 <span className="font-semibold text-gray-800">{recipe.macros.protein_g}g</span> protein</span>
              <span>🍚 <span className="font-semibold text-gray-800">{recipe.macros.carbs_g}g</span> karb</span>
              <span>🧈 <span className="font-semibold text-gray-800">{recipe.macros.fat_g}g</span> yağ</span>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/dashboard"
            className="block w-full rounded-xl py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#ffa51f' }}
          >
            Sen de dene →
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Bu tarif{' '}
          <Link href="/" className="font-medium hover:underline" style={{ color: '#ffa51f' }}>
            ChefAI
          </Link>{' '}
          ile üretildi
        </p>
      </main>
    </div>
  )
}
