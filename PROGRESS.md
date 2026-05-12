# Chef-AI — Progress Tracker

> Her seans sonu güncellenir. Yarın geri dönüldüğünde "neredeyiz?" sorusunun cevabı buradadır.

## 📍 Şu an neredeyiz?

**Aktif Faz:** V3 — App'i Canlandırma (başlamadı)  
**Aktif Mikro-Adım:** Sonraki: V3.1 — Tarif Görselleri (Unsplash API)  
**Son güncelleme:** 12 Mayıs 2026  
**Canlı URL:** https://chef-ai-puce-zeta.vercel.app

## 🗺️ Genel Yol Haritası

### Phase 1 — Landing Page ✅ TAMAMLANDI (Hafta 1)
- [x] Adım 0 — Ortam hazırlığı (Node.js, VS Code, Claude Code)
- [x] Adım 1 — Boş Next.js 14 + Tailwind v3 + TypeScript kurulumu
- [x] Adım 1.5 — localhost:3000'de varsayılan sayfa çalışıyor
- [x] Adım 2 — globals.css + layout.tsx (krem bg, Inter font, metadata)
- [x] Adım 3 — Navbar (logo, masaüstü nav, hamburger menü, fade-in)
- [x] Adım 4 — Hero section (iki kolon, telefon mockup, staggered animasyon)
- [x] Adım 5 — Features section (3 kart, featured koyu, whileInView stagger)
- [x] Adım 6 — HowItWorks + Pricing bölümleri (sol-sağ stagger, fiyat kartları)
- [x] Adım 7 — Footer (koyu bg, link grupları, alt copyright)
- [x] Adım 8 — Vercel'e deploy + canlı URL → https://chef-ai-puce-zeta.vercel.app

### Phase 2 — Auth & Pantry UI ✅ TAMAMLANDI (Hafta 2)
- [x] Supabase kurulumu
- [x] Login/signup akışı — test edildi, dashboard'a erişim çalışıyor ✅
- [x] Landing page butonları bağlandı — "Ücretsiz Başla" → /signup, "Giriş Yap" → /login ✅

### Phase 3 — Recipe Engine ✅ TAMAMLANDI (Hafta 3)
- [x] Claude API entegrasyonu — `lib/ai/claude.ts` wrapper (prompt caching dahil)
- [x] `/api/recipes` endpoint'i (auth korumalı, mock mod ile test edildi)
- [x] Tarif üretme akışı + UI — `RecipeGenerator` bileşeni, dashboard'a entegre

### Phase 4 — Visual Pantry ✅ TAMAMLANDI (Hafta 4)
- [x] Gemini Vision API entegrasyonu — `lib/ai/gemini.ts` wrapper (`gemini-2.5-pro`)
- [x] Fotoğraf yükleme akışı — `/api/vision` endpoint'i (auth korumalı, 10 MB limit)
- [x] Otomatik malzeme tanıma + UI — `PhotoAnalyzer` bileşeni, dashboard'a entegre
- [x] Uçtan uca test: mercimek + patates tespit edildi, tarif üretildi ✅

### Phase 5 — Polish ✅ TAMAMLANDI (Hafta 5)
- [x] Mobile responsive — sidebar `hidden md:flex`, `MobileNav` hamburger menü
- [x] PhotoAnalyzer mobil fix — `<label htmlFor>` ile native file trigger, `inputKey` reset
- [x] MobileNav fix — `type="button"`, ☰/✕ toggle
- [x] Butonlar mobilde `w-full`, masaüstünde `w-auto`
- [x] framer-motion 10.18.0'a sabitlendi (11.x `motion-utils` build hatası çözüldü)

### Phase 6 — Waste Alert & Beta ✅ TAMAMLANDI (Hafta 6)
- [x] Supabase `pantry` tablosu — uuid PK, user_id FK, name, expiry_date, quantity, created_at
- [x] RLS politikaları — SELECT / INSERT / UPDATE / DELETE kullanıcı bazlı izole
- [x] `GET /api/pantry` — malzemeleri expiry_date ASC sıralar
- [x] `POST /api/pantry` — validasyonlu ekleme (name zorunlu, date format kontrolü)
- [x] `DELETE /api/pantry/[id]` — RLS + user_id çift kontrol, 204 döner
- [x] `PantryClient` — optimistic UI, renk kodlaması (🔴 ≤0 · 🟠 ≤3 · 🟡 ≤7 · 🟢 7+gün)
- [x] Dashboard stats gerçek veriye bağlandı — kiler sayısı + israf uyarısı sayısı
- [x] Placeholder sayfalar oluşturuldu — /pantry /recipes /profile

