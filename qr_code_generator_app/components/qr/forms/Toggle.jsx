"use client";

export default function Toggle({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-2 text-sm text-blue-gray-700 cursor-pointer">
      {label}
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="w-5 h-5" />
    </label>
  );
}
