const CACHE = 'tripgo-v1';

// 앱 설치 때 미리 저장할 핵심 파일 (경로와 대소문자를 실제와 똑같이)
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/display.css',
  './js/move.js',
  './icons/appstore-images/android/launchericon-192x192.png',
  './icons/appstore-images/android/launchericon-512x512.png',
];

// 설치: 핵심 파일 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 옛 버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// 요청 처리
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // GET이 아니거나 다른 도메인(Supabase, 지도, AI 등) 요청은 건드리지 않음
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // 페이지 이동: 네트워크 우선, 오프라인이면 저장된 index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 그 외 파일(CSS, JS, 이미지): 저장본을 먼저 보여주고, 뒤에서 새 버전을 받아 갱신
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});