"use client";

import { useState } from "react";
import { downloadPng, downloadJpeg, downloadSvg, buildFilename } from "@/lib/qrExport";

function DownloadButton({ label, busy, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="px-3 py-2 text-sm font-medium rounded bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 disabled:hover:bg-gray-300"
    >
      {busy ? "…" : label}
    </button>
  );
}

export default function DownloadButtons({ text, options, logo, type, summary, disabled, onDownload }) {
  const [busy, setBusy] = useState(null);
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

  return (
    <div className="flex gap-2">
      <DownloadButton
        label="PNG"
        busy={busy === "png"}
        disabled={disabled}
        onClick={() =>
          handleDownload("png", () =>
            downloadPng(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "png"))
          )
        }
      />
      <DownloadButton
        label="JPEG"
        busy={busy === "jpeg"}
        disabled={disabled}
        onClick={() =>
          handleDownload("jpeg", () =>
            downloadJpeg(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "jpg"))
          )
        }
      />
      <DownloadButton
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
  );
}
