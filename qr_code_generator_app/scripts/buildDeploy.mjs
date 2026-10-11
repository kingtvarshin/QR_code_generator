import { spawnSync } from "node:child_process";

// `VAR=value command` isn't valid on Windows' cmd.exe (what npm scripts run under
// by default there), so DEPLOY=1 is set here rather than inline in package.json —
// same reasoning as scripts/preview.mjs. Runs `npm run build` (not `next build`
// directly) so npm's own `prebuild` lifecycle hook (which stamps the service
// worker's cache name) still fires.
process.env.DEPLOY = "1";

const result = spawnSync("npm", ["run", "build"], { stdio: "inherit", env: process.env, shell: true });
process.exit(result.status ?? 1);