### Phase 7 — Launch ✅ TAMAMLANDI (Hafta 7)
- [x] Production Vercel deploy — canlıda ✅
- [x] Environment variables Vercel'e taşındı
- [x] PWA kurulumu — manifest, icon, apple-icon, service worker
- [x] Telefona "Ana Ekrana Ekle" çalışıyor
- [x] Kamera + galeri seçimi (capture attribute kaldırıldı)

---

## 🚀 V2 — Haftalık Yemek Planı

### V2.1 — Diyet Hedefleri (Aktif)
- [x] **A1** — `profiles` tablosu oluşturuldu (email, full_name + 10 diyet alanı, RLS, trigger) ✅
- [x] **A2.1** — `GET /api/profile` + `PUT /api/profile` endpoint'leri (auth, validasyon, RLS) ✅
- [x] **A2.2** — `/profile` sayfasında diyet hedefi formu (UI) ✅
- [x] **A2.3** — Dashboard'a "Tüketim Tarihi Geçmiş" kutusu (kırmızı, koşullu, /pantry linki) ✅
- [x] **A3.1** — Claude JSON çıktısı + makro tahmini + diyet hedefi prompt entegrasyonu ✅
- [x] **A3.2** — Dashboard "Hedeflerim" paneli (null-filtreli goal kartları, boşsa link) ✅
- [x] **A4** — Dashboard hedef göstergesi — ilerleme çubuğu yok, hedef değerleri doğrudan kartlarda gösteriliyor ✅

### V2.2 — Paylaşılabilir Tarif Kartları ✅ TAMAMLANDI
- [x] **B1** — `recipes` Supabase tablosu (SQL: id, user_id, name, ingredients[], instructions, macros jsonb, diet_context, is_public, created_at) + RLS ✅
- [x] **B2** — Tarif kaydetme ve paylaşım API endpoint'leri ✅
  - `types/recipe.ts` — `Recipe`, `RecipeMacros` tipleri
  - `POST /api/recipes/save` — auth + validasyon + insert, 201
  - `GET /api/recipes/history` — auth + user tarifleri, limit 20, DESC
  - `GET /api/recipes/[id]` — public, is_public kontrolü, 404 guard
- [x] **B3** — Tarif kaydet & paylaş UI + public tarif sayfası ✅
  - `RecipeGenerator`: "🔗 Kaydet & Paylaş" butonu, Web Share API / clipboard fallback, `parseFormattedRecipe` helper
  - `app/recipe/[id]/page.tsx`: public sayfa, auth yok, malzeme+adım+makro, "Sen de dene →" CTA
  - `dashboard/page.tsx`: "Geçmiş Tariflerim" son 5 tarif listesi, "Kayıtlı tarif" stat gerçek sayı

### V2.3 — Haftalık Yemek Planı ✅ TAMAMLANDI
- [x] **C1** — `meal_plans` Supabase tablosu (id, user_id, week_start_date, meals jsonb, created_at, updated_at) + RLS + unique(user_id, week_start_date) ✅
- [x] **C2** — API endpoint'leri ✅
  - `types/meal-plan.ts` — `MealItem`, `MealPlanDay`, `MealPlan` tipleri
  - `lib/ai/gemini.ts` — `generateWeeklyMealPlan(dietContext?)` + `generateSingleMeal(day, mealType, dietContext?)`
  - `POST /api/meal-plan/generate` — auth + profil çek + Gemini + UPSERT, 201
  - `GET /api/meal-plan` — auth + bu haftanın planı, 200/404
  - `PATCH /api/meal-plan/regenerate-day` — auth + body validasyon + tek öğün yenile + UPDATE, 200
  - typecheck: 0 hata · lint: 0 hata
