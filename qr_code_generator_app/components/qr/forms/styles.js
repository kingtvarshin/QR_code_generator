export const labelClass = "block mb-1 text-sm text-slate-700";

// min-h-11 (44px) meets the usual mobile touch-target guideline — the
// py-2/text-sm combination alone rendered at ~38-39px.
export function inputClass(hasError) {
  return `w-full min-h-11 border rounded px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;
}
