"use client";

import { useEffect, useRef } from "react";
import { loadPersistedOptions, savePersistedOptions } from "./persistedOptions";

// Loading from localStorage during the reducer's lazy initializer would make the
// client's first render disagree with the server-rendered HTML (a hydration
// mismatch), so the persisted settings are instead merged in once, after mount.
export function usePersistedOptions(options, onLoad) {
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current || typeof window === "undefined") return;
    hasLoadedRef.current = true;
    const persisted = loadPersistedOptions(window.localStorage);
    if (persisted) onLoad(persisted);
  }, [onLoad]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    savePersistedOptions(window.localStorage, options);
  }, [options]);
}
