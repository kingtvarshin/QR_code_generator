"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegistration() {
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;

        // A worker can already be waiting from a previous visit (e.g. the tab was
        // open when the new version installed) — pick that up immediately too.
        if (reg.waiting && navigator.serviceWorker.controller) setWaitingWorker(reg.waiting);

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            // "installed" + an existing controller means this is an *update*, not
            // the very first install on a fresh visit — nothing to prompt about yet.
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(installing);
            }
          });
        });
      })
      .catch(() => {
        // Offline support is a nice-to-have, not critical — fail silently.
      });

    let reloadedOnce = false;
    function handleControllerChange() {
      if (reloadedOnce) return;
      reloadedOnce = true;
      window.location.reload();
    }
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
  }, []);

  if (!waitingWorker) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-blue-gray-900 px-4 py-2 text-sm text-white shadow-lg"
    >
      Update available
      <button
        type="button"
        className="font-semibold underline underline-offset-2"
        onClick={() => waitingWorker.postMessage({ type: "SKIP_WAITING" })}
      >
        Reload
      </button>
    </div>
  );
}
