const CACHE = 'usa2026-202608262244';

// Senza questi l'app non esiste: se falliscono, fallisce l'installazione.
const ESSENZIALI = ['./', './index.html'];
// Le icone sono un di piu': se mancano o hanno un altro nome, si tira dritto.
const FACOLTATIVI = ['./icona-180.png', './icona-512.png', './icona180.png', './icona512.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ESSENZIALI);
    await Promise.all(FACOLTATIVI.map(f => c.add(f).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k =>
    Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))
  ).then(() => self.clients.claim()));
});

// Rete se c'e', copia in cache; senza rete si serve la copia salvata.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
