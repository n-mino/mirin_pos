// このバージョン番号を上げると、次回オンライン時に新しいキャッシュへ切り替わる
const CACHE_VERSION = "pos-app-cache-v31";

// アプリの動作に必要な全ファイル(App Shell)
// CDNのReact/Babelも含めてキャッシュし、完全オフラインで起動できるようにする
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.jsx",
  "./ledger.jsx",
  "./payroll.jsx",
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
      // CDN(unpkg)はCORSに対応しているため、ページ側の<script crossorigin>と
      // 同じ既定モード(cors)で取得する。no-corsで取得するとopaqueレスポンスに
      // なり、後続の実リクエスト(corsモード)に対して返した際にモード不一致の
      // ネットワークエラーとなり、React本体が読み込めなくなってしまうため。
      return Promise.all(
        APP_SHELL.map((url) =>
          fetch(url)
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
  if (!event.request.url.startsWith("http")) return; // chrome-extension: 等はSWの対象外

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
