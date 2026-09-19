var CACHE_NAME = 'alamal-shell-v2';
var ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// بنخزن بس ملفات "الغلاف" نفسه (الشكل)، مش محتوى التطبيق اللي جوه الـ iframe
// عشان البيانات تفضل دايمًا لايف من Google Sheet ومحتاجة نت شغال
// Network-First: نجرب النت الأول عشان أي تحديث يوصل فورًا، ونستخدم الكاش بس لو مفيش نت
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  var isShellAsset = ASSETS.some(function (a) { return url.pathname.endsWith(a); });
  if (isShellAsset) {
    e.respondWith(
      fetch(e.request).then(function (resp) {
        var respClone = resp.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, respClone); });
        return resp;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
  }
});
