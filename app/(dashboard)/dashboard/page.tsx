import { createClient } from '@/lib/supabase/server'
import { PhotoAnalyzer } from '@/components/dashboard/photo-analyzer'
import { RecipeGenerator } from '@/components/dashboard/recipe-generator'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pantryItems } = await supabase
    .from('pantry')
    .select('expiry_date')
    .eq('user_id', user!.id)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)

  const pantryCount = pantryItems?.length ?? 0
  const wasteAlertCount = pantryItems?.filter((item) => {
    const expiry = new Date(item.expiry_date)
    return expiry <= threeDaysLater
  }).length ?? 0

  const stats = [
    { label: 'Kilerimde malzeme', value: pantryCount, icon: '🥦' },
    { label: 'Kayıtlı tarif', value: 0, icon: '📋' },
    { label: 'İsraf uyarısı', value: wasteAlertCount, icon: '⚠️' },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Merhaba, {user?.email} 👋
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
      </div>

      <PhotoAnalyzer />
      <RecipeGenerator />
    </div>
  )
}
