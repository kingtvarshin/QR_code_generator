"use client";

import { useEffect, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LogoDropzone({ logo, onLogoChange }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Covers not just the "Remove logo" click below but also an external clear —
  // e.g. restoring a history item that has no logo — so re-selecting the same
  // file afterward still fires a change event instead of being a no-op.
  useEffect(() => {
    if (!logo && fileInputRef.current) fileInputRef.current.value = "";
  }, [logo]);

  async function handleFile(file) {
    if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
    const dataUrl = await readFileAsDataUrl(file);
    onLogoChange({ dataUrl, widthRatio: 0.22 });
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  function handlePaste(event) {
    const file = Array.from(event.clipboardData?.items ?? [])
      .find((entry) => entry.kind === "file" && entry.type.startsWith("image/"))
      ?.getAsFile();
    if (file) handleFile(file);
  }

  return (
    <div>
      <label id="logo-label" className="block mb-1 text-sm text-slate-700">
        Logo (optional)
      </label>
      <div
        role="button"
        tabIndex={0}
        aria-labelledby="logo-label"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={`flex items-center gap-3 border-2 border-dashed rounded-lg p-3 cursor-pointer transition-colors
          ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
      >
        {logo?.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- a transient user-uploaded data: URL, not a static/optimizable asset
          <img src={logo.dataUrl} alt="Uploaded logo preview" className="w-10 h-10 object-contain rounded bg-white" />
        ) : (
          <div className="w-10 h-10 rounded bg-gray-100" aria-hidden="true" />
        )}
        <span className="text-sm text-gray-600">
          {logo?.dataUrl ? "Click, drop, or paste to replace" : "Click, drop, or paste an image"}
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      {logo && (
        <button
          type="button"
          className="mt-1 text-sm text-red-600 font-medium px-2 py-1"
          onClick={() => onLogoChange(null)}
        >
          Remove logo
        </button>
      )}
    </div>
  );
}
