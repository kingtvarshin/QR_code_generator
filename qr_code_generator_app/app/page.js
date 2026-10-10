"use client";

import { Typography } from "@material-tailwind/react";
import TypeSelector from "@/components/qr/TypeSelector";
import QRPreview from "@/components/qr/QRPreview";
import CustomizationPanel from "@/components/qr/CustomizationPanel";
import DownloadButtons from "@/components/qr/DownloadButtons";
import HistoryPanel from "@/components/qr/HistoryPanel";
import { formsByType } from "@/components/qr/forms";
import { qrTypes } from "@/lib/qrTypes";
import { useQrBuilder } from "@/lib/useQrBuilder";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { useHistory } from "@/lib/useHistory";
import { exceedsCapacity, isNonEmpty } from "@/lib/validators";

export default function Home() {
  const [state, dispatch] = useQrBuilder();
  const { history, addItem, removeItem, toggleFavorite } = useHistory();

  const activeTypeDef = qrTypes[state.activeType];
  const activeFields = state.fields[state.activeType];
  const errors = activeTypeDef.validate(activeFields);
  const isValid = Object.keys(errors).length === 0;
  const rawEncoded = isValid ? activeTypeDef.encode(activeFields) : "";
  const debouncedEncoded = useDebouncedValue(rawEncoded, 300);
  const tooLarge = isValid && exceedsCapacity(debouncedEncoded, state.options.errorCorrectionLevel);
  const isReady = isValid && Boolean(debouncedEncoded) && !tooLarge;

  // Only surface a field's error once the user has actually put something in it —
  // an empty required field is the default state, not a mistake worth flagging in red.
  const displayErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => isNonEmpty(activeFields[field]))
  );

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

  function handleDownloadLogged() {
    addItem({
      id: crypto.randomUUID(),
      type: state.activeType,
      fields: activeFields,
      options: state.options,
      logo: state.logo,
      createdAt: Date.now(),
      isFavorite: false,
      label: `${activeTypeDef.label}: ${activeTypeDef.summary(activeFields) || "(untitled)"}`,
    });
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
    <div className="flex flex-col items-center gap-6 p-4 max-w-5xl mx-auto">
      <Typography variant="h3" color="blue-gray" className="mt-4">
        QR Forge
      </Typography>
      <Typography variant="small" color="gray">
        Generate, customize, and download QR codes for URLs, text, phone, SMS, email, WiFi, and
        contact cards.
      </Typography>

      <TypeSelector activeType={state.activeType} onChange={(typeId) => dispatch({ type: "SET_ACTIVE_TYPE", typeId })} />

      <div className="flex flex-wrap justify-center gap-8 w-full">
        <div role="tabpanel" id="qr-form-panel" aria-labelledby={`tab-${state.activeType}`}>
          <ActiveForm fields={activeFields} errors={displayErrors} onFieldChange={handleFieldChange} />
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
          <DownloadButtons
            text={debouncedEncoded}
            options={state.options}
            logo={state.logo}
            disabled={!isReady}
            onDownload={handleDownloadLogged}
          />
        </div>

        <CustomizationPanel
          options={state.options}
          onOptionChange={handleOptionChange}
          logo={state.logo}
          onLogoChange={handleLogoChange}
        />
      </div>

      <div className="w-full flex flex-col items-center gap-2">
        <Typography variant="h6" color="blue-gray">
          History
        </Typography>
        <HistoryPanel
          items={history.items}
          onLoad={handleLoadHistoryItem}
          onToggleFavorite={toggleFavorite}
          onRemove={removeItem}
        />
      </div>
    </div>
  );
}
