"use client";

import FieldError from "./FieldError";
import { inputClass, labelClass } from "./styles";

export default function UpiForm({ fields, errors, onFieldChange }) {
  return (
    <div className="w-72 flex flex-col gap-3">
      <div>
        <label htmlFor="upi-vpa" className={labelClass}>
          Payee UPI ID (VPA)
        </label>
        <input
          id="upi-vpa"
          className={inputClass(Boolean(errors.vpa))}
          value={fields.vpa}
          aria-invalid={Boolean(errors.vpa)}
          aria-describedby={errors.vpa ? "upi-vpa-error" : undefined}
          onChange={(e) => onFieldChange("vpa", e.target.value)}
          placeholder="name@bank"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <FieldError id="upi-vpa-error" message={errors.vpa} />
      </div>
      <div>
        <label htmlFor="upi-payeeName" className={labelClass}>
          Payee name
        </label>
        <input
          id="upi-payeeName"
          className={inputClass(Boolean(errors.payeeName))}
          value={fields.payeeName}
          aria-invalid={Boolean(errors.payeeName)}
          aria-describedby={errors.payeeName ? "upi-payeeName-error" : undefined}
          onChange={(e) => onFieldChange("payeeName", e.target.value)}
        />
        <FieldError id="upi-payeeName-error" message={errors.payeeName} />
      </div>
      <div>
        <label htmlFor="upi-amount" className={labelClass}>
          Amount in INR (optional)
        </label>
        <input
          id="upi-amount"
          className={inputClass(Boolean(errors.amount))}
          value={fields.amount}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "upi-amount-error" : undefined}
          onChange={(e) => onFieldChange("amount", e.target.value)}
          placeholder="100.00"
          type="text"
          inputMode="decimal"
        />
        <FieldError id="upi-amount-error" message={errors.amount} />
      </div>
      <div>
        <label htmlFor="upi-note" className={labelClass}>
          Note (optional, max 80 characters)
        </label>
        <input
          id="upi-note"
          className={inputClass(Boolean(errors.note))}
          value={fields.note}
          maxLength={80}
          aria-invalid={Boolean(errors.note)}
          aria-describedby={errors.note ? "upi-note-error" : undefined}
          onChange={(e) => onFieldChange("note", e.target.value)}
        />
        <FieldError id="upi-note-error" message={errors.note} />
      </div>
    </div>
  );
}
