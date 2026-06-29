const CACHE_VERSION = "v1";
const STATIC_CACHE = `traveldiary-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `traveldiary-images-${CACHE_VERSION}`;
const PAGE_CACHE = `traveldiary-pages-${CACHE_VERSION}`;
const ALL_CACHES = [STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE];

const OFFLINE_URL = "/offline";

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !ALL_CACHES.includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s)
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Skip auth callbacks and API routes — always network-only
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/")
  )
    return;

  // ── Next.js static assets: Cache First (build hashes make them immutable) ──
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  // ── Cloudinary images: Cache First ─────────────────────────────────────
  if (url.hostname === "res.cloudinary.com") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((res) => {
              caches
                .open(IMAGE_CACHE)
                .then((c) => c.put(request, res.clone()));
              return res;
            })
            .catch(() => new Response("", { status: 408 }))
      )
    );
    return;
  }

  // ── Navigation (HTML pages): Network First, fallback offline page ───────
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(PAGE_CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }
});
