"use client";

import { useSyncExternalStore } from "react";
import {
  addHistoryItem,
  createEmptyHistory,
  HISTORY_KEY,
  loadHistory,
  removeHistoryItem,
  saveHistory,
  toggleFavorite as toggleFavoriteItem,
} from "./history";

// localStorage is an external store, so we sync to it with useSyncExternalStore rather
// than useState+useEffect. getServerSnapshot must return a *stable* reference (React
// warns/loops otherwise), so EMPTY is frozen once and reused rather than constructed
// per call.
const EMPTY = Object.freeze(createEmptyHistory());
let cache = null;
const listeners = new Set();

function getSnapshot() {
  if (cache === null) {
    cache = typeof window !== "undefined" ? loadHistory(window.localStorage) : EMPTY;
  }
  return cache;
}

function getServerSnapshot() {
  return EMPTY;
}

function subscribe(callback) {
  listeners.add(callback);

  function onStorage(event) {
    if (event.key === HISTORY_KEY) {
      cache = null;
      callback();
    }
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(next) {
  cache = next;
  if (typeof window !== "undefined") saveHistory(window.localStorage, next);
  listeners.forEach((listener) => listener());
}

export function useHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    history,
    // Mutators read the latest snapshot via getSnapshot() rather than the `history`
    // closed over at render time, so a rapid sequence of calls (e.g. add then remove)
    // never overwrites an in-between change with stale data.
    addItem: (item) => commit(addHistoryItem(getSnapshot(), item)),
    removeItem: (id) => commit(removeHistoryItem(getSnapshot(), id)),
    toggleFavorite: (id) => commit(toggleFavoriteItem(getSnapshot(), id)),
  };
}