- [x] **C3** — Haftalık plan UI ✅
  - `app/(dashboard)/meal-plan/page.tsx`: yükleme/boş durum/plan görünümü, 🔄 tüm plan yenile, tek öğün yenile (sadece o satır spinner), accordion detay (malzeme + talimat + makro badge)
  - `app/(dashboard)/layout.tsx`: sidebar'a "🗓️ Yemek Planı" nav linki eklendi
  - `components/dashboard/mobile-nav.tsx`: mobile menüye "Yemek Planı" eklendi
  - `app/(dashboard)/dashboard/page.tsx`: "Bu Haftaki Planın" widget'ı — bugünün kahvaltı+akşam öğünü, plan yoksa "oluştur →" linki
  - typecheck: 0 hata · lint: 0 hata

### V2 Kapsam (Genel) ✅ TAMAMLANDI 🎉
- [x] Paylaşılabilir tarif kartları (viral mekanizma) ✅
- [x] Haftalık yemek planı oluşturma ✅
- [x] Kalori tahmini — makrolar tarif ve plan öğünlerinde gösteriliyor ✅

---

## 🚀 V3 — App'i Canlandırma

> V3 amacı: V2'nin temel özellikleri üzerine görsel zenginlik, etkileşim ve keyif katmanları eklemek.

### V3.1 — Tarif Görselleri
- [ ] **D1** — `lib/unsplash.ts` wrapper (Unsplash API, tarif adına göre fotoğraf çek)
- [ ] **D2** — Tarif kartları, public tarif sayfası, haftalık plan accordion'larına görsel entegrasyonu

### V3.2 — Dark Mode + Animasyonlar
- [ ] **E1** — Theme toggle (light/dark) + localStorage persistence
- [ ] **E2** — `globals.css`'te dark mode CSS variables
- [ ] **E3** — Framer Motion ile sayfa geçişleri ve kart animasyonları

### V3.3 — Adım Adım Pişirme Modu
- [ ] **F1** — Public tarif sayfasına "👨‍🍳 Pişirmeye Başla" butonu
- [ ] **F2** — Full-screen step-by-step mod (tek adım, ileri/geri)
- [ ] **F3** — Zamanlayıcı entegrasyonu (tarifteki dakikaları algıla)

### V3.4 — Alışveriş Listesi
- [ ] **G1** — Haftalık plandan otomatik market listesi üretme + pantry çıkarma
- [ ] **G2** — `/shopping-list` sayfası + paylaşılabilir link

### V3.5 — Tarif Sohbeti
- [ ] **H1** — Tarif altına "Bu tarifi şöyle değiştir" input'u
- [ ] **H2** — Gemini'ye context ile yeniden gönderme ("daha az kalorili", "vejetaryen yap" vb.)
- [ ] **H3** — Yeni varyant olarak kaydetme seçeneği

### V3.6 — Tüketim Takibi + Haftalık Özet
- [ ] **I1** — Supabase `meals_eaten` tablosu + RLS
- [ ] **I2** — "Yedim ✓" butonu (tarif kartı ve plan öğününde)
- [ ] **I3** — Günlük tüketim özeti
- [ ] **I4** — Haftalık özet sayfası (toplam kalori, makro dağılımı, en çok yenen tarifler)

---

## 🎯 Önemli Kararlar (kronolojik)

- **26 Nis 2026:** Stack: Next.js 14 + Tailwind v3 + TypeScript + Framer Motion + Supabase + Claude API + Gemini API. (16 + v4 yerine, daha bol kaynak için.)
- **26 Nis 2026:** Çalışma modu: mikro-adım, her değişiklik sonrası dur ve onay bekle.
- **26 Nis 2026:** Türkçe iletişim, İngilizce kod yorumları.

## ❓ Açık Sorular (sonraki seansta cevaplanacak)

- Renk paleti: sıcak gıda tonları mı, premium soğuk tonlar mı?
- Landing page'de hero altında hangi bölümler olacak?
- Brand voice: samimi mi, profesyonel mi, oyuncu mu?
- Logo/görsel kimlik şimdi mi yoksa sonra mı?

