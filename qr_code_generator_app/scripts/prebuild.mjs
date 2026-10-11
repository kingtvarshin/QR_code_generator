import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import { stampServiceWorker } from "./stampServiceWorker.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..");

function getVersion() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
  } catch {
    // No git available (or not a repo, e.g. some CI checkouts) — a timestamp still
    // guarantees a fresh cache name every build, just without a human-readable commit.
    return Date.now().toString(36);
  }
}

stampServiceWorker({
  templatePath: path.join(root, "public", "sw.template.js"),
  outputPath: path.join(root, "public", "sw.js"),
  version: getVersion(),
});
