// crypto.randomUUID() only exists in secure contexts (HTTPS or localhost) and on
// Safari < 15.4 — falls back to a non-cryptographic id, which is fine here since
// it's only used to key history list entries, never for anything security-sensitive.
export function generateId() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}
