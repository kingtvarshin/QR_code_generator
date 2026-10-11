"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import TypeSelector from "@/components/qr/TypeSelector";
import QRPreview from "@/components/qr/QRPreview";
import ScanCheckBadge from "@/components/qr/ScanCheckBadge";
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
import { generateId } from "@/lib/id";

export default function Home() {
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
    <main className="flex flex-col items-center gap-6 p-4 max-w-5xl mx-auto">
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">QR Forge</h1>
      <p className="text-sm text-gray-600">
        Generate, customize, and download QR codes for URLs, text, phone, SMS, email, WiFi, and
        contact cards.
      </p>

      <TypeSelector activeType={state.activeType} onChange={(typeId) => dispatch({ type: "SET_ACTIVE_TYPE", typeId })} />

      <div className="flex flex-wrap justify-center gap-8 w-full">
        <div
          role="tabpanel"
          id="qr-form-panel"
          aria-labelledby={`tab-${state.activeType}`}
          onBlurCapture={handleFormBlurCapture}
        >
          <ActiveForm
            fields={activeFields}
            errors={displayErrors}
            onFieldChange={handleFieldChange}
            hint={activeTypeDef.hint?.(activeFields)}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="height_canvas w-60 h-60 flex items-center justify-center overflow-hidden [&_svg]:w-full [&_svg]:h-full [&_canvas]:w-full [&_canvas]:h-full">
            <QRPreview
              text={debouncedEncoded}
              options={state.options}
              logo={state.logo}
              isReady={isReady}
              errorMessage={errorMessage}
            />
          </div>
          <ScanCheckBadge text={debouncedEncoded} options={state.options} logo={state.logo} isReady={isReady} />
          <DownloadButtons
            text={debouncedEncoded}
            options={state.options}
            logo={state.logo}
            type={state.activeType}
            summary={activeTypeDef.summary(activeFields)}
            disabled={!isReady}
            onDownload={handleDownloadLogged}
          />
          <p className={`text-sm ${payloadBytes > capacityBytes ? "text-red-600" : "text-gray-500"}`}>
            {payloadBytes.toLocaleString()} / {capacityBytes.toLocaleString()} bytes at{" "}
            {state.options.errorCorrectionLevel}
          </p>
        </div>

        <CustomizationPanel
          options={state.options}
          onOptionChange={handleOptionChange}
          logo={state.logo}
          onLogoChange={handleLogoChange}
        />
      </div>

      <div className="w-full flex flex-col items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        {historyError && (
          <div role="status" className="w-72 text-sm text-amber-800 bg-amber-50 rounded px-3 py-2">
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
