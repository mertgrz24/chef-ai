'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface PantryItem {
  id: string
  name: string
  expiry_date: string
  quantity: string | null
  created_at: string
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function expiryStyle(days: number) {
  if (days < 0)  return { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-600',      label: 'Süresi doldu' }
  if (days === 0) return { dot: 'bg-red-500',   badge: 'bg-red-50 text-red-600',      label: 'Bugün son!' }
  if (days <= 3)  return { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-600', label: `${days} gün kaldı` }
  if (days <= 7)  return { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-600',  label: `${days} gün kaldı` }
  return          { dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700',  label: `${days} gün kaldı` }
}

export function PantryClient({ initialItems }: { initialItems: PantryItem[] }) {
  const [items, setItems] = useState<PantryItem[]>(initialItems)
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const urgentCount = items.filter((i) => getDaysUntil(i.expiry_date) <= 3).length

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !expiryDate) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), expiry_date: expiryDate, quantity: quantity.trim() || undefined }),
      })
      const data = await res.json() as { item?: PantryItem; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Eklenemedi.')
        return
      }

      if (data.item) {
        setItems((prev) =>
          [...prev, data.item!].sort(
            (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
          )
        )
      }
      setName('')
      setExpiryDate('')
      setQuantity('')
      setFormOpen(false)
    } catch {
      setError('Sunucuya ulaşılamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await fetch(`/api/pantry/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {
      // silently fail — item stays in list
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kilerim</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {items.length} malzeme
            {urgentCount > 0 && (
              <span className="ml-2 font-medium text-orange-600">
                · {urgentCount} tanesi yakında bitiyor ⚠️
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-85 active:scale-[0.98]"
          style={{ backgroundColor: '#ffa51f' }}
        >
          {formOpen ? 'İptal' : '+ Malzeme Ekle'}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {formOpen && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onSubmit={handleAdd}
            className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Yeni Malzeme</h2>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Malzeme adı *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="domates, süt, yumurta…"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Son kullanma tarihi *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Miktar (opsiyonel)
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1 adet, 500g…"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !name.trim() || !expiryDate}
              className="mt-4 w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-85 disabled:opacity-50"
              style={{ backgroundColor: '#ffa51f' }}
            >
              {submitting ? 'Ekleniyor…' : 'Kilere Ekle'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
          <span className="mb-3 text-4xl">🥦</span>
          <p className="text-sm font-medium text-gray-500">Kiler boş</p>
          <p className="mt-1 text-xs text-gray-400">Malzeme eklemek için yukarıdaki butona tıkla.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const days = getDaysUntil(item.expiry_date)
              const style = expiryStyle(days)

              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
                >
                  {/* Expiry dot */}
                  <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${style.dot}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                    {item.quantity && (
                      <p className="text-xs text-gray-400">{item.quantity}</p>
                    )}
                  </div>

                  {/* Expiry badge */}
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
                    {style.label}
                  </span>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    aria-label="Malzemeyi sil"
                    className="shrink-0 rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-400 disabled:opacity-40"
                  >
                    {deletingId === item.id ? '…' : '✕'}
                  </button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
