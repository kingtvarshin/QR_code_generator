import { readFileSync, writeFileSync } from "fs";

export const VERSION_PLACEHOLDER = "__CACHE_VERSION__";
export const PRECACHE_PLACEHOLDER = "__PRECACHE_URLS__";

// Pure-ish and separately testable from the CLI entrypoint (postbuild.mjs) so the
// actual versioning behavior — "a new version produces a different cache name" —
// has real unit test coverage, not just a manual checklist.
export function stampServiceWorker({ templatePath, outputPath, version, precacheUrls = [] }) {
  const template = readFileSync(templatePath, "utf8");
  if (!template.includes(VERSION_PLACEHOLDER)) {
    throw new Error(`${templatePath} is missing the ${VERSION_PLACEHOLDER} placeholder`);
  }
  if (!template.includes(PRECACHE_PLACEHOLDER)) {
    throw new Error(`${templatePath} is missing the ${PRECACHE_PLACEHOLDER} placeholder`);
  }
  const stamped = template
    .split(VERSION_PLACEHOLDER)
    .join(version)
    .split(PRECACHE_PLACEHOLDER)
    .join(JSON.stringify(precacheUrls));
  writeFileSync(outputPath, stamped);
  return stamped;
}
