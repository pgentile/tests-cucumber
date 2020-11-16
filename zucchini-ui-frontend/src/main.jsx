import "core-js/stable";
import "regenerator-runtime/runtime";

import { render } from "react-dom";
import UUID from "pure-uuid";

import AppRouter from "./AppRouter";

import "./main.scss";

window.addEventListener("DOMContentLoaded", async () => {
  const rootNode = document.getElementById("content");
  render(<AppRouter />, rootNode);
});

window.addEventListener("load", async () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", (event) => {
      console.info("[SW Client] Controller changed:", event);
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      console.info("[SW Client] Received message:", event.data);
    });

    await navigator.serviceWorker.register(new URL("./serviceWorker.js", import.meta.url), {
      scope: "/ui/"
    });
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active;

    console.info("[SW Client] Controller is", worker);

    const [response1, response2, response3] = await Promise.all([
      exchange(worker, "Hello, my friend"),
      exchange(worker, "Bonjour"),
      exchange(worker, "Güten Tag")
    ]);

    console.info("[SW Client] Response 1 is", response1);
    console.info("[SW Client] Response 2 is", response2);
    console.info("[SW Client] Response 3 is", response3);
  }
});

/**
 * Exchange with the service worker.
 *
 * @param {ServiceWorker} worker Service Worker
 * @param {any} payload Payload
 * @returns {Promise<any>} Result
 */
async function exchange(worker, payload) {
  const requestData = {
    type: "exchange",
    id: new UUID(4).format(),
    payload
  };

  return new Promise((resolve) => {
    const listener = (event) => {
      console.info("[SW Client] Got response for exchange:", event);

      const responseData = event.data;
      if (responseData.id === requestData.id) {
        navigator.serviceWorker.removeEventListener("message", listener);
        resolve(responseData.payload);
      }
    };

    navigator.serviceWorker.addEventListener("message", listener);

    worker.postMessage(requestData);
  });
}
