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

// Réception d'une notification push (envoyée par le serveur)
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: "Cita'App", body: e.data ? e.data.text() : '' }; }
  const title = data.title || "Cita'App";
  const options = {
    body: data.body || 'Ta citation du jour t\'attend ✨',
    icon: '/assets/logo-192.png',
    badge: '/assets/logo-192.png',
    data: { url: data.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur la notification : ouvre (ou focus) l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});
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
