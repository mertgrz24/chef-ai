import { GoogleGenerativeAI } from '@google/generative-ai'
import type { MealItem, MealPlanDay } from '@/types/meal-plan'

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const VISION_PROMPT = `Bu fotoğrafta gördüğün yiyecek ve içecek malzemelerini tanımla.

Kurallar:
- Sadece yemekte kullanılabilecek malzemeleri listele (sebze, meyve, et, süt ürünleri, baharat vb.)
- Ambalajlı ürünleri de tanı (süt kutusu, yoğurt kabı vb.)
- Türkçe isimlerle yaz, küçük harfle
- Yanıtı SADECE virgülle ayrılmış malzeme listesi olarak ver, başka hiçbir şey yazma
- Eğer fotoğrafta yiyecek göremiyorsan boş yanıt ver

Örnek yanıt: tavuk göğsü, soğan, domates, sarımsak, yeşil biber, yoğurt`

export interface VisionResult {
  ingredients: string[]
}

// ─── Recipe generation ────────────────────────────────────────────────────────

export interface RecipeMacros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface RecipeResult {
  text: string
  macros: RecipeMacros | null
  inputTokens: number
  outputTokens: number
}

const RECIPE_SYSTEM_PROMPT = `Sen Chef-AI'nin tarif asistanısın. Kullanıcının elindeki malzemelere göre yaratıcı, lezzetli ve yapılabilir tarifler üretirsin.

Kurallar:
- Her zaman Türkçe yanıt ver.
- SADECE geçerli bir JSON nesnesi döndür; markdown, açıklama veya başka metin ekleme.
- Sadece kullanıcının verdiği malzemeleri kullan; ekstra malzeme varsa instructions içinde isteğe bağlı olarak belirt.
- Adımlar numaralı ve kısa olsun; instructions içinde \\n ile ayır.
- Samimi, teşvik edici bir ton kullan.
- macros değerleri tahmini olabilir; makul ve gerçekçi sayılar ver.

Çıktı formatı (sadece bu JSON, başka hiçbir şey):
{
  "name": "Tarif Adı",
  "ingredients": ["malzeme 1 (miktar)", "malzeme 2 (miktar)"],
  "instructions": "1. İlk adım.\\n2. İkinci adım.\\n3. Üçüncü adım.",
  "macros": {
    "calories": 450,
    "protein_g": 32,
    "carbs_g": 28,
    "fat_g": 14
  }
}`

function parseRecipeJson(raw: string): { text: string; macros: RecipeMacros | null } {
  // Strip markdown code fence in case the model wraps the JSON
  let jsonStr = raw.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  const parsed = JSON.parse(jsonStr) as {
    name?: string
    ingredients?: string[]
    instructions?: string
    macros?: Partial<RecipeMacros>
  }

  const lines: string[] = []
  if (parsed.name) lines.push(`🍽️ ${parsed.name}`)
  if (parsed.ingredients?.length) {
    lines.push('\n📝 Malzemeler')
    parsed.ingredients.forEach((i) => lines.push(`• ${i}`))
  }
  if (parsed.instructions) {
    lines.push('\n👨‍🍳 Hazırlık')
    lines.push(parsed.instructions)
  }

  const m = parsed.macros
  const macros: RecipeMacros | null =
    m &&
    typeof m.calories === 'number' &&
    typeof m.protein_g === 'number' &&
    typeof m.carbs_g === 'number' &&
    typeof m.fat_g === 'number'
      ? { calories: m.calories, protein_g: m.protein_g, carbs_g: m.carbs_g, fat_g: m.fat_g }
      : null

  return { text: lines.join('\n'), macros }
}

export async function generateRecipeWithGemini(
  ingredients: string[],
  dietContext?: string
): Promise<RecipeResult> {
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: RECIPE_SYSTEM_PROMPT,
  })

  const userMessage = `Elimde şu malzemeler var: ${ingredients.join(', ')}.${
    dietContext ? `\n${dietContext}` : ''
  }\nBana bir tarif önerir misin?`

  const result = await model.generateContent(userMessage)
  const rawText = result.response.text().trim()

  let text: string
  let macros: RecipeMacros | null = null

  try {
    const parsed = parseRecipeJson(rawText)
    text = parsed.text
    macros = parsed.macros
  } catch {
    // Graceful fallback: display raw response if JSON parsing fails
    text = rawText
  }

  return {
    text,
    macros,
    inputTokens: result.response.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: result.response.usageMetadata?.candidatesTokenCount ?? 0,
  }
}

// ─── Weekly meal plan ─────────────────────────────────────────────────────────

