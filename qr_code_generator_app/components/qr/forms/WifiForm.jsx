"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import FieldError from "./FieldError";
import Toggle from "./Toggle";
import { inputClass, labelClass } from "./styles";

export default function WifiForm({ fields, errors, onFieldChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-72 flex flex-col gap-3">
      <div>
        <label htmlFor="wifi-ssid" className={labelClass}>
          Network name (SSID)
        </label>
        <input
          id="wifi-ssid"
          className={inputClass(Boolean(errors.ssid))}
          value={fields.ssid}
          aria-invalid={Boolean(errors.ssid)}
          aria-describedby={errors.ssid ? "wifi-ssid-error" : undefined}
          onChange={(e) => onFieldChange("ssid", e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <FieldError id="wifi-ssid-error" message={errors.ssid} />
      </div>

      <div>
        <label htmlFor="wifi-security" className={labelClass}>
          Security
        </label>
        <select
          id="wifi-security"
          className={inputClass(false)}
          value={fields.security}
          aria-describedby={fields.security === "SAE" ? "wifi-security-hint" : undefined}
          onChange={(e) => onFieldChange("security", e.target.value)}
        >
          <option value="WPA">WPA/WPA2</option>
          <option value="SAE">WPA3 (SAE)</option>
          <option value="WEP">WEP</option>
          <option value="nopass">No password</option>
        </select>
        {fields.security === "SAE" && (
          <p id="wifi-security-hint" className="mt-1 text-sm text-gray-500">
            Most WPA3 routers run in transition mode — choose WPA/WPA2 unless your network is
            WPA3-only. Many phone cameras and older scanners don&apos;t recognize SAE.
          </p>
        )}
      </div>

      {fields.security !== "nopass" && (
        <div>
          <label htmlFor="wifi-password" className={labelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="wifi-password"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              className={`${inputClass(Boolean(errors.password))} pr-10`}
              value={fields.password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "wifi-password-error" : undefined}
              onChange={(e) => onFieldChange("password", e.target.value)}
            />
            <button
              type="button"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          <FieldError id="wifi-password-error" message={errors.password} />
        </div>
      )}

      <Toggle
        id="wifi-hidden"
        label="Hidden network"
        checked={fields.hidden}
        onChange={(e) => onFieldChange("hidden", e.target.checked)}
      />
      {fields.security !== "nopass" && (
        <Toggle
          id="wifi-remember-password"
          label="Remember password in history"
          checked={fields.rememberPassword}
          onChange={(e) => onFieldChange("rememberPassword", e.target.checked)}
        />
      )}
    </div>
  );
}
