const CACHE_NAME = "NotesApp-v2";
const URLS_TO_CACHE = ["/", "/index.html"];

// Instalación: cachear archivos básicos
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener("activate", (event) => {
  console.log("[SW] Activado");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Network-first para navegación: siempre intenta traer el index.html más
// reciente (para que tras un deploy apunte a los JS/CSS nuevos) y solo usa
// la copia en caché si no hay conexión.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match("/index.html")) // fallback offline
    );
  }
});
