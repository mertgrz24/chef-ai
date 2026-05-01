export default function ProfilePage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Profil</h1>
      <p className="mb-8 text-sm text-gray-500">Hesap ayarların ve tercihler.</p>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
        <span className="mb-4 text-5xl">👤</span>
        <h2 className="mb-2 text-base font-semibold text-gray-700">Profil yakında açılıyor</h2>
        <p className="max-w-xs text-sm text-gray-400">
          Diyet tercihlerin, bildirim ayarların ve abonelik bilgilerini yönetebileceğin
          profil sayfası hazırlanıyor.
        </p>
      </div>
    </div>
  )
}
