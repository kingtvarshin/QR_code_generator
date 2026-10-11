"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { checkScannable } from "@/lib/scanCheck";

// A second debounce on top of the already-debounced QR text: decoding renders a
// canvas and runs a detector, which is more work than re-rendering the preview —
// this keeps rapid slider drags (margin, colors) from queuing up a decode per tick.
const CHECK_DEBOUNCE_MS = 500;

const WARNING_BY_REASON = {
  logo: "⚠ May not scan — the logo covers too much of the code. Make it smaller.",
  inverted: "⚠ Inverted colors — many phone scanners can't read this. Swap the foreground/background colors.",
  unreadable: "⚠ May not scan — try more contrast or shorten the content.",
};

export default function ScanCheckBadge({ text, options, logo, isReady }) {
  const checkKey = isReady ? `${text}::${JSON.stringify(options)}::${logo?.dataUrl?.length ?? 0}` : "";
  const debouncedKey = useDebouncedValue(checkKey, CHECK_DEBOUNCE_MS);
  const [result, setResult] = useState(undefined); // undefined | null | { ok, reason }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!debouncedKey) {
        if (!cancelled) setResult(undefined);
        return;
      }
      try {
        const outcome = await checkScannable(text, options, logo);
        if (!cancelled) setResult(outcome);
      } catch {
        if (!cancelled) setResult(undefined);
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

  if (!result) return null;

  return (
    <p role="status" className={`text-sm ${result.ok ? "text-green-700" : "text-amber-700"}`}>
      {result.ok ? "✓ Scannable" : WARNING_BY_REASON[result.reason] ?? WARNING_BY_REASON.unreadable}
    </p>
  );
}
