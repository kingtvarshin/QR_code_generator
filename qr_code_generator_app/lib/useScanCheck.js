"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import { checkScannable } from "./scanCheck";

// A second debounce on top of the already-debounced QR text: decoding renders a
// canvas and runs a detector, which is more work than re-rendering the preview —
// this keeps rapid slider drags (margin, colors) from queuing up a decode per tick.
const CHECK_DEBOUNCE_MS = 500;

// Returns null while there's nothing to check, or { ok, reason } once decoded —
// lifted out of ScanCheckBadge so page.js can also use the result to compose its
// one accessible announcement, instead of the badge owning it in isolation.
export function useScanCheck(text, options, logo, isReady) {
  const checkKey = isReady ? `${text}::${JSON.stringify(options)}::${logo?.dataUrl?.length ?? 0}` : "";
  const debouncedKey = useDebouncedValue(checkKey, CHECK_DEBOUNCE_MS);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!debouncedKey) {
        if (!cancelled) setResult(null);
        return;
      }
      try {
        const outcome = await checkScannable(text, options, logo);
        if (!cancelled) setResult(outcome);
      } catch {
        if (!cancelled) setResult(null);
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

  return result;
}
