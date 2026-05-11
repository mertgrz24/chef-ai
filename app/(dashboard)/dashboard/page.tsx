import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PhotoAnalyzer } from '@/components/dashboard/photo-analyzer'
import { RecipeGenerator } from '@/components/dashboard/recipe-generator'
import type { Profile } from '@/types/profile'

type RecentRecipe = { id: string; name: string; created_at: string }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const DIET_LABELS: Record<string, string> = {
  omnivore: 'Normal',
  vegan: 'Vegan',
  vegetarian: 'Vejetaryen',
  keto: 'Keto',
  gluten_free: 'Glutensiz',
  dairy_free: 'Sütsüz',
  paleo: 'Paleo',
}

function dietLabel(dt: string): string {
  return DIET_LABELS[dt] ?? dt
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: pantryItems },
    { data: profileData },
    savedCountResult,
    { data: recentData },
  ] = await Promise.all([
    supabase.from('pantry').select('expiry_date').eq('user_id', user!.id),
    supabase
      .from('profiles')
      .select('daily_calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, water_goal_l, daily_steps_goal, current_weight_kg, target_weight_kg, diet_type')
      .eq('id', user!.id)
      .single(),
    supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase
      .from('recipes')
      .select('id, name, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const savedCount = (savedCountResult.count as number | null) ?? 0
  const recentRecipes = (recentData ?? []) as RecentRecipe[]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  const pantryCount = pantryItems?.length ?? 0
  // upcoming: expires today through next 7 days (not yet expired)
  const wasteAlertCount = pantryItems?.filter((item) => {
    const expiry = new Date(item.expiry_date)
    return expiry >= today && expiry <= sevenDaysLater
  }).length ?? 0
  // already past expiry: strictly before today
  const expiredCount = pantryItems?.filter((item) => {
    const expiry = new Date(item.expiry_date)
    return expiry < today
  }).length ?? 0

  const stats = [
    { label: 'Kilerimde malzeme', value: pantryCount, icon: '🥦' },
    { label: 'Kayıtlı tarif', value: savedCount, icon: '📋' },
    { label: 'İsraf uyarısı', value: wasteAlertCount, icon: '⚠️' },
  ]

  const profile = profileData as Profile | null

  type GoalItem = { icon: string; label: string; value: string }
  const goalItems: GoalItem[] = profile
    ? ([
        profile.daily_calorie_goal !== null
          ? { icon: '🔥', label: 'Kalori', value: `${profile.daily_calorie_goal} kcal` }
          : null,
        profile.protein_goal_g !== null
          ? { icon: '💪', label: 'Protein', value: `${profile.protein_goal_g} g` }
          : null,
        profile.carbs_goal_g !== null
          ? { icon: '🍚', label: 'Karb', value: `${profile.carbs_goal_g} g` }
          : null,
        profile.fat_goal_g !== null
          ? { icon: '🧈', label: 'Yağ', value: `${profile.fat_goal_g} g` }
          : null,
        profile.water_goal_l !== null
          ? { icon: '🌊', label: 'Su', value: `${profile.water_goal_l} litre` }
          : null,
        profile.daily_steps_goal !== null
          ? { icon: '👟', label: 'Adım', value: `${profile.daily_steps_goal.toLocaleString('tr-TR')} adım` }
          : null,
        profile.current_weight_kg !== null
          ? { icon: '⚖️', label: 'Mevcut Kilo', value: `${profile.current_weight_kg} kg` }
          : null,
        profile.target_weight_kg !== null
          ? { icon: '🎯', label: 'Hedef Kilo', value: `${profile.target_weight_kg} kg` }
          : null,
        profile.diet_type !== null
          ? { icon: '🥗', label: 'Diyet', value: dietLabel(profile.diet_type!) }
          : null,
      ] as (GoalItem | null)[]).filter((g): g is GoalItem => g !== null)
    : []

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Merhaba, {user?.email} 👋
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 text-3xl">{stat.icon}</div>
            <div className="text-3xl font-bold" style={{ color: '#ffa51f' }}>
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}

        {expiredCount > 0 && (
          <Link
            href="/pantry"
            className="block rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm transition hover:bg-red-100"
          >
            <div className="mb-3 text-3xl">🗑️</div>
            <div className="text-3xl font-bold text-red-600">{expiredCount} ürün</div>
            <div className="mt-1 text-sm text-red-400">Tüketim Tarihi Geçmiş</div>
          </Link>
        )}
      </div>

      {/* Hedeflerim */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">🎯 Hedeflerim</h2>
          <Link href="/profile" className="text-xs text-amber-500 hover:underline">
            Düzenle →
          </Link>
        </div>

        {goalItems.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-400">
              Henüz hedef girilmemiş.{' '}
              <Link href="/profile" className="text-amber-500 hover:underline">
                Hedeflerini belirle →
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {goalItems.map((g) => (
              <div
                key={g.label}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-1 text-xl">{g.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{g.value}</div>
                <div className="mt-0.5 text-xs text-gray-400">{g.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Geçmiş Tariflerim */}
      {recentRecipes.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">📋 Geçmiş Tariflerim</h2>
          <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100 bg-white shadow-sm">
            {recentRecipes.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="truncate text-sm font-medium text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                </div>
                <Link
                  href={`/recipe/${r.id}`}
                  className="flex-shrink-0 text-xs font-medium text-amber-500 transition hover:underline"
                >
                  🔗 Paylaş
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <PhotoAnalyzer />
      <RecipeGenerator />
    </div>
  )
}
