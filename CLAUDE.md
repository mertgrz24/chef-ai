# CLAUDE.md — Chef-AI

> Bu dosya, Claude Code'un her oturum başında otomatik olarak okuduğu proje "anayasası"dır.
> Kısa tut, spesifik tut, çalışan komutlar ver. Bilgi mantıksal olarak değişirse bu dosyayı güncelle.

---

## 1. Project Overview (WHAT & WHY)

**Chef-AI**, kullanıcının buzdolabındaki malzemelerin fotoğrafını çekerek elindeki içeriklere göre kişiselleştirilmiş tarifler üreten ve gıda israfını azaltan, AI destekli bir kişisel mutfak asistanıdır.

- **Hedef Kullanıcı:** Yalnız yaşayan profesyoneller, ev hanımları/beyleri, öğrenciler.
- **Temel Değer Önerisi:** "Bugün ne pişirsem?" karar yorgunluğunu ortadan kaldırmak ve buzdolabında unutulan malzemeleri değerlendirmek.
- **Gelir Modeli:** Freemium (Ücretsiz manuel giriş + günlük 3 tarif / Premium $9.99/ay sınırsız).

**Not:** Bu proje bir mühendislik yarışı değil, bir **deneyim** projesidir. Kod kalitesi önemli ama UX premium hissi her zaman öncelikli.

---

## 2. Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Components varsayılan)
- **Language:** TypeScript (strict mode, `any` yasak)
- **Styling:** Tailwind CSS — özel CSS dosyası açma, utility-first kal
- **Animations:** Framer Motion — geçişler ve micro-interaction'lar için
- **Backend & Auth:** Supabase (Postgres + Auth + Storage)
- **AI — Görüntü:** Gemini API (`gemini-1.5-pro` veya güncel vision modeli) — buzdolabı fotoğrafından malzeme tanıma
- **AI — Tarif/İçerik:** Claude API (`claude-sonnet-4` veya güncel model) — yaratıcı tarif üretimi ve metin
- **Deployment:** Vercel
- **Package Manager:** `npm` (yarn/pnpm karıştırma)

---

## 3. Directory Structure

```
chef-ai/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Landing page, public sayfalar
│   ├── (app)/              # Login sonrası asıl uygulama (kiler, tarifler)
│   ├── api/                # API routes
│   │   ├── recipes/        # Claude — tarif üretme
│   │   ├── vision/         # Gemini — fotoğraf analizi
│   │   └── pantry/         # Supabase — malzeme CRUD
│   └── layout.tsx
├── components/
│   ├── ui/                 # Button, Card, Input gibi tekrar kullanılabilir primitive'ler
│   ├── marketing/          # Landing page'e özel bölümler
│   └── pantry/             # Kiler/tarif domain bileşenleri
├── lib/
│   ├── supabase/           # client.ts, server.ts (browser vs server clients ayrı)
│   ├── ai/                 # claude.ts, gemini.ts — API wrapper'ları
│   └── utils.ts            # cn(), formatters, vb.
├── types/                  # Domain tipleri (Ingredient, Recipe, User, vb.)
└── public/
```

**Kural:** Yeni dosya eklerken önce mevcut yapıyı oku, pattern'i izle. Yeni bir top-level klasör açmadan önce dur ve sor.

---

## 4. Code Style

- **Imports:** ES modules, named exports tercih et. Default export sadece Next.js page/layout dosyalarında.
- **TypeScript:** Strict mode. `any` kullanma — bilmiyorsan `unknown` + narrowing yap.
- **Components:** Server Component varsayılan. `"use client"` sadece state/event/effect gerektiğinde.
- **Styling:** Tailwind utility-first. Class birleştirme için `cn()` helper'ı (clsx + tailwind-merge).
- **Naming:** Component dosyaları `kebab-case.tsx`, component isimleri `PascalCase`.
- **Animations:** Framer Motion ile yapılan animasyonlar 200-400ms aralığında, easing `ease-out`. Spammeyen, premium hissi veren geçişler.
- **Dark theme** ana tema. Light theme şimdilik scope dışı.

---

## 5. Commands