## 🚀 Sonraki Seansa Başlangıç Prompt'u

Yeni bir Claude Code konuşması açtığında şunu yapıştır:

> Chef-AI V3 projesindeyim. CLAUDE.md ve PROGRESS.md'yi oku, iki cümleyle özetle: nerede kaldık, sıradaki mikro-adım ne? Mikro-adım modunda kal, Türkçe konuş.

## 📝 Seans Notları

### 12 Mayıs 2026 — V3 yol haritası planlandı — V2 TAMAMLANDI 🎉
- V2.1 diyet hedefleri tamamlandı (profil sayfası, dashboard kartları)
- V2.2 paylaşılabilir tarif kartları (link + public sayfa + geçmiş)
- V2.3 haftalık yemek planı (Gemini üretim + öğün yenileme + dashboard widget)
- Tarif üretimi Claude API'den Gemini API'ye taşındı (maliyet optimizasyonu)
- V3 yol haritası 6 başlıkta planlandı (V3.1–V3.6)

### 12 Mayıs 2026 — V2.3 tamamlandı
- `types/meal-plan.ts`: `MealItem`, `MealPlanDay`, `MealPlan` tipleri
- `lib/ai/gemini.ts`: `generateWeeklyMealPlan(dietContext?)` + `generateSingleMeal(day, mealType, dietContext?)` eklendi
- `POST /api/meal-plan/generate`: auth + profil + Gemini + UPSERT, hata detayı response'a eklendi
- `GET /api/meal-plan`: bu haftanın planı, 200/404
- `PATCH /api/meal-plan/regenerate-day`: tek öğün yenileme, body validasyonu
- `app/(dashboard)/meal-plan/page.tsx`: boş durum + oluştur butonu + 7 günlük liste + accordion detay + tek öğün yenile + tüm planı yenile
- Sidebar ve mobil nav'a "🗓️ Yemek Planı" eklendi
- Dashboard'a "Bu Haftaki Planın" widget'ı (bugünün öğünleri)
- Bug fix: `regenMeal` surgical state update, `finally` bloğu, hata mesajı gösterimi

### 11 Mayıs 2026 — V2.2 B3 tamamlandı — V2.2 COMPLETE
- `components/dashboard/recipe-generator.tsx`: `parseFormattedRecipe` helper; `parsedRecipe`, `savedRecipeId`, `saving`, `shareMessage`, `saveError` state; `handleSave` → POST /api/recipes/save; `triggerShare` → Web Share API önce, `AbortError` ignore, clipboard fallback; "🔗 Tekrar Paylaş" idempotent
- `app/recipe/[id]/page.tsx`: server component, Supabase doğrudan sorgu, `notFound()` guard, malzeme bullet listesi, `whitespace-pre-wrap` talimatlar, makro satırı (amber bg), "Sen de dene →" CTA
- `app/(dashboard)/dashboard/page.tsx`: Promise.all'a recipes count + 5 recent sorguları eklendi; "Kayıtlı tarif" stat artık gerçek; "📋 Geçmiş Tariflerim" bölümü isim+tarih+paylaş linki; `formatDate` helper; `RecentRecipe` tipi
- ⚠️ Public recipe sayfası için Supabase'de "anyone can read public recipes" RLS policy gerekiyor (bkz. test talimatı)

### 11 Mayıs 2026 — V2.2 B2 tamamlandı
- `types/recipe.ts` oluşturuldu: `Recipe` + `RecipeMacros` interface'leri
- `POST /api/recipes/save`: auth, name+ingredients+instructions zorunlu validasyon, is_public=true insert, 201 + kayıtlı satır
- `GET /api/recipes/history`: auth, user_id filtreli, created_at DESC, limit 20
- `GET /api/recipes/[id]`: public endpoint, PGRST116 → 404, is_public=false → 404
- Mevcut `app/api/recipes/route.ts` dokunulmadı
- **Not:** `recipes` Supabase tablosu henüz oluşturulmadı — B1 için SQL gerekiyor
- lint: 0 error, typecheck: 0 error

