"use client";

import { useState } from "react";
import {
  downloadPng,
  downloadJpeg,
  downloadSvg,
  buildFilename,
  getPngBlob,
  shareOrDownloadBlob,
  canCopyImages,
  copyBlobToClipboard,
} from "@/lib/qrExport";
import { useClientCapability } from "@/lib/useClientCapability";

function checkCanShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function" && typeof navigator.canShare === "function";
}

function ActionButton({ label, busy, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="px-3 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-400"
    >
      {busy ? "…" : label}
    </button>
  );
}

export default function DownloadButtons({ text, options, logo, type, summary, disabled, onDownload }) {
  const [busy, setBusy] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  // Feature detection reads `navigator`/`window`, which don't exist during SSR;
  // useClientCapability reports false there and the real value after mount, so the
  // server-rendered HTML and the client's first render agree (no hydration
  // mismatch) and the buttons appear a tick later on browsers that support them.
  const canShare = useClientCapability(checkCanShare);
  const canCopy = useClientCapability(canCopyImages);
  // `options.width` is the user's chosen download resolution (256-4096px) — the live
  // preview renders separately at a fixed, smaller size regardless of this value.
  const exportOptions = options;

  async function handleDownload(format, action) {
    setBusy(format);
    try {
      await action();
      onDownload?.(format);
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    try {
      const blob = await getPngBlob(text, exportOptions, logo);
      const result = await shareOrDownloadBlob(blob, buildFilename(type, summary, exportOptions.width, "png"));
      if (result !== "cancelled") onDownload?.("png");
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    setBusy("copy");
    try {
      const blob = await getPngBlob(text, exportOptions, logo);
      await copyBlobToClipboard(blob);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch {
      setCopyFeedback("Couldn't copy");
      setTimeout(() => setCopyFeedback(null), 2000);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <ActionButton
          label="PNG"
          busy={busy === "png"}
          disabled={disabled}
          onClick={() =>
            handleDownload("png", () =>
              downloadPng(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "png"))
            )
          }
        />
        <ActionButton
          label="JPEG"
          busy={busy === "jpeg"}
          disabled={disabled}
          onClick={() =>
            handleDownload("jpeg", () =>
              downloadJpeg(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "jpg"))
            )
          }
        />
        <ActionButton
          label="SVG"
          busy={busy === "svg"}
          disabled={disabled}
          onClick={() =>
            handleDownload("svg", () =>
              downloadSvg(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "svg"))
            )
          }
        />
      </div>
      {(canShare || canCopy) && (
        <div className="flex gap-2">
          {canShare && <ActionButton label="Share" busy={busy === "share"} disabled={disabled} onClick={handleShare} />}
          {canCopy && (
            <ActionButton label={copyFeedback || "Copy image"} busy={busy === "copy"} disabled={disabled} onClick={handleCopy} />
          )}
        </div>
      )}
    </div>
  );
}
