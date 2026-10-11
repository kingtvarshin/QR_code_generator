export const labelClass = "block mb-1 text-sm text-blue-gray-700";

export function inputClass(hasError) {
  return `w-full border rounded px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;
}
