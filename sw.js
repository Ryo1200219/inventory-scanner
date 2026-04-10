const CACHE_NAME = 'by-zaiko-v1.1.5'; // ★バージョンを上げる
const ASSETS_TO_CACHE = [
  './',                  // ルートもキャッシュに含めると安定します
  './index.html',
  './manifest.json',
  './inventory-scanner.png',
  'https://unpkg.com/html5-qrcode'
];

// 1. インストール（待機せずにすぐ最新にする設定を追加）
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // ★新しいSWを即座に有効化待ち状態にする
});

// 2. 起動時（キャッシュ優先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 3. 古いキャッシュを削除 ＋ 制御を即開始
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // ★開いているページをすぐにこのSWの配下におく
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});
