"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { checkScannable } from "@/lib/scanCheck";

// A second debounce on top of the already-debounced QR text: decoding renders a
// canvas and runs a detector, which is more work than re-rendering the preview —
// this keeps rapid slider drags (margin, colors) from queuing up a decode per tick.
const CHECK_DEBOUNCE_MS = 500;

export default function ScanCheckBadge({ text, options, logo, isReady }) {
  const checkKey = isReady ? `${text}::${JSON.stringify(options)}::${logo?.dataUrl?.length ?? 0}` : "";
  const debouncedKey = useDebouncedValue(checkKey, CHECK_DEBOUNCE_MS);
  const [status, setStatus] = useState("idle"); // idle | checking | ok | warn

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!debouncedKey) {
        if (!cancelled) setStatus("idle");
        return;
      }
      if (!cancelled) setStatus("checking");
      try {
        const result = await checkScannable(text, options, logo);
        if (!cancelled) setStatus(result === null ? "idle" : result ? "ok" : "warn");
      } catch {
        if (!cancelled) setStatus("idle");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // `text`/`options`/`logo` are intentionally not direct deps — debouncedKey is
    // derived from exactly those values, so it already tracks every change they'd
    // trigger, just delayed. Depending on them too would defeat the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKey]);

  if (status === "idle" || status === "checking") return null;

  return (
    <p role="status" className={`text-sm ${status === "ok" ? "text-green-700" : "text-amber-700"}`}>
      {status === "ok" ? "✓ Scannable" : "⚠ May not scan — try higher error correction / more contrast / smaller logo"}
    </p>
  );
}
