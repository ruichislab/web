// sw.js — Service Worker ligero de Ruichis Lab (Offline-Ready para Gimnasio Mental y Catálogo)
const CACHE_NAME = 'ruichis-lab-v7';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './src/estilos/variables.css',
  './src/estilos/components.css',
  './src/estilos/modules.css',
  './src/estilos/main.css',
  './src/estilos/editorial.css',
  './src/utils/cleanup.js',
  './src/js/catalogo-datos.js',
  './src/js/juegos-mentales.js',
  './src/js/enciclopedia-datos.js',
  './src/js/enciclopedia.js',
  './src/js/seo-dynamic.js',
  './src/agenteModular.js',
  './src/app.js',
  './src/modulos/inicio.html',
  './src/modulos/gimnasio-mental.html',
  './src/modulos/enciclopedia.html',
  './src/modulos/contacto.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first sin caché HTTP intermedia para reflejar cambios al instante y funcionar offline
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