### 11 Mayıs 2026 — Tarif üretimi Claude → Gemini'ye taşındı
- `lib/ai/gemini.ts`: `RecipeMacros`, `RecipeResult`, `RECIPE_SYSTEM_PROMPT`, `parseRecipeJson`, `generateRecipeWithGemini(ingredients, dietContext?)` eklendi; `analyzeIngredients`'a dokunulmadı
- `app/api/recipes/route.ts`: Claude importları kaldırıldı; `generateRecipeWithGemini` + local `buildDietContext` helper kullanılıyor; mantık (auth, validasyon, profil fetch) aynı
- `lib/ai/claude.ts`: değiştirilmedi (ileride başka amaçla kullanılabilir)
- GEMINI_API_KEY .env.local'da mevcut ✅

### 11 Mayıs 2026 — V2.1 A3 tamamlandı
**A3.1 — Tarif motoru:**
- `lib/ai/claude.ts`: System prompt JSON çıktısı istiyor; `RecipeMacros`, `ProfileContext`, `RecipeResult` (macros dahil) tipleri eklendi; `buildDietBlock` + `parseRecipeJson` helper'ları; `generateRecipe(ingredients, profile?)` imzası güncellendi; code fence strip fallback var
- `app/api/recipes/route.ts`: Mock tamamen kaldırıldı; gerçek Claude API; tarif öncesi Supabase'den profil çekiliyor, `ProfileContext` olarak `generateRecipe`'ye geçiliyor; `{ recipe, macros }` dönüyor
- `components/dashboard/recipe-generator.tsx`: `macros` state eklendi; tarif kartı altına 🔥💪🍚🧈 satırı; "Yeni tarif üret" macros'u da sıfırlıyor

**A3.2 — Dashboard Hedeflerim paneli:**
- `app/(dashboard)/dashboard/page.tsx`: Profil Promise.all ile pantry ile paralel çekiliyor; null-filtreli `goalItems` dizisi; grid `2/3/4/5 col` responsive; boşsa dashed border + "Hedeflerini belirle →" linki; "Düzenle →" header linki
- `dietLabel()` helper: DB değerlerini Türkçe etikete çeviriyor
- lint: 0 error, typecheck: 0 error

### 11 Mayıs 2026 — V2.1 A2.3 tamamlandı
- `app/(dashboard)/dashboard/page.tsx`: `expiredCount` hesabı eklendi (`expiry < today`, dün veya öncesi)
- Dashboard stat grid'i `sm:grid-cols-3` → `sm:grid-cols-2 lg:grid-cols-4`'e güncellendi
- `expiredCount > 0` olduğunda kırmızı `🗑️` kartı render ediliyor, tıklanınca `/pantry`'ye yönlendiriyor
- `import Link` eklendi; lint: 0 error, typecheck: 0 error
- Semantik ayrım: `wasteAlertCount` (≤ today, bugün dahil) vs `expiredCount` (< today, dün veya öncesi)

### 11 Mayıs 2026 — V2.1 A2.2 tamamlandı
- `app/(dashboard)/profile/page.tsx` tamamen yeniden yazıldı (placeholder → çalışan form)
- 4 bölümlü form: Beslenme Hedefleri / Aktivite / Kilo Takibi / Diyet Tercihi
- Sayfa açılınca GET /api/profile ile değerleri çekiyor, forma dolduruyor
- "Diğer" diyet tipi seçilince text input açılıyor
- Kaydet → PUT /api/profile, başarı/hata mesajı gösteriyor
- Loading ve hata state'leri mevcut; buton kayıt sırasında disabled
- Framer Motion fade-up (delay stagger, 0.25s, easeOut) ile 4 bölüm
- Yeni paket eklenmedi; lint: 0 error, typecheck: 0 error

### 11 Mayıs 2026 — V2.1 A2.1 tamamlandı
- `app/api/profile/route.ts` oluşturuldu (GET + PUT)
- GET: auth kontrolü → `profiles` tablosundan satır çek → 200/401/404/500
- PUT: izin verilen 10 alan, sayısal alanlar null|pozitif kontrol, `id/email/created_at` yok sayılır, `goals_updated_at` + `updated_at` her güncellemede set edilir
- `types/profile.ts`'e `ProfileUpdatePayload` tipi eklendi
- lint: 0 error, typecheck: 0 error

