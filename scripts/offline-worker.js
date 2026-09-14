const CACHE = "labukas-__BUILD_ID__";
const FILES = __PRECACHE_FILES__;
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(FILES.map((url) => new Request(url, { cache: "reload" }))),
      )
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("labukas-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  )
    return;
  if (request.mode === "navigate") {
    // Check for a deployment on every visit; the bundled page is the offline fallback.
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(async (response) => {
          if (response.ok) return response;
          return (await caches.open(CACHE))
            .match("/index.html")
            .then((cached) => cached || response);
        })
        .catch(async () => (await caches.open(CACHE)).match("/index.html")),
    );
    return;
  }
  if (!FILES.includes(new URL(request.url).pathname)) return;
  // These are public build assets; Origin/Vary must not prevent offline lookup.
  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(request, { ignoreVary: true }))
      .then((cached) => cached || fetch(request)),
  );
});
