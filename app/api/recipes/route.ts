import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// MOCK: Gerçek API'ye geçmek için aşağıdaki import'u uncomment et,
// mockGenerateRecipe çağrısını generateRecipe ile değiştir ve MOCK bloğunu sil.
// import { generateRecipe } from '@/lib/ai/claude'

// ─── MOCK BAŞLANGICI ──────────────────────────────────────────────────────────
function buildMockRecipe(ingredients: string[]): string {
  const list = ingredients.join(', ')
  return `🍽️ ${ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1)} Sote

📝 Malzemeler
• ${ingredients.map((i) => `${i} (yeterince)`).join('\n• ')}
• Tuz, karabiber
• 2 yemek kaşığı zeytinyağı

👨‍🍳 Hazırlık Adımları
1. ${ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1)}'ı küçük parçalara kesin.
2. Tavayı orta ateşte ısıtın, zeytinyağını ekleyin.
3. ${ingredients.length > 1 ? ingredients[1] : ingredients[0]}'ı 2-3 dakika kavurun.
4. Kalan malzemeleri (${list}) ekleyip 5 dakika daha pişirin.
5. Tuz ve karabiber ile tatlandırın.
6. Sıcak servis yapın. Afiyet olsun! 🎉

⏱️ Tahmini Süre: 20 dakika
💪 Zorluk: Kolay`
}

async function mockGenerateRecipe(ingredients: string[]): Promise<{ text: string }> {
  // Yapay gecikme: gerçek API çağrısını simüle eder (2-3 sn)
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000))
  return { text: buildMockRecipe(ingredients) }
}
// ─── MOCK SONU ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Parse body
  let ingredients: string[]
  try {
    const body = await request.json() as { ingredients?: unknown }
    if (
      !Array.isArray(body.ingredients) ||
      body.ingredients.length === 0 ||
      body.ingredients.some((i) => typeof i !== 'string')
    ) {
      return NextResponse.json(
        { error: 'ingredients alanı dolu bir string dizisi olmalı.' },
        { status: 400 }
      )
    }
    ingredients = body.ingredients as string[]
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  // 2. Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  // TODO: Rate limiting — günlük 3 tarif (ücretsiz) kontrolü
  // Supabase'de recipe_logs tablosu kurulunca buraya eklenecek.

  // 3. Generate recipe
  // MOCK: mockGenerateRecipe → generateRecipe olarak değiştir (Claude API geçişi)
  try {
    const result = await mockGenerateRecipe(ingredients)
    return NextResponse.json({ recipe: result.text })
  } catch (err) {
    console.error('[/api/recipes] Tarif üretme hatası:', err)
    return NextResponse.json(
      { error: 'Tarif üretilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
