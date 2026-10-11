import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const BANNED = [{ pattern: /blue-gray-\d+/g, reason: "not a real Tailwind color; use slate-*" }];
const DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, files);
    else if (EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) files.push(path);
  }
  return files;
}

let violations = 0;

for (const dir of DIRS) {
  for (const file of walk(dir)) {
    const content = readFileSync(file, "utf8");
    for (const { pattern, reason } of BANNED) {
      const matches = content.match(pattern);
      if (matches) {
        violations += matches.length;
        console.error(`${file}: found ${matches.join(", ")} — ${reason}`);
      }
    }
  }
}

if (violations > 0) {
  console.error(`\n${violations} banned class usage(s) found.`);
  process.exit(1);
}
