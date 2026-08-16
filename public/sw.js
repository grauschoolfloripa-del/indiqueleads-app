/* IndiqueLeads — service worker
 *
 * Regras de ouro deste arquivo, porque errar aqui quebra o app inteiro de um
 * jeito difícil de diagnosticar (o usuário fica com uma versão velha presa):
 *
 *  1. NUNCA interceptar nada que não seja GET. POST/PATCH/DELETE passam direto.
 *  2. NUNCA tocar em chamadas do Supabase (API, auth, realtime). Dado de
 *     negócio e sessão não podem vir de cache.
 *  3. Navegação é network-first: o HTML novo sempre ganha do cache. O cache só
 *     existe para o caso de estar sem internet.
 *  4. Só /assets/ (nomes com hash, imutáveis) pode ser cache-first.
 */

const VERSION = "v2"; // subir a cada mudança neste arquivo, para o cache antigo ser descartado
const SHELL = `il-shell-${VERSION}`;
const ASSETS = `il-assets-${VERSION}`;
const MEDIA = `il-media-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/indiqueleads-logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(PRECACHE))
      // Um asset faltando não pode impedir o SW de instalar.
      .catch(() => undefined)
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
            .filter((k) => k.startsWith("il-") && ![SHELL, ASSETS, MEDIA].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Requisições que o service worker não pode encostar. */
function isOffLimits(url) {
  return (
    url.hostname.endsWith("supabase.co") ||
    url.hostname.endsWith("supabase.in") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_serverFn/")
  );
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      const copy = fresh.clone();
      caches.open(SHELL).then((c) => c.put(request, copy));
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    return cached || (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && (fresh.ok || fresh.type === "opaque")) {
    const copy = fresh.clone();
    caches.open(cacheName).then((c) => c.put(request, copy));
  }
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((fresh) => {
      if (fresh && (fresh.ok || fresh.type === "opaque")) {
        const copy = fresh.clone();
        caches.open(cacheName).then((c) => c.put(request, copy));
      }
      return fresh;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isOffLimits(url)) return;

  // Abrir uma tela: sempre tenta a rede antes, para nunca prender versão velha.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Bundles com hash no nome — imutáveis por definição.
  if (url.origin === self.location.origin && url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  // Fontes do Google: o app depende delas para não trocar de tipografia offline.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(request, MEDIA));
    return;
  }

  // Imagens e ícones do próprio site.
  if (
    url.origin === self.location.origin &&
    /\.(png|jpe?g|svg|webp|avif|ico|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, MEDIA));
  }
});

/* ---------------------------------------------------------------- push ---- */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "IndiqueLeads", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "IndiqueLeads";
  const opcoes = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag || "indiqueleads",
    renotify: Boolean(payload.tag),
    data: { url: payload.url || "/?fonte=app" },
    vibrate: [90, 50, 90],
  };

  // Imagem grande no corpo do aviso. Android mostra; iOS ignora sem quebrar.
  if (payload.image) opcoes.image = payload.image;

  // Botão de ação. Sem `action` definida, o toque no botão cai no mesmo
  // destino do aviso — que é o comportamento desejado aqui.
  if (payload.actionLabel) {
    opcoes.actions = [{ action: "abrir", title: payload.actionLabel }];
  }

  event.waitUntil(self.registration.showNotification(title, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/?fonte=app";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // Se o app já está aberto, leva a janela existente para a tela certa.
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(target).catch(() => undefined);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
