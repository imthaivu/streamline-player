const CACHE_NAME = "app-shell-v1";
const APP_SHELL = [
    "/",             // Trang chính
    "/index.html",   // HTML chính
    "/styles.css",   // CSS
    "/script.js",    // JS (thay app.js thành script.js cho khớp)
    "/icon.png"      // Icon nếu có
];

// Cache app shell khi install (dùng cache.addAll để đơn giản và hiệu quả hơn)
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(APP_SHELL)
                .catch(err => console.error("Cache addAll failed:", err)); // Xử lý lỗi nếu file không fetch được
        })
    );
    console.log("Service Worker installed");
    self.skipWaiting(); // Activate SW ngay lập tức
});

// Activate: Xóa cache cũ nếu có
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        })
    );
    console.log("Service Worker activated");
    self.clients.claim(); // Claim clients ngay
});

// Fetch: Cache first, fallback to network (tránh loop và xử lý offline tốt hơn)
self.addEventListener("fetch", event => {
    console.log("Fetching:", event.request.url);
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                // Có thể cache dynamic nếu cần, nhưng ở đây chỉ app shell nên skip
                return networkResponse;
            }).catch(() => {
                // Offline fallback, ví dụ return trang offline nếu có
                return new Response("Offline, please check your connection.", { status: 503 });
            });
        })
    );
});