### 4 Mayıs 2026 — V2.1 A1 tamamlandı
- `profiles` tablosu yoktu, sıfırdan oluşturuldu
- 14 kolon: id, email, full_name, 10 diyet alanı, created_at, updated_at
- RLS politikaları + signup trigger kuruldu
- Mevcut kullanıcı (1 hesap) otomatik migrate edildi
- Eski migration dosyası silindi, referans dosyası oluşturuldu
- `types/profile.ts` güncellendi

### 1 Mayıs 2026 — Phase 7 tamamlandı — V1 COMPLETE 🎉
- Vercel deploy canlı: https://chef-ai-puce-zeta.vercel.app
- PWA: manifest.ts, icon.tsx, apple-icon.tsx, sw.js (cache-first static / network-first pages)
- iOS + Android "Ana Ekrana Ekle" çalışıyor
- `capture` attribute kaldırıldı — kamera ve galeri seçimi aktif
- Tüm V1 fazları tamamlandı (Phase 1-7)

### 1 Mayıs 2026 — Phase 6 tamamlandı
- Supabase `pantry` tablosu + RLS kuruldu (SQL Editor ile manuel)
- `GET/POST /api/pantry` + `DELETE /api/pantry/[id]` route'ları yazıldı
- `PantryClient`: optimistic add/delete, expiry renk kodlaması, israf uyarısı sayacı
- Dashboard stats (`🥦 kiler`, `⚠️ israf`) gerçek DB verisine bağlandı
- Phase 5 mobil fixler: MobileNav hamburger, PhotoAnalyzer label-trigger, buton genişlikleri
- framer-motion 10.18.0 sabitlendi (motion-utils webpack uyumsuzluğu)

### 1 Mayıs 2026 — Phase 4 tamamlandı
- `@google/generative-ai` 0.24.1 kuruldu
- `lib/ai/gemini.ts`: `gemini-2.5-pro` vision wrapper, base64 görüntü → Türkçe malzeme listesi
- `app/api/vision/route.ts`: POST endpoint, auth + MIME tipi + 10 MB validasyonu
- `components/dashboard/photo-analyzer.tsx`: 5 adımlı state machine (idle → previewing → analyzing → ingredients → generating → recipe), tek akışta fotoğraf → tarif
- Uçtan uca test: mercimek + patates doğru tespit, tarif üretildi

### 1 Mayıs 2026 — Phase 3 tamamlandı
- `lib/ai/claude.ts`: Anthropic SDK wrapper, system prompt caching (`cache_control: ephemeral`)
- `app/api/recipes/route.ts`: POST endpoint, auth korumalı, mock mod (2-3s gecikme, gerçekçi tarif)
- `components/dashboard/recipe-generator.tsx`: Virgülle ayrılmış malzeme girişi, Framer Motion AnimatePresence ile tarif kartı
- Dashboard'a `RecipeGenerator` entegre edildi
- `framer-motion` 12.x → 11.18.2 downgrade: Next.js 14 hidrasyon sorunu (opacity:0 kalma) çözüldü
- `.next` cache temizlendi, sunucu port 3000'de yeniden başlatıldı

### 30 Nisan 2026 — Phase 2 tamamlandı
- Landing page butonları /signup ve /login'e bağlandı (navbar desktop+mobil, hero, pricing)
- `<a href="#">` → Next.js `<Link>` geçişi yapıldı

### 30 Nisan 2026 — Auth doğrulama
- Supabase URL DNS hatası tespit edildi (proje ID yanlış kopyalanmıştı), .env.local güncellendi
- Login ve signup sayfaları test edildi, kullanıcı dashboard'a erişebildi
- Auth akışı çalışıyor: signup → e-posta doğrulama → login → /dashboard

### 26 Nisan 2026 — İlk seans
- Boş klasörden çalışan Next.js'e kadar geldik
- Next.js 16 + Tailwind v4 ile başladık ama 14 + v3'e geri döndük (doğru karar)
- create-next-app'in "boş olmayan klasör"e yüklenmemesi sorunu CLAUDE.md'yi /tmp'ye taşıyarak çözüldü
- İlk git commit alındı
