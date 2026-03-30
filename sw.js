const CACHE_NAME = 'by-zaiko-v2';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './inventory-scanner.png', // ★ここも小文字に修正
  'https://unpkg.com/html5-qrcode'
];
// 1. インストール時にファイルをスマホに保存（キャッシュ）する
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. 起動時、ネットより先にキャッシュからファイルを返す（爆速起動）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 3. 古いキャッシュを削除する（バージョンアップ用）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
