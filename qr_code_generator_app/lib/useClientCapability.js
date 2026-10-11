"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  // The capability (e.g. navigator.share support) doesn't change during a session,
  // so there's nothing to subscribe to — this just lets useSyncExternalStore give a
  // hydration-safe "false during SSR, real value after mount" result without the
  // setState-in-effect anti-pattern a plain useEffect would need for the same thing.
  return () => {};
}

const getServerSnapshot = () => false;

export function useClientCapability(check) {
  return useSyncExternalStore(subscribe, check, getServerSnapshot);
}
