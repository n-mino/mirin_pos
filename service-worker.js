// このバージョン番号を上げると、次回オンライン時に新しいキャッシュへ切り替わる
const CACHE_VERSION = "pos-app-cache-v1";

// アプリの動作に必要な全ファイル(App Shell)
// CDNのReact/Babelも含めてキャッシュし、完全オフラインで起動できるようにする
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.jsx",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone@7.24.7/babel.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // CDNリソースはno-corsで取得(opaqueレスポンスでもキャッシュ自体は可能)
      return Promise.all(
        APP_SHELL.map((url) =>
          fetch(url, { mode: url.startsWith("http") ? "no-cors" : "same-origin" })
            .then((res) => cache.put(url, res))
            .catch(() => {
              // 初回インストール時にオフラインだと失敗するファイルがあってもインストール自体は続行する
            })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// キャッシュファースト戦略: あればキャッシュから即返し、裏側で更新を試みる(stale-while-revalidate)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => cached); // オフライン時はキャッシュにフォールバック

      return cached || fetchPromise;
    })
  );
});
