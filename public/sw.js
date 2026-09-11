// Service worker minim — doar cât e nevoie pentru instalabilitate PWA.
// Nu facem cache agresiv ca să evităm versiuni vechi blocate pe telefoane.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {
  // pass-through — lăsăm rețeaua să răspundă normal
})