const MEAL_PLAN_SYSTEM_PROMPT = `Sen Chef-AI'nin haftalık yemek planı asistanısın. Kullanıcının diyet hedeflerine uygun, çeşitli ve dengeli bir haftalık plan oluşturursun.

Kurallar:
- Her zaman Türkçe tarif adı ve talimatlar yaz.
- SADECE geçerli bir JSON dizisi döndür; markdown, açıklama veya başka metin ekleme.
- 7 günlük plan üret. day alanları sırasıyla: monday, tuesday, wednesday, thursday, friday, saturday, sunday.
- Her gün sabah (breakfast) ve akşam (dinner) öğünü olsun.
- Çeşitlilik sağla; aynı tarifi iki güne koyma.
- macros değerleri tahmini olabilir; makul ve gerçekçi sayılar ver.

Çıktı formatı (sadece bu JSON dizisi, başka hiçbir şey):
[
  {
    "day": "monday",
    "breakfast": {
      "name": "Tarif Adı",
      "ingredients": ["malzeme 1", "malzeme 2"],
      "instructions": "1. İlk adım.\\n2. İkinci adım.",
      "macros": { "calories": 350, "protein_g": 15, "carbs_g": 45, "fat_g": 10 }
    },
    "dinner": {
      "name": "Tarif Adı",
      "ingredients": ["malzeme 1", "malzeme 2"],
      "instructions": "1. İlk adım.\\n2. İkinci adım.",
      "macros": { "calories": 550, "protein_g": 35, "carbs_g": 40, "fat_g": 18 }
    }
  }
]`

const SINGLE_MEAL_SYSTEM_PROMPT = `Sen Chef-AI'nin yemek asistanısın. Tek bir öğün için özgün tarif önerirsin.

Kurallar:
- Her zaman Türkçe yanıt ver.
- SADECE geçerli bir JSON nesnesi döndür; markdown, açıklama veya başka metin ekleme.
- macros değerleri tahmini olabilir; makul ve gerçekçi sayılar ver.

Çıktı formatı (sadece bu JSON nesnesi, başka hiçbir şey):
{
  "name": "Tarif Adı",
  "ingredients": ["malzeme 1", "malzeme 2"],
  "instructions": "1. İlk adım.\\n2. İkinci adım.",
  "macros": { "calories": 450, "protein_g": 30, "carbs_g": 35, "fat_g": 15 }
}`

function parseMealPlanJson(raw: string): MealPlanDay[] {
  let jsonStr = raw.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }
  const parsed = JSON.parse(jsonStr) as unknown
  if (!Array.isArray(parsed)) throw new Error('Expected JSON array')
  return parsed as MealPlanDay[]
}

function parseMealItemJson(raw: string): MealItem {
  let jsonStr = raw.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }
  return JSON.parse(jsonStr) as MealItem
}

export async function generateWeeklyMealPlan(dietContext?: string): Promise<MealPlanDay[]> {
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: MEAL_PLAN_SYSTEM_PROMPT,
  })

  const userMessage = `Bana 7 günlük haftalık yemek planı oluştur.${
    dietContext ? `\n${dietContext}` : ''
  }`

  console.log('[gemini] generateWeeklyMealPlan başlatılıyor...')
  const result = await model.generateContent(userMessage)
  const rawText = result.response.text().trim()
  console.log('[gemini] generateWeeklyMealPlan ham yanıt (ilk 300 char):', rawText.slice(0, 300))

  try {
    return parseMealPlanJson(rawText)
  } catch (parseErr) {
    console.error('[gemini] generateWeeklyMealPlan JSON parse hatası:', parseErr)
    console.error('[gemini] Ham yanıt (tam):', rawText)
    throw parseErr
  }
}

export async function generateSingleMeal(
  day: string,
  mealType: 'breakfast' | 'dinner',
  dietContext?: string
): Promise<MealItem> {
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: SINGLE_MEAL_SYSTEM_PROMPT,
  })

  const mealLabel = mealType === 'breakfast' ? 'kahvaltı' : 'akşam yemeği'
  const userMessage = `${day} günü için ${mealLabel} tarifi öner.${
    dietContext ? `\n${dietContext}` : ''
  }`

  const result = await model.generateContent(userMessage)
  const rawText = result.response.text().trim()
  return parseMealItemJson(rawText)
}

export async function analyzeIngredients(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<VisionResult> {
  const model = client.getGenerativeModel({ model: 'gemini-2.5-pro' })

  const result = await model.generateContent([
    VISION_PROMPT,
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ])

  const text = result.response.text().trim()

  if (!text) return { ingredients: [] }

  const ingredients = text
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)

  return { ingredients }
}
