'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Profile } from '@/types/profile'

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:opacity-60'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'
const sectionCls = 'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'
const headingCls = 'mb-5 flex items-center gap-2 text-base font-semibold text-gray-800'

const DIET_OPTIONS = [
  { label: 'Normal', value: 'omnivore' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Vejetaryen', value: 'vegetarian' },
  { label: 'Keto', value: 'keto' },
  { label: 'Glutensiz', value: 'gluten_free' },
  { label: 'Diğer', value: 'other' },
]

const PRESET_DIET_VALUES = new Set(['omnivore', 'vegan', 'vegetarian', 'keto', 'gluten_free'])

type FormState = {
  full_name: string
  daily_calorie_goal: string
  protein_goal_g: string
  carbs_goal_g: string
  fat_goal_g: string
  water_goal_l: string
  daily_steps_goal: string
  current_weight_kg: string
  target_weight_kg: string
  diet_type_preset: string
  diet_type_custom: string
}

const EMPTY_FORM: FormState = {
  full_name: '',
  daily_calorie_goal: '',
  protein_goal_g: '',
  carbs_goal_g: '',
  fat_goal_g: '',
  water_goal_l: '',
  daily_steps_goal: '',
  current_weight_kg: '',
  target_weight_kg: '',
  diet_type_preset: '',
  diet_type_custom: '',
}

function profileToForm(profile: Profile): FormState {
  const dt = profile.diet_type ?? ''
  return {
    full_name: profile.full_name ?? '',
    daily_calorie_goal: profile.daily_calorie_goal?.toString() ?? '',
    protein_goal_g: profile.protein_goal_g?.toString() ?? '',
    carbs_goal_g: profile.carbs_goal_g?.toString() ?? '',
    fat_goal_g: profile.fat_goal_g?.toString() ?? '',
    water_goal_l: profile.water_goal_l?.toString() ?? '',
    daily_steps_goal: profile.daily_steps_goal?.toString() ?? '',
    current_weight_kg: profile.current_weight_kg?.toString() ?? '',
    target_weight_kg: profile.target_weight_kg?.toString() ?? '',
    diet_type_preset: dt === '' ? '' : PRESET_DIET_VALUES.has(dt) ? dt : 'other',
    diet_type_custom: PRESET_DIET_VALUES.has(dt) ? '' : dt,
  }
}

function parseNum(val: string): number | null {
  if (val.trim() === '') return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

// Extracted to avoid component-inside-render anti-pattern
function NumberInput({
  value,
  onChange,
  suffix,
  step,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  suffix: string
  step?: string
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        step={step ?? '1'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        disabled={disabled}
        className={`${inputCls} pr-16`}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
        {suffix}
      </span>
    </div>
  )
}

export default function ProfilePage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/profile')
        const data = (await res.json()) as { profile?: Profile; error?: string }
        if (!res.ok) {
          setFetchError(data.error ?? 'Profil yüklenemedi.')
        } else if (data.profile) {
          setForm(profileToForm(data.profile))
        }
      } catch {
        setFetchError('Sunucuya ulaşılamadı.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const diet_type =
      form.diet_type_preset === 'other'
        ? form.diet_type_custom.trim() || null
        : form.diet_type_preset || null

    const payload = {
      full_name: form.full_name.trim() || null,
      daily_calorie_goal: parseNum(form.daily_calorie_goal),
      protein_goal_g: parseNum(form.protein_goal_g),
      carbs_goal_g: parseNum(form.carbs_goal_g),
      fat_goal_g: parseNum(form.fat_goal_g),
      water_goal_l: parseNum(form.water_goal_l),
      daily_steps_goal: parseNum(form.daily_steps_goal),
      current_weight_kg: parseNum(form.current_weight_kg),
      target_weight_kg: parseNum(form.target_weight_kg),
      diet_type,
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { profile?: Profile; error?: string }

      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? 'Kaydetme başarısız.' })
      } else {
        setMessage({ ok: true, text: 'Hedefler kaydedildi ✓' })
        if (data.profile) setForm(profileToForm(data.profile))
      }
    } catch {
      setMessage({ ok: false, text: 'Sunucuya ulaşılamadı. Lütfen tekrar deneyin.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Profil</h1>
        <p className="mb-8 text-sm text-gray-500">Diyet hedeflerin ve hesap ayarların.</p>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-400">Yükleniyor…</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Profil</h1>
        <p className="mb-8 text-sm text-gray-500">Diyet hedeflerin ve hesap ayarların.</p>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {fetchError}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Profil</h1>
      <p className="mb-8 text-sm text-gray-500">Diyet hedeflerin ve hesap ayarların.</p>

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
        {/* Section 1 — Beslenme Hedefleri */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={sectionCls}
        >
          <h2 className={headingCls}>
            <span>🎯</span> Beslenme Hedefleri
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Günlük Kalori</label>
              <NumberInput
                value={form.daily_calorie_goal}
                onChange={(v) => set('daily_calorie_goal', v)}
                suffix="kcal"
                disabled={saving}
              />
            </div>
            <div>
              <label className={labelCls}>Protein</label>
              <NumberInput
                value={form.protein_goal_g}
                onChange={(v) => set('protein_goal_g', v)}
                suffix="g"
                disabled={saving}
              />
            </div>
            <div>
              <label className={labelCls}>Karbonhidrat</label>
              <NumberInput
                value={form.carbs_goal_g}
                onChange={(v) => set('carbs_goal_g', v)}
                suffix="g"
                disabled={saving}
              />
            </div>
            <div>
              <label className={labelCls}>Yağ</label>
              <NumberInput
                value={form.fat_goal_g}
                onChange={(v) => set('fat_goal_g', v)}
                suffix="g"
                disabled={saving}
              />
            </div>
          </div>
        </motion.div>

        {/* Section 2 — Aktivite */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
          className={sectionCls}
        >
          <h2 className={headingCls}>
            <span>💧</span> Aktivite
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Günlük Su</label>
              <NumberInput
                value={form.water_goal_l}
                onChange={(v) => set('water_goal_l', v)}
                suffix="litre"
                step="0.5"
                disabled={saving}
              />
            </div>
            <div>
              <label className={labelCls}>Günlük Adım</label>
              <NumberInput
                value={form.daily_steps_goal}
                onChange={(v) => set('daily_steps_goal', v)}
                suffix="adım"
                disabled={saving}
              />
            </div>
          </div>
        </motion.div>

        {/* Section 3 — Kilo Takibi */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.1 }}
          className={sectionCls}
        >
          <h2 className={headingCls}>
            <span>⚖️</span> Kilo Takibi
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Mevcut Kilo</label>
              <NumberInput
                value={form.current_weight_kg}
                onChange={(v) => set('current_weight_kg', v)}
                suffix="kg"
                step="0.1"
                disabled={saving}
              />
            </div>
            <div>
              <label className={labelCls}>Hedef Kilo</label>
              <NumberInput
                value={form.target_weight_kg}
                onChange={(v) => set('target_weight_kg', v)}
                suffix="kg"
                step="0.1"
                disabled={saving}
              />
            </div>
          </div>
        </motion.div>

        {/* Section 4 — Diyet Tercihi */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.15 }}
          className={sectionCls}
        >
          <h2 className={headingCls}>
            <span>🥗</span> Diyet Tercihi
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Görünen Ad</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Adınız"
                disabled={saving}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Diyet Tipi</label>
              <select
                value={form.diet_type_preset}
                onChange={(e) => set('diet_type_preset', e.target.value)}
                disabled={saving}
                className={inputCls}
              >
                <option value="">Seçiniz</option>
                {DIET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {form.diet_type_preset === 'other' && (
              <div>
                <label className={labelCls}>Diyet Tipinizi Yazın</label>
                <input
                  type="text"
                  value={form.diet_type_custom}
                  onChange={(e) => set('diet_type_custom', e.target.value)}
                  placeholder="ör. Akdeniz diyeti"
                  disabled={saving}
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Geri bildirim mesajı */}
        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              message.ok
                ? 'border-green-100 bg-green-50 text-green-700'
                : 'border-red-100 bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Kaydet butonu */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: '#ffa51f' }}
        >
          {saving ? 'Kaydediliyor…' : 'Hedefleri Kaydet'}
        </button>
      </form>
    </div>
  )
}
