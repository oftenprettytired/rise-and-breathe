const CACHE_NAME = "rise-breathe-cache-v5";

const PRECACHE_URLS = [
  "index.html",
  "style.css",
  "quotes.js",
  "app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-512-maskable.png",
  "icons/apple-touch-icon.png",
  "audio/voice/breathe-in.m4a",
  "audio/voice/hold.m4a",
  "audio/voice/breathe-out.m4a",
  "audio/voice/breathe-in-nose.m4a",
  "audio/voice/breathe-out-mouth.m4a",
  "audio/voice/inhale-left.m4a",
  "audio/voice/exhale-right.m4a",
  "audio/voice/inhale-right.m4a",
  "audio/voice/exhale-left.m4a",
  "audio/voice/breathe-in-belly.m4a",
  "audio/voice/breathe-out-belly.m4a",
  "audio/voice/lets-begin.m4a",
  "audio/voice/well-done.m4a",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) => fetch(url, { cache: "reload" }).then((response) => cache.put(url, response)))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
