import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Cached system prompt — asks for JSON output, never changes across requests
const SYSTEM_PROMPT = `Sen Chef-AI'nin tarif asistanısın. Kullanıcının elindeki malzemelere göre yaratıcı, lezzetli ve yapılabilir tarifler üretirsin.

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

export interface ProfileContext {
  daily_calorie_goal?: number | null
  protein_goal_g?: number | null
  carbs_goal_g?: number | null
  fat_goal_g?: number | null
  water_goal_l?: number | null
  diet_type?: string | null
}

function buildDietBlock(profile: ProfileContext): string {
  const parts: string[] = []
  if (profile.daily_calorie_goal) parts.push(`günlük kalori ${profile.daily_calorie_goal} kcal`)
  if (profile.protein_goal_g) parts.push(`protein ${profile.protein_goal_g}g`)
  if (profile.carbs_goal_g) parts.push(`karbonhidrat ${profile.carbs_goal_g}g`)
  if (profile.fat_goal_g) parts.push(`yağ ${profile.fat_goal_g}g`)
  if (profile.water_goal_l) parts.push(`su ${profile.water_goal_l} litre`)
  if (profile.diet_type) parts.push(`diyet tipi: ${profile.diet_type}`)
  if (parts.length === 0) return ''
  return `\nDiyet hedeflerim: ${parts.join(', ')}. Bu hedeflere uygun tarif öner.`
}

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

export async function generateRecipe(
  ingredients: string[],
  profile?: ProfileContext
): Promise<RecipeResult> {
  const dietBlock = profile ? buildDietBlock(profile) : ''
  const userMessage = `Elimde şu malzemeler var: ${ingredients.join(', ')}.${dietBlock}\nBana bir tarif önerir misin?`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Cache the system prompt — it never changes across requests
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude yanıt vermedi.')
  }

  let text: string
  let macros: RecipeMacros | null = null

  try {
    const parsed = parseRecipeJson(textBlock.text)
    text = parsed.text
    macros = parsed.macros
  } catch {
    // Graceful fallback: display raw response if JSON parsing fails
    text = textBlock.text
  }

  return {
    text,
    macros,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}
