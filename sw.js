const CACHE_NAME = 'hoesaeng-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/01_자격진단.html',
  '/02_비용안내.html',
  '/03_절차타임라인.html',
  '/04_상담예약.html',
  '/개인회생_상담_챗봇.html',
  '/manifest.json'
];

// 설치
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 활성화
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패시 캐시
self.addEventListener('fetch', event => {
  // API 요청은 캐시 안 함
  if (event.request.url.includes('/.netlify/functions/')) return;
  if (event.request.url.includes('api.anthropic.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
