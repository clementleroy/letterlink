const CACHE_NAME = 'letterlink-app-v2'
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/default-project.json',
  '/Pacifico-Regular.ttf',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/')),
    )
    return
  }

  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    ['style', 'script', 'font', 'image'].includes(request.destination)

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkResponse = fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
            }

            return response
          })
          .catch(() => cachedResponse)

        return cachedResponse ?? networkResponse
      }),
    )
    return
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  )
})
