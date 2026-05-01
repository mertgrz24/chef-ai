import { GoogleGenerativeAI } from '@google/generative-ai'

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
