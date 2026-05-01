import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeIngredients } from '@/lib/ai/gemini'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedMimeType = (typeof ALLOWED_TYPES)[number]

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  // 2. Parse multipart form data
  let file: File
  try {
    const formData = await request.formData()
    const raw = formData.get('image')

    if (!(raw instanceof File)) {
      return NextResponse.json(
        { error: 'image alanı gerekli ve bir dosya olmalı.' },
        { status: 400 }
      )
    }
    file = raw
  } catch {
    return NextResponse.json({ error: 'Geçersiz form verisi.' }, { status: 400 })
  }

  // 3. Validate type and size
  if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    return NextResponse.json(
      { error: 'Sadece JPEG, PNG veya WebP dosyaları kabul edilir.' },
      { status: 415 }
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'Dosya boyutu 10 MB sınırını aşıyor.' },
      { status: 413 }
    )
  }

  // 4. Convert to base64 and call Gemini
  try {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    const { ingredients } = await analyzeIngredients(
      base64,
      file.type as AllowedMimeType
    )

    return NextResponse.json({ ingredients })
  } catch (err) {
    console.error('[/api/vision] Görüntü analiz hatası:', err)
    return NextResponse.json(
      { error: 'Fotoğraf analiz edilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
