import { readFileSync, writeFileSync } from "fs";

export const VERSION_PLACEHOLDER = "__CACHE_VERSION__";

// Pure-ish and separately testable from the CLI entrypoint (prebuild.js) so the
// actual versioning behavior — "a new version produces a different cache name" —
// has real unit test coverage, not just a manual checklist.
export function stampServiceWorker({ templatePath, outputPath, version }) {
  const template = readFileSync(templatePath, "utf8");
  if (!template.includes(VERSION_PLACEHOLDER)) {
    throw new Error(`${templatePath} is missing the ${VERSION_PLACEHOLDER} placeholder`);
  }
  const stamped = template.split(VERSION_PLACEHOLDER).join(version);
  writeFileSync(outputPath, stamped);
  return stamped;
}
