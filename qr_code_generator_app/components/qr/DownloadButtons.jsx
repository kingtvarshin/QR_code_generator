"use client";

import { useState } from "react";
import { Button } from "@material-tailwind/react";
import { downloadPng, downloadJpeg, downloadSvg, buildFilename } from "@/lib/qrExport";

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
      <Button
        size="sm"
        disabled={disabled}
        loading={busy === "png"}
        onClick={() =>
          handleDownload("png", () =>
            downloadPng(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "png"))
          )
        }
      >
        PNG
      </Button>
      <Button
        size="sm"
        disabled={disabled}
        loading={busy === "jpeg"}
        onClick={() =>
          handleDownload("jpeg", () =>
            downloadJpeg(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "jpg"))
          )
        }
      >
        JPEG
      </Button>
      <Button
        size="sm"
        disabled={disabled}
        loading={busy === "svg"}
        onClick={() =>
          handleDownload("svg", () =>
            downloadSvg(text, exportOptions, logo, buildFilename(type, summary, exportOptions.width, "svg"))
          )
        }
      >
        SVG
      </Button>
    </div>
  );
}