```bash
npm run dev        # http://localhost:3000 — geliştirme sunucusu
npm run build      # Üretim build'i — deploy öncesi mutlaka çalıştır
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

**Verification rule:** Bir feature'ı "tamam" demeden önce sırayla `npm run lint && npm run typecheck && npm run build` geçtiğinden emin ol. Hatalı build commit etme.

---

## 6. Environment Variables

`.env.local` dosyası gerekli. **ASLA commit etme.** `.env.example` dosyasını güncel tut.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # sadece server-side
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
```

---

## 7. Implementation Roadmap (Phase-Gated)

Her faz **bittikten sonra** dur, kullanıcıya özet ver, onay al, sonra bir sonrakine geç. Aşamaları atlama.

- **Phase 1 — Landing Page:** Folder structure + `layout.tsx` + `page.tsx`. Modern, koyu tema, Framer Motion ile akıcı geçişler. (Hafta 1)
- **Phase 2 — Auth & Pantry UI:** Supabase auth kurulumu, malzeme ekleme/listeleme arayüzü. (Hafta 2)
- **Phase 3 — Recipe Engine:** Claude API entegrasyonu, `/api/recipes` endpoint'i, tarif üretme akışı. (Hafta 3)
- **Phase 4 — Visual Pantry:** Gemini vision entegrasyonu, fotoğraf yükleme + malzeme çıkarma. (Hafta 4)
- **Phase 5 — Polish:** Framer Motion ile micro-interaction'lar, premium hissin tamamlanması. (Hafta 5)
- **Phase 6 — Waste Alert & Beta:** Son kullanma tarihi takibi, bildirimler, beta test. (Hafta 6)
- **Phase 7 — Launch:** Vercel deploy, lansman. (Hafta 7)

**Şu anda:** Phase 1'deyim. Diğer fazlara dair kod yazma.

---

## 8. Important Rules & Gotchas

- **Asla** `.env.local`, `node_modules/`, `.next/` commit etme.
- **Asla** Supabase service role key'ini client tarafında kullanma — sadece API route içinde.
- **AI API çağrıları her zaman server-side** (`app/api/...` içinde). API key'ler client'a sızmamalı.
- **Rate limiting:** Ücretsiz kullanıcı için günlük 3 tarif limiti uygulama mantığında zorla — sadece UI'da gizleme.
- **Hata yönetimi:** AI API'leri başarısız olabilir. Her çağrıyı try/catch ile sar, kullanıcıya anlamlı bir mesaj döndür.
- **Supabase Row Level Security (RLS)** her tabloda zorunlu. Kullanıcı sadece kendi verisini görebilmeli.
- **Görseller:** Buzdolabı fotoğrafları Supabase Storage'da. Local filesystem'e kaydetme.

---

## 9. How to Verify Your Work

Claude Code, bir görevi tamamladığını söylemeden önce:

1. `npm run typecheck` — sıfır hata
2. `npm run lint` — sıfır error (warning kabul edilebilir, açıkla)
3. `npm run dev` — sayfa render oluyor mu, console error yok mu
4. Eğer UI değişikliğiyse: ne eklendiğini, hangi route'tan görülebileceğini açıkça söyle

**Tahmin etme** — emin değilsen `Read` ile dosyayı oku, `Bash` ile komutu çalıştır, kanıt topla.

---

## 10. Working Style with Me

- **Türkçe konuş.** Kod yorumları İngilizce, ama benimle konuşma Türkçe.
- **Plan modunda başla.** Karmaşık görevlerde önce planı çıkar, ben "tamam" dedikten sonra koda geç.
- **Bir seferde bir şey.** Üç feature'ı aynı anda eklemeye çalışma — fazları takip et.
- **Soru sor.** Belirsiz bir gereksinim varsa AskUserQuestion ile sor, varsayım yapma.
- **Karar verirken sebebini söyle.** "X kütüphanesini kullandım çünkü Y" — gerekçesiz seçimler yapma.

---

_Bu dosya proje büyüdükçe güncellenecektir. Yeni kural eklerken önce eski kuralla çelişip çelişmediğini kontrol et._
