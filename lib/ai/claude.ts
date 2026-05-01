import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Sen Chef-AI'nin tarif asistanısın. Kullanıcının elindeki malzemelere göre yaratıcı, lezzetli ve yapılabilir tarifler üretirsin.

Kurallar:
- Her zaman Türkçe yanıt ver.
- Tarifi net bölümler halinde yaz: Tarif Adı, Malzemeler (miktarlarıyla), Hazırlık Adımları, Tahmini Süre, Zorluk Seviyesi.
- Sadece kullanıcının verdiği malzemeleri kullan; zorunlu olmayan ekstra malzeme öneri olarak belirt.
- Adımlar numaralı ve kısa olsun.
- Samimi, teşvik edici bir ton kullan.`

export interface RecipeResult {
  text: string
  inputTokens: number
  outputTokens: number
}

export async function generateRecipe(ingredients: string[]): Promise<RecipeResult> {
  const userMessage = `Elimde şu malzemeler var: ${ingredients.join(', ')}. Bana bir tarif önerir misin?`

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

  return {
    text: textBlock.text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  }
}
