"use client";

import { useState } from "react";
import { Input, Select, Option, Switch, IconButton } from "@material-tailwind/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import FieldError from "./FieldError";

export default function WifiForm({ fields, errors, onFieldChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-72 flex flex-col gap-3">
      <div>
        <Input
          id="wifi-ssid"
          label="Network name (SSID)"
          color="blue"
          value={fields.ssid}
          error={Boolean(errors.ssid)}
          aria-invalid={Boolean(errors.ssid)}
          aria-describedby={errors.ssid ? "wifi-ssid-error" : undefined}
          onChange={(e) => onFieldChange("ssid", e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          labelProps={{ htmlFor: "wifi-ssid" }}
        />
        <FieldError id="wifi-ssid-error" message={errors.ssid} />
      </div>
      <Select
        label="Security"
        color="blue"
        value={fields.security}
        onChange={(value) => onFieldChange("security", value)}
      >
        <Option value="WPA">WPA/WPA2</Option>
        <Option value="SAE">WPA3 (SAE)</Option>
        <Option value="WEP">WEP</Option>
        <Option value="nopass">No password</Option>
      </Select>
      {fields.security !== "nopass" && (
        <div>
          <div className="relative">
            <Input
              id="wifi-password"
              label="Password"
              color="blue"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              value={fields.password}
              error={Boolean(errors.password)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "wifi-password-error" : undefined}
              onChange={(e) => onFieldChange("password", e.target.value)}
              labelProps={{ htmlFor: "wifi-password" }}
              containerProps={{ className: "min-w-0" }}
              className="pr-10"
            />
            <IconButton
              size="sm"
              variant="text"
              className="!absolute right-1 top-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </IconButton>
          </div>
          <FieldError id="wifi-password-error" message={errors.password} />
        </div>
      )}
      <Switch id="wifi-hidden" label="Hidden network" checked={fields.hidden} onChange={(e) => onFieldChange("hidden", e.target.checked)} />
      {fields.security !== "nopass" && (
        <Switch
          id="wifi-remember-password"
          label="Remember password in history"
          checked={fields.rememberPassword}
          onChange={(e) => onFieldChange("rememberPassword", e.target.checked)}
        />
      )}
    </div>
  );
}
