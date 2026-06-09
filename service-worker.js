// Service Worker — cache-first para assets, network-first para datos
const CACHE_NAME = 'predicciones-mundial-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/css/themes.css',
  '/src/css/base.css',
  '/src/css/components.css',
  '/src/css/layout.css',
  '/src/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Las llamadas a Supabase siempre van por red (sin cache)
  if (url.hostname.endsWith('.supabase.co')) return;

  // Assets estáticos: cache-first
  if (event.request.method === 'GET' && (url.origin === self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((res) => {
          if (res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        }).catch(() => cached)
      )
    );
  }
});

// Recordatorios push (T-30 antes del partido)
self.addEventListener('push', (event) => {
  let data = { title: 'Predicciones Mundial', body: '¡Tenés un partido por predecir!' };
  try { data = event.data.json(); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: data.url || '/',
      vibrate: [100, 50, 100]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data || '/'));
});
