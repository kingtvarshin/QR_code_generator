"use client";

import { useEffect, useState } from "react";
import QrSvg from "./QrSvg";
import { scanStatusLabel } from "@/lib/useScanCheck";

const VISIBILITY_THRESHOLD = 0.3;
// A visualViewport noticeably shorter than the window itself is the standard
// signal that the on-screen keyboard is open, independent of DOM focus — some
// mobile browsers can leave the keyboard up (or bring it down) without firing a
// focus/blur event that this component would otherwise see.
const KEYBOARD_VIEWPORT_RATIO = 0.75;

function isFormControl(el) {
  return Boolean(el) && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export default function MiniPreview({ previewRef, formRef, text, options, isReady, scanResult }) {
  const [mainVisible, setMainVisible] = useState(true);
  const [formFocused, setFormFocused] = useState(false);
  const [keyboardLikelyOpen, setKeyboardLikelyOpen] = useState(false);

  useEffect(() => {
    const target = previewRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setMainVisible(entry.intersectionRatio >= VISIBILITY_THRESHOLD), {
      threshold: [0, VISIBILITY_THRESHOLD, 1],
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [previewRef]);

  // Covers a field anywhere in the form (not just the one the main preview sits
  // next to) — a long form like Contact/WiFi/UPI can have the thumbnail sitting
  // right over a field further down while it's being filled in.
  useEffect(() => {
    const formEl = formRef.current;
    if (!formEl) return;

    function handleFocusIn(event) {
      if (isFormControl(event.target)) setFormFocused(true);
    }

    function handleFocusOut(event) {
      if (!isFormControl(event.target)) return;
      // Deferred so a focus move to another field in the same form (blur fires
      // before the new element's focus) is reflected before re-checking.
      requestAnimationFrame(() => {
        setFormFocused(isFormControl(document.activeElement) && formEl.contains(document.activeElement));
      });
    }

    formEl.addEventListener("focusin", handleFocusIn);
    formEl.addEventListener("focusout", handleFocusOut);
    return () => {
      formEl.removeEventListener("focusin", handleFocusIn);
      formEl.removeEventListener("focusout", handleFocusOut);
    };
  }, [formRef]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    function handleResize() {
      setKeyboardLikelyOpen(viewport.height < window.innerHeight * KEYBOARD_VIEWPORT_RATIO);
    }

    handleResize();
    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, []);

  if (!isReady || mainVisible || formFocused || keyboardLikelyOpen) return null;

  const status = scanStatusLabel(scanResult);
  const statusColor = scanResult ? (scanResult.ok ? "text-green-700" : "text-amber-700") : "text-slate-700";
  const statusText = status ? `${scanResult.ok ? "✓" : "⚠"} ${status}` : "QR ready";

  return (
    <button
      type="button"
      onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
      aria-label={`Show QR code. ${status ?? "ready"}`}
      className="md:hidden fixed right-3 z-40 flex items-center gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <span className="h-14 w-14 shrink-0 [&>div]:h-full [&>div]:w-full [&_svg]:h-full [&_svg]:w-full" aria-hidden="true">
        <QrSvg text={text} options={{ ...options, width: 56, margin: 1 }} />
      </span>
      <span className="pr-1 text-sm text-left leading-tight">
        <span className={statusColor}>{statusText}</span>
        <br />
        <span className="text-blue-700">View ↑</span>
      </span>
    </button>
  );
}
