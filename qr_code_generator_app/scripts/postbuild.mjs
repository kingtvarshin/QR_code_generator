import { execSync } from "child_process";
import { copyFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { stampServiceWorker } from "./stampServiceWorker.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..");
const chunksDir = path.join(root, "out", "_next", "static", "chunks");

function getVersion() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
  } catch {
    // No git available (or not a repo, e.g. some CI checkouts) — a timestamp still
    // guarantees a fresh cache name every build, just without a human-readable commit.
    return Date.now().toString(36);
  }
}

// The hashed chunk filenames (including chunks only ever reached via a runtime
// dynamic import(), like the scan-check feature's jsQR chunk) don't exist until
// `next build` has actually run — this is a *postbuild* step for exactly that
// reason, unlike the old prebuild-only version stamp.
function listChunkUrls() {
  let entries;
  try {
    entries = readdirSync(chunksDir);
  } catch {
    return [];
  }
  return entries.filter((name) => name.endsWith(".js") || name.endsWith(".css")).map((name) => `/_next/static/chunks/${name}`);
}

const publicSwPath = path.join(root, "public", "sw.js");
const outSwPath = path.join(root, "out", "sw.js");

stampServiceWorker({
  templatePath: path.join(root, "public", "sw.template.js"),
  outputPath: publicSwPath,
  version: getVersion(),
  precacheUrls: ["/", ...listChunkUrls()],
});

// `next build`'s static export already copied public/ into out/ before this
// script runs, using whatever public/sw.js contained at that point (stale, or
// nonexistent on a clean checkout) — the freshly stamped version above has to be
// copied over explicitly rather than relying on that earlier copy.
copyFileSync(publicSwPath, outSwPath);
