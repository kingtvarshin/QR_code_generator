"use client";

import { useState } from "react";
import { Button } from "@material-tailwind/react";
import { downloadPng, downloadJpeg, downloadSvg, buildFilename } from "@/lib/qrExport";

const EXPORT_MIN_WIDTH = 512;

export default function DownloadButtons({ text, options, logo, type, summary, disabled, onDownload }) {
  const [busy, setBusy] = useState(null);
  const exportOptions = { ...options, width: Math.max(options.width, EXPORT_MIN_WIDTH) };

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
