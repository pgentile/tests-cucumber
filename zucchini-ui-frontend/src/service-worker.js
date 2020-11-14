/// <reference lib="webworker" />

const cacheName = "v3";
const rootUrl = "/ui/";

addEventListener("install", (event) => {
  console.log("[Service Worker] Installation:", event);

  const initCache = async () => {
    const cache = await caches.open(cacheName);
    await cache.add(rootUrl);
  };

  event.waitUntil(initCache());
});

addEventListener("activate", (event) => {
  console.log("[Service Worker] Activation:", event);

  const cleanCacheThenClaim = async () => {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== cacheName) {
        await caches.delete(key);
      }
    }

    // eslint-disable-next-line no-undef
    await clients.claim();
  };

  event.waitUntil(cleanCacheThenClaim());
});

addEventListener("fetch", async (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;

  console.debug("[SW] Intercepted request for event:", event);

  if (path.startsWith("/ui/")) {
    const getResponse = async () => {
      const cache = await caches.open(cacheName);

      let cacheKey;
      let cachedResponse;
      if (path.startsWith("/ui/assets/")) {
        cacheKey = request;
        cachedResponse = await cache.match(request);
      } else {
        requestUrl.pathname = "/ui/";
        cacheKey = requestUrl;
        cachedResponse = await cache.match(requestUrl, { ignoreSearch: true });
      }

      if (cachedResponse) {
        try {
          const response = await fetchWithTimeout(request, 500);
          await cache.put(cacheKey, response.clone());
          return response;
        } catch (e) {
          console.warn("[SW] Fetch failed", e);
          return cachedResponse.clone();
        }
      } else {
        const response = await fetch(request);
        await cache.put(cacheKey, response.clone());
        return response;
      }
    };

    event.respondWith(getResponse());
  }
});

addEventListener("message", (event) => {
  console.log("[Service Worker] Got message:", event);

  event.source.postMessage({ pong: "OK, recieved response. I love that" });
});

async function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const abort = new AbortController();

    const timeoutId = setTimeout(() => {
      abort.abort();
      reject(new Error("SW timeout"));
    }, timeout);

    fetch(request, { signal: abort.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(reject);
  });
}
