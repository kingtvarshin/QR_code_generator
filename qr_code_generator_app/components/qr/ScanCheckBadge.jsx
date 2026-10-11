"use client";

const WARNING_BY_REASON = {
  logo: "⚠ May not scan — the logo covers too much of the code. Make it smaller.",
  inverted: "⚠ Inverted colors — many phone scanners can't read this. Swap the foreground/background colors.",
  unreadable: "⚠ May not scan — try more contrast or shorten the content.",
};

// Purely a display of the result computed by lib/useScanCheck.js — no role="status"
// here, since this unmounts/remounts with the QR itself and page.js's single
// always-mounted live region is what actually gets announced.
export default function ScanCheckBadge({ result }) {
  if (!result) return null;

  return (
    <p className={`text-sm ${result.ok ? "text-green-700" : "text-amber-700"}`}>
      {result.ok ? "✓ Scannable" : WARNING_BY_REASON[result.reason] ?? WARNING_BY_REASON.unreadable}
    </p>
  );
}
