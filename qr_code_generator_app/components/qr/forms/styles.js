export const labelClass = "block mb-1 text-sm text-slate-700 dark:text-slate-300";

// min-h-11 (44px) meets the usual mobile touch-target guideline — the
// py-2/text-sm combination alone rendered at ~38-39px.
export function inputClass(hasError) {
  return `w-full min-h-11 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/15 ${
    hasError ? "border-red-500 dark:border-red-400" : "border-slate-300 dark:border-slate-600"
  }`;
}
