const CACHE = "ks-agent-v3";
const SHELL = ["/", "/manifest.json", "/logo.svg"];
const STATIC_EXTS = [".js", ".css", ".woff", ".woff2", ".ttf", ".svg", ".png", ".jpg", ".ico", ".webp"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  const isStatic = STATIC_EXTS.some(ext => url.pathname.endsWith(ext));

  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
  } else {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((r) => {
            if (r) return r;
            if (e.request.headers.get("Accept")?.includes("text/html")) return caches.match("/");
            return new Response("offline", { status: 503 });
          })
        )
    );
  }
});

self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
  if (e.data?.type === "CACHE_CONVERSATION" && e.data.conversation) {
    openIDB().then((db) => {
      const tx = db.transaction("cached_conversations", "readwrite");
      tx.objectStore("cached_conversations").put(e.data.conversation);
    }).catch(() => {});
  }
});

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("ks-agent-offline", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("cached_conversations")) {
        db.createObjectStore("cached_conversations", { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

// ── إشعارات Push ────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "يمن شات", body: "لديك إشعار جديد", icon: "/logo.svg", badge: "/logo.svg", url: "/" };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/logo.svg",
      badge: data.badge || "/logo.svg",
      vibrate: [200, 100, 200],
      tag: "ks-notification",
      renotify: true,
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const c = clients.find((c) => c.focus);
      if (c) return c.focus();
      return self.clients.openWindow(url);
    })
  );
});
