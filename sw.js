// Root-scoped service worker for the optional "Preload all audio" feature.
// When enabled from the menu, it downloads every shared music track and sound
// effect into the Cache Storage and serves them cache-first, so playback during
// the game is instant instead of streaming on demand.
//
// Scope is the repo root ("/"), so it can intercept the shared /mus/ and
// /audios/ folders that every chapter's audio is rerouted to.

const CACHE = "dr-audio-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Only shared audio is handled here; every other request passes straight through.
function isSharedAudio(url) {
  return /\/(mus|audios)\/[^/?#]+\.(ogg|wav|mp3)(\?.*)?$/i.test(url);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !isSharedAudio(req.url)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      const resp = await fetch(req);
      try {
        if (resp && (resp.ok || resp.type === "opaque")) {
          cache.put(req, resp.clone());
        }
      } catch (_) {}
      return resp;
    })()
  );
});

// Bulk preload, triggered by a postMessage from the page.
// The page supplies the absolute URL list so caching matches what the game asks for.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "CLEAR_AUDIO_CACHE") {
    event.waitUntil(caches.delete(CACHE));
    return;
  }
  if (data.type !== "PRECACHE" || !Array.isArray(data.urls)) return;

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const urls = data.urls;
      const total = urls.length;
      let done = 0;
      let next = 0;
      const CONCURRENCY = 6;

      async function report() {
        const clients = await self.clients.matchAll();
        clients.forEach((c) =>
          c.postMessage({ type: "PRECACHE_PROGRESS", done, total })
        );
      }

      async function worker() {
        while (next < urls.length) {
          const url = urls[next++];
          try {
            const existing = await cache.match(url);
            if (!existing) {
              const r = await fetch(url, { cache: "force-cache" });
              if (r && (r.ok || r.type === "opaque")) await cache.put(url, r.clone());
            }
          } catch (_) {}
          done++;
          if (done % 10 === 0 || done === total) await report();
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker)
      );

      const clients = await self.clients.matchAll();
      clients.forEach((c) => c.postMessage({ type: "PRECACHE_DONE", total }));
    })()
  );
});
