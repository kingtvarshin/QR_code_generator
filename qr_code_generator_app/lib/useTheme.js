"use client";

import { useLayoutEffect, useRef, useState } from "react";

const STORAGE_KEY = "qr-forge-theme";
const META_COLOR = { light: "#eef2ff", dark: "#020617" };

// Default is the OS theme, tracked live (no localStorage write) — so switching
// your system's light/dark setting while this page is open updates it too.
// Only an explicit toggle pins a choice: it's persisted and the OS listener
// below stops affecting the page until localStorage is cleared.
export function useTheme() {
  const [theme, setTheme] = useState(null);
  const isUserSetRef = useRef(false);

  useLayoutEffect(() => {
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage can throw in private/locked-down browsing modes — fall
      // through to the system default below.
    }

    if (stored === "light" || stored === "dark") {
      isUserSetRef.current = true;
      setTheme(stored);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(media.matches ? "dark" : "light");

    function handleSystemChange(event) {
      if (isUserSetRef.current) return;
      setTheme(event.matches ? "dark" : "light");
    }

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  useLayoutEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META_COLOR[theme]);
  }, [theme]);

  function toggleTheme() {
    isUserSetRef.current = true;
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Toggle still works for the rest of the session, it just won't persist.
      }
      return next;
    });
  }

  return { theme, toggleTheme };
}
