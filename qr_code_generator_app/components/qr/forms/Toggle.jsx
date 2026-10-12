"use client";

export default function Toggle({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
      {label}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-indigo-600 dark:accent-indigo-500"
      />
    </label>
  );
}
