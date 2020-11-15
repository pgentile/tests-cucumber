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

    const response = await exchange(worker, "Hello, my friend");
    console.info("[SW Client] Response is", response);
  }
});

/**
 * @returns {Promise<ServiceWorker>}
 */
async function registerWorker() {
  const registration = await navigator.serviceWorker.register(new URL("./serviceWorker.js", import.meta.url), {
    scope: "/ui/"
  });

  if (registration.active) {
    return registration.active;
  }

  return new Promise((resolve) => {
    registration.addEventListener("updatefound", (event) => {
      console.info("[SW Client] Update found:", event);
      resolve(event.target);
    });
  });
}

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
