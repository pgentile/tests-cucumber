import "core-js/stable";
import "regenerator-runtime/runtime";

import { render } from "react-dom";

import AppRouter from "./AppRouter";

import "./main.scss";

window.addEventListener("DOMContentLoaded", async () => {
  const rootNode = document.getElementById("content");
  render(<AppRouter />, rootNode);
});

window.addEventListener("load", async () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", (event) => {
      console.info("[SW Client] Controller changed", event);
    });

    await navigator.serviceWorker.register(new URL("./service-worker.js", import.meta.url), {
      scope: "/ui/"
    });
  }
});
