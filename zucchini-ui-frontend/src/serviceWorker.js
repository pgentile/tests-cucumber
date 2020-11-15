/// <reference lib="webworker" />

const cacheName = "v8";
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

  const cleanOldCaches = async () => {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== cacheName) {
        await caches.delete(key);
      }
    }
  };

  event.waitUntil(cleanOldCaches());
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
  console.log("[Service Worker] Got message from client %s:", event.source.url, event.data);

  const { type, id, payload: requestPayload } = event.data;

  if (type === "exchange") {
    const responseData = {
      type,
      id,
      payload: {
        hello: "Hello, you",
        requestPayload
      }
    };
    event.source.postMessage(responseData);
  }
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

setInterval(async () => {
  const currentClients = await clients.matchAll();
  for (const client of currentClients) {
    client.postMessage({ ping: "Ping", date: new Date().getTime() });
  }
}, 5000);
