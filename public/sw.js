const CACHE = 'chef-ai-v1'
const STATIC_PATHS = ['/_next/static/']

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip API and Next.js data routes — always network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/data/')) return

  // Cache-first for static assets (JS, CSS, fonts)
  if (STATIC_PATHS.some((p) => url.pathname.startsWith(p))) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const clone = res.clone()
            caches.open(CACHE).then((cache) => cache.put(request, clone))
            return res
          })
      )
    )
    return
  }

  // Network-first for pages — fall back to cache if offline
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(request, clone))
        return res
      })
      .catch(() => caches.match(request))
  )
})
