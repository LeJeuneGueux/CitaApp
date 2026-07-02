// =====================================================
// CITA'APP — SERVICE WORKER (PWA)
// Gère le cache offline et les ressources statiques
// =====================================================
const CACHE = 'citaapp-v1';
const STATIC = ['/', '/index.html', '/manifest.json', '/sw.js'];

// Installation : met en cache les fichiers statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Activation : supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch : réseau d'abord pour les API, cache pour le reste
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Toujours réseau pour Supabase, Stripe, CDN
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('stripe.com') ||
    url.hostname.includes('jsdelivr.net')
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // Cache d'abord pour les fichiers statiques
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
