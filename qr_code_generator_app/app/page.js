"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import TypeSelector from "@/components/qr/TypeSelector";
import QRPreview from "@/components/qr/QRPreview";
import ScanCheckBadge from "@/components/qr/ScanCheckBadge";
import MiniPreview from "@/components/qr/MiniPreview";
import CustomizationPanel from "@/components/qr/CustomizationPanel";
import DownloadButtons from "@/components/qr/DownloadButtons";
import { formsByType } from "@/components/qr/forms";

// Below-the-fold and not needed for the primary generate/download flow — defer its
// chunk until after the initial paint.
const HistoryPanel = dynamic(() => import("@/components/qr/HistoryPanel"));
import { qrTypes } from "@/lib/qrTypes";
import { useQrBuilder } from "@/lib/useQrBuilder";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useHistory } from "@/lib/useHistory";
import { byteLength, capacityForLevel, exceedsCapacity, isNonEmpty } from "@/lib/validators";
import { downscaleImageDataUrl } from "@/lib/image";
import { usePersistedOptions } from "@/lib/usePersistedOptions";
import { useTheme } from "@/lib/useTheme";
import { scanStatusLabel, useScanCheck } from "@/lib/useScanCheck";
import { generateId } from "@/lib/id";

// How long to wait after the last change before updating the single accessible
// announcement — long enough that it doesn't fire mid-keystroke, and distinct
// from the 300ms/600ms debounces above since it covers the scan-check result too.
const ANNOUNCE_DEBOUNCE_MS = 800;

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [state, dispatch] = useQrBuilder();
  const { history, addItem, removeItem, toggleFavorite, clearAll } = useHistory();
  const [historyError, setHistoryError] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [touchedForType, setTouchedForType] = useState(state.activeType);
  usePersistedOptions(state.options, (options) => dispatch({ type: "MERGE_OPTIONS", options }));

  // Errors are type-scoped — don't carry a "touched" flag from one type's field into
  // another type's same-named field after switching tabs. Reset synchronously during
  // render (React's documented pattern for state that depends on a changed prop)
  // rather than in an effect, which would otherwise cascade an extra render.
  if (touchedForType !== state.activeType) {
    setTouchedForType(state.activeType);
    setTouchedFields({});
  }

  const activeTypeDef = qrTypes[state.activeType];
  const activeFields = state.fields[state.activeType];
  const errors = activeTypeDef.validate(activeFields);
  const isValid = Object.keys(errors).length === 0;
  const rawEncoded = isValid ? activeTypeDef.encode(activeFields) : "";
  const debouncedEncoded = useDebouncedValue(rawEncoded, 300);
  const tooLarge = isValid && exceedsCapacity(debouncedEncoded, state.options.errorCorrectionLevel);
  const isReady = isValid && Boolean(debouncedEncoded) && !tooLarge;
  const payloadBytes = byteLength(debouncedEncoded);
  const capacityBytes = capacityForLevel(state.options.errorCorrectionLevel);

  // A field's error only appears once the user has put something in it, and only
  // once they've either left the field (blurred) or paused for 600ms — not on
  // every keystroke, which would make the message flicker while still typing.
  const debouncedFields = useDebouncedValue(activeFields, 600);
  const displayErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => {
      if (!isNonEmpty(activeFields[field])) return false;
      const idle = activeFields[field] === debouncedFields[field];
      return idle || touchedFields[field];
    })
  );

  function handleFormBlurCapture(event) {
    const prefix = `${state.activeType}-`;
    const id = event.target.id || "";
    if (!id.startsWith(prefix)) return;
    const field = id.slice(prefix.length);
    setTouchedFields((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  let errorMessage;
  if (Object.keys(displayErrors).length > 0) errorMessage = Object.values(displayErrors)[0];
  else if (tooLarge) {
    errorMessage = "This content is too large for the selected error-correction level. Try lowering it.";
  }

  const scanResult = useScanCheck(debouncedEncoded, state.options, state.logo, isReady);
  const previewRef = useRef(null);
  const formRef = useRef(null);

  // One always-mounted live region (rendered unconditionally below) instead of
  // several that mount/unmount with the QR or the scan badge — a screen reader
  // often doesn't announce a brand-new live region that already has its text set
  // when it's inserted, so errors were never announced and "QR code updated" only
  // worked by accident. Debounced so it doesn't fire mid-keystroke.
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    const scanLabel = scanStatusLabel(scanResult);
    const message = errorMessage
      ? `Error: ${errorMessage}`
      : isReady
        ? `QR code updated.${scanLabel ? ` ${scanLabel}.` : ""}`
        : "";
    const timer = setTimeout(() => setAnnouncement(message), ANNOUNCE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [errorMessage, isReady, scanResult]);

  const ActiveForm = formsByType[state.activeType];

  function handleFieldChange(field, value) {
    dispatch({ type: "SET_FIELD", typeId: state.activeType, field, value });
  }

  function handleOptionChange(key, value) {
    dispatch({ type: "SET_OPTION", key, value });
  }

  function handleLogoChange(logo) {
    dispatch({ type: logo ? "SET_LOGO" : "CLEAR_LOGO", logo });
    // A logo covers enough modules that anything below High error correction tends to
    // fail to scan — bump it automatically rather than let users print a dead code.
    if (logo && state.options.errorCorrectionLevel !== "H") {
      dispatch({ type: "SET_OPTION", key: "errorCorrectionLevel", value: "H" });
    }
  }

  async function handleDownloadLogged(format) {
    // WiFi passwords are sensitive — only persist one if the user explicitly opted in.
    const fieldsForHistory =
      state.activeType === "wifi" && !activeFields.rememberPassword
        ? { ...activeFields, password: "" }
        : activeFields;

    // Store a downscaled copy of the logo, not the full-resolution upload — a handful
    // of multi-MB data-URLs can blow past localStorage's quota on their own.
    let logoForHistory = null;
    if (state.logo?.dataUrl) {
      try {
        logoForHistory = { ...state.logo, dataUrl: await downscaleImageDataUrl(state.logo.dataUrl) };
      } catch {
        logoForHistory = null;
      }
    }

    const saved = addItem({
      id: generateId(),
      type: state.activeType,
      fields: fieldsForHistory,
      options: state.options,
      logo: logoForHistory,
      createdAt: Date.now(),
      isFavorite: false,
      formats: [format],
      label: `${activeTypeDef.label}: ${activeTypeDef.summary(activeFields) || "(untitled)"}`,
    });
    setHistoryError(!saved);
  }

  function handleLoadHistoryItem(item) {
    dispatch({
      type: "LOAD_STATE",
      state: {
        activeType: item.type,
        fields: { ...state.fields, [item.type]: item.fields },
        options: item.options,
        logo: item.logo,
      },
    });
  }

  return (
    <main className="flex flex-col items-center gap-6 p-4 max-md:pb-[calc(6rem+env(safe-area-inset-bottom))] max-w-5xl mx-auto">
      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          QR Forge
        </h1>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {theme === "dark" ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Generate, customize, and download QR codes for URLs, text, phone, SMS, email, WiFi,
        contact cards, WhatsApp, and UPI payments.
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <TypeSelector activeType={state.activeType} onChange={(typeId) => dispatch({ type: "SET_ACTIVE_TYPE", typeId })} />

      <div className="flex flex-wrap justify-center gap-8 w-full">
        {/* Mobile order is always form, then preview, then customize — never
            reordered by readiness. Swapping the preview above a field the user is
            still typing into (as an earlier version did) shoved that field behind
            the on-screen keyboard the moment the payload became valid, and could
            flip back and forth while editing. MiniPreview below brings the result
            to the user instead of moving content underneath them. */}
        <div
          ref={formRef}
          role="tabpanel"
          id="qr-form-panel"
          aria-labelledby={`tab-${state.activeType}`}
          onBlurCapture={handleFormBlurCapture}
          className="order-1 sm:order-none w-72 self-start rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md shadow-lg shadow-indigo-900/5 p-5"
        >
          <ActiveForm
            fields={activeFields}
            errors={displayErrors}
            onFieldChange={handleFieldChange}
            hint={activeTypeDef.hint?.(activeFields)}
          />
        </div>

        <div className="order-2 sm:order-none flex flex-col items-center gap-3">
          <div
            ref={previewRef}
            className="w-60 h-60 flex items-center justify-center rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md shadow-lg shadow-indigo-900/10 p-3"
          >
            {/* Deliberately plain white, not dark:bg-slate-* — the QR needs
                real contrast to scan regardless of page theme. Exported
                PNG/JPEG/SVG colors come from the user's own colorDark/colorLight
                options and are unaffected by this wrapper either way. */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-white [&_svg]:w-full [&_svg]:h-full [&_canvas]:w-full [&_canvas]:h-full">
              <QRPreview
                text={debouncedEncoded}
                options={state.options}
                logo={state.logo}
                isReady={isReady}
                errorMessage={errorMessage}
              />
            </div>
          </div>
          {isReady && activeTypeDef.preview && (
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activeTypeDef.preview(activeFields)}</p>
          )}
          <ScanCheckBadge result={scanResult} />
          <DownloadButtons
            text={debouncedEncoded}
            options={state.options}
            logo={state.logo}
            type={state.activeType}
            summary={activeTypeDef.summary(activeFields)}
            disabled={!isReady}
            onDownload={handleDownloadLogged}
          />
          <p
            className={`text-sm ${
              payloadBytes > capacityBytes ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {payloadBytes.toLocaleString()} / {capacityBytes.toLocaleString()} bytes at{" "}
            {state.options.errorCorrectionLevel}
          </p>
        </div>

        <div className="order-3 sm:order-none">
          <CustomizationPanel
            options={state.options}
            onOptionChange={handleOptionChange}
            logo={state.logo}
            onLogoChange={handleLogoChange}
          />
        </div>
      </div>

      <MiniPreview
        previewRef={previewRef}
        formRef={formRef}
        text={debouncedEncoded}
        options={state.options}
        isReady={isReady}
        scanResult={scanResult}
      />

      <div className="w-full flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">History</h2>
        {historyError && (
          <div
            role="status"
            className="w-72 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 rounded px-3 py-2"
          >
            Couldn&apos;t save to history — your browser&apos;s local storage may be full.
          </div>
        )}
        <HistoryPanel
          items={history.items}
          onLoad={handleLoadHistoryItem}
          onToggleFavorite={toggleFavorite}
          onRemove={removeItem}
          onRestore={addItem}
          onClearAll={clearAll}
        />
      </div>
    </main>
  );
}